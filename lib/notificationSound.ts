'use client'

/**
 * Notification sound utility.
 * 
 * Logic:
 * 1. Try to play /notification.mp3 if it exists (Priority).
 * 2. Fallback to Web Audio API (Ascending Sine Tones) if MP3 fails.
 */

const MUTE_KEY = 'rentease_notif_sound_muted'
const SOUND_URL = '/notification.mp3'

let audioCtx: AudioContext | null = null
let unlockBound = false

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as any).webkitAudioContext
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

async function unlock(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch (e) {
      console.warn('[audio] Context resume blocked', e)
    }
  }
}

export function initNotificationSound() {
  if (typeof window === 'undefined' || unlockBound) return
  unlockBound = true
  const handler = () => {
    unlock()
  }
  window.addEventListener('pointerdown', handler, { passive: true })
  window.addEventListener('keydown', handler, { passive: true })
  window.addEventListener('click', handler, { passive: true })
}

export function isNotificationSoundMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MUTE_KEY) === '1'
}

async function playSynthesizedChime(ctx: AudioContext) {
  const now = ctx.currentTime
  const master = ctx.createGain()
  master.gain.value = 0.2
  master.connect(ctx.destination)

  const tones = [
    { freq: 880, start: 0, dur: 0.12 }, 
    { freq: 1174.66, start: 0.11, dur: 0.18 }
  ]

  for (const { freq, start, dur } of tones) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + start)
    gain.gain.setValueAtTime(0.0001, now + start)
    gain.gain.exponentialRampToValueAtTime(1, now + start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now + start)
    osc.stop(now + start + dur + 0.02)
  }
}

export async function playNotificationSound() {
  if (typeof window === 'undefined' || isNotificationSoundMuted()) return

  const ctx = getAudioContext()
  if (!ctx) return
  
  if (ctx.state !== 'running') {
    await unlock()
    const resumed = getAudioContext()
    if (!resumed || resumed.state !== 'running') return
  }

  try {
    const response = await fetch(SOUND_URL, { method: 'HEAD' })
    if (response.ok) {
      const audio = new Audio(SOUND_URL)
      await audio.play()
    } else {
      await playSynthesizedChime(ctx)
    }
  } catch (err) {
    console.warn('[push] MP3 play failed, falling back to synth', err)
    try {
      await playSynthesizedChime(ctx)
    } catch (synthErr) {
      console.error('[push] All sound methods failed', synthErr)
    }
  }
}
