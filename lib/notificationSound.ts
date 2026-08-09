'use client'

/**
 * Notification sound for real-time push/in-app notifications.
 *
 * Plays a short two-tone chime (à la Flipkart/Amazon "ding") using the Web
 * Audio API so we don't ship a binary asset and it works offline. Browsers
 * block audio until the user has interacted with the page, so we lazily unlock
 * the AudioContext on the first user gesture.
 *
 * A user preference (persisted in localStorage) can mute the sound.
 */

const MUTE_KEY = 'rentease_notif_sound_muted'

let audioCtx: AudioContext | null = null
let unlockBound = false

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) {
    try {
      audioCtx = new Ctor()
    } catch {
      return null
    }
  }
  return audioCtx
}

/**
 * Resume/unlock the AudioContext. Must run inside a user-gesture handler the
 * first time; after that the context stays unlocked for the session.
 */
async function unlock(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    // Await the resume: callers (playNotificationSound) re-check ctx.state
    // immediately after, and that check is only meaningful once the promise
    // settles. Fire-and-forget left the context 'suspended' on the same tick.
    try {
      await ctx.resume()
    } catch {
      /* autoplay still blocked — leave the context suspended */
    }
  }
}

/**
 * Bind a one-time-ish set of gesture listeners that unlock audio. Safe to call
 * repeatedly; listeners are only attached once.
 */
export function initNotificationSound() {
  if (typeof window === 'undefined' || unlockBound) return
  unlockBound = true
  const handler = () => unlock()
  window.addEventListener('pointerdown', handler, { passive: true })
  window.addEventListener('keydown', handler, { passive: true })
  window.addEventListener('touchstart', handler, { passive: true })
}

export function isNotificationSoundMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setNotificationSoundMuted(muted: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
}

/**
 * Play the notification chime. No-op on the server, when muted, or when the
 * AudioContext could not be unlocked yet.
 */
export async function playNotificationSound() {
  if (typeof window === 'undefined' || isNotificationSoundMuted()) return

  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state !== 'running') {
    // Not yet unlocked by a user gesture — try to resume and WAIT for it to
    // settle before deciding whether we can play. The old fire-and-forget
    // resume left ctx.state === 'suspended' on this tick, so the first
    // notification chime was silently dropped.
    await unlock()
    // Re-read the live value via the helper: TS narrows `ctx.state` to
    // 'suspended' here and holds that across the await, so comparing it again
    // would be a constant. unlock() may still have been blocked by autoplay,
    // so a fresh read is the meaningful check.
    const resumed = getAudioContext()
    if (!resumed || resumed.state !== 'running') return
  }

  const now = ctx.currentTime
  const master = ctx.createGain()
  master.gain.value = 0.0001
  master.connect(ctx.destination)

  // Two ascending tones: a pleasant "ti-dum".
  const tones: Array<{ freq: number; start: number; dur: number }> = [
    { freq: 880, start: 0, dur: 0.12 }, // A5
    { freq: 1174.66, start: 0.11, dur: 0.18 }, // D6
  ]

  const peak = 0.22
  for (const { freq, start, dur } of tones) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + start)

    // Quick attack, smooth exponential release — avoids clicks.
    gain.gain.setValueAtTime(0.0001, now + start)
    gain.gain.exponentialRampToValueAtTime(peak, now + start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)

    osc.connect(gain)
    gain.connect(master)
    osc.start(now + start)
    osc.stop(now + start + dur + 0.02)
  }

  master.gain.setValueAtTime(1, now)
}
