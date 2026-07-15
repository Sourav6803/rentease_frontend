

'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'


// ─── Copy carousel messages ────────────────────────────────────────────────────
const MESSAGES = [
  'Curating your perfect rentals…',
  'Checking real-time availability…',
  'Fetching the best deals for you…',
  'Almost there — setting things up…',
  'Personalising your experience…',
]

// ─── Skeleton card component ───────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="re-skeleton-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="re-sk-img" />
      <div className="re-sk-body">
        <div className="re-sk-line re-sk-line--wide" />
        <div className="re-sk-line re-sk-line--mid" />
        <div className="re-sk-footer">
          <div className="re-sk-pill" />
          <div className="re-sk-price" />
        </div>
      </div>
    </div>
  )
}

// ─── Floating icon set ─────────────────────────────────────────────────────────
function FloatingIcons() {
  const icons = [
    { emoji: '📦', x: '8%',  y: '18%', size: 28, delay: 0 },
    { emoji: '🚚', x: '88%', y: '12%', size: 24, delay: 600 },
    { emoji: '🛋️', x: '5%',  y: '72%', size: 22, delay: 1200 },
    { emoji: '📷', x: '92%', y: '68%', size: 26, delay: 300 },
    { emoji: '🎮', x: '50%', y: '8%',  size: 20, delay: 900 },
    { emoji: '🏕️', x: '78%', y: '85%', size: 23, delay: 450 },
  ]
  return (
    <>
      {icons.map((ic, i) => (
        <span
          key={i}
          className="re-float-icon"
          style={{
            left: ic.x,
            top: ic.y,
            fontSize: ic.size,
            animationDelay: `${ic.delay}ms`,
          }}
        >
          {ic.emoji}
        </span>
      ))}
    </>
  )
}

// ─── Main Loading Component ────────────────────────────────────────────────────
export default function Loading() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length)
        setFade(true)
      }, 350)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* ── Inline styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --re-amber: #f59e0b;
          --re-amber-light: #fde68a;
          --re-amber-dark: #b45309;
          --re-slate: #0f172a;
          --re-slate-mid: #1e293b;
          --re-slate-soft: #334155;
          --re-cream: #fffbf2;
          --re-card: #ffffff;
          --re-shimmer: linear-gradient(
            90deg,
            #f1f5f9 0%,
            #e2e8f0 40%,
            #f1f5f9 80%
          );
        }

        /* ── Page ── */
        .re-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--re-cream);
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Background mesh ── */
        .re-bg-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .re-bg-mesh::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
          top: -180px; left: -180px;
          animation: re-drift 8s ease-in-out infinite alternate;
        }
        .re-bg-mesh::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%);
          bottom: -120px; right: -120px;
          animation: re-drift 10s ease-in-out infinite alternate-reverse;
        }
        @keyframes re-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }

        /* ── Grid dots ── */
        .re-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: radial-gradient(circle, rgba(245,158,11,0.18) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        /* ── Floating icons ── */
        .re-float-icon {
          position: absolute;
          z-index: 1;
          opacity: 0.18;
          animation: re-float 5s ease-in-out infinite alternate;
          user-select: none;
          filter: grayscale(0.3);
        }
        @keyframes re-float {
          from { transform: translateY(0px) rotate(-4deg); opacity: 0.15; }
          to   { transform: translateY(-14px) rotate(4deg); opacity: 0.25; }
        }

        /* ── Center stage ── */
        .re-center {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: 0 20px;
          width: 100%;
          max-width: 560px;
        }

        /* ── Logo mark ── */
        .re-logomark {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 36px;
          animation: re-fadein 0.6s ease both;
        }
        .re-logomark-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: var(--re-slate);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(15,23,42,0.2);
          position: relative;
          overflow: hidden;
        }
        .re-logomark-icon::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(245,158,11,0.4) 0%, transparent 60%);
        }
        .re-logomark-icon span { font-size: 24px; position: relative; z-index: 1; }
        .re-logomark-text {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--re-slate);
          letter-spacing: -0.5px;
        }
        .re-logomark-text em {
          font-style: normal;
          color: var(--re-amber-dark);
        }

        /* ── Spinner ring ── */
        .re-spinner-wrap {
          position: relative;
          width: 80px; height: 80px;
          margin-bottom: 28px;
          animation: re-fadein 0.7s ease 0.15s both;
        }
        .re-ring-outer {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(245,158,11,0.15);
          border-top-color: var(--re-amber);
          animation: re-spin 1.1s linear infinite;
        }
        .re-ring-inner {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          border: 2px solid rgba(79,70,229,0.12);
          border-bottom-color: #6366f1;
          animation: re-spin 1.8s linear infinite reverse;
        }
        .re-ring-dot {
          position: absolute;
          inset: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--re-amber), #fb923c);
          box-shadow: 0 0 16px rgba(245,158,11,0.5);
          animation: re-pulse 1.8s ease-in-out infinite;
        }
        @keyframes re-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes re-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.85); opacity: 0.7; }
        }
        @keyframes re-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Message ── */
        .re-message {
          text-align: center;
          margin-bottom: 10px;
          animation: re-fadein 0.7s ease 0.25s both;
        }
        .re-message h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 4vw, 26px);
          font-weight: 600;
          color: var(--re-slate);
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }
        .re-message p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 300;
          letter-spacing: 0.1px;
          min-height: 22px;
          transition: opacity 0.3s ease;
        }
        .re-message p.fade-out { opacity: 0; }
        .re-message p.fade-in  { opacity: 1; }

        /* ── Progress bar ── */
        .re-progress-wrap {
          width: 220px;
          height: 3px;
          border-radius: 99px;
          background: rgba(245,158,11,0.15);
          overflow: hidden;
          margin: 20px auto 36px;
          animation: re-fadein 0.7s ease 0.3s both;
        }
        .re-progress-bar {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--re-amber), #fb923c);
          animation: re-progress 2.8s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(245,158,11,0.5);
        }
        @keyframes re-progress {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 70%;  margin-left: 0; }
          100% { width: 0%;   margin-left: 100%; }
        }

        /* ── Skeleton cards ── */
        .re-cards-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          width: 100%;
          animation: re-fadein 0.8s ease 0.4s both;
        }
        .re-skeleton-card {
          background: var(--re-card);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(15,23,42,0.07), 0 0 0 1px rgba(15,23,42,0.04);
          flex: 1;
          max-width: 160px;
          opacity: 0;
          animation: re-fadein 0.6s ease forwards;
        }
        .re-sk-img {
          height: 100px;
          background: var(--re-shimmer);
          background-size: 200% 100%;
          animation: re-shimmer 1.6s ease-in-out infinite;
        }
        .re-sk-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .re-sk-line {
          height: 10px;
          border-radius: 6px;
          background: var(--re-shimmer);
          background-size: 200% 100%;
          animation: re-shimmer 1.6s ease-in-out infinite;
        }
        .re-sk-line--wide { width: 85%; }
        .re-sk-line--mid  { width: 55%; }
        .re-sk-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }
        .re-sk-pill {
          height: 18px; width: 50px;
          border-radius: 99px;
          background: var(--re-shimmer);
          background-size: 200% 100%;
          animation: re-shimmer 1.6s ease-in-out infinite;
        }
        .re-sk-price {
          height: 14px; width: 40px;
          border-radius: 6px;
          background: var(--re-shimmer);
          background-size: 200% 100%;
          animation: re-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes re-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Tagline ── */
        .re-tagline {
          margin-top: 28px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #94a3b8;
          animation: re-fadein 1s ease 0.6s both;
        }
        .re-tagline span {
          color: var(--re-amber-dark);
          margin: 0 4px;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .re-cards-row { gap: 10px; }
          .re-skeleton-card { max-width: 130px; }
          .re-sk-img { height: 80px; }
          .re-logomark-text { font-size: 22px; }
        }
        @media (max-width: 360px) {
          .re-cards-row { gap: 8px; }
          .re-skeleton-card:nth-child(3) { display: none; }
        }
      `}</style>

      <div className="re-page" role="status" aria-label="Loading RentEase">
        {/* Background layers */}
        <div className="re-bg-mesh" aria-hidden="true" />
        <div className="re-dots" aria-hidden="true" />
        <FloatingIcons />

        {/* Center content */}
        <div className="re-center">

          {/* Logo */}
          <div className="re-logomark">
            <div className="re-logomark-icon">
              {/* <span>🏷️</span> */}
              <span>
                <Image
                  src="/icon.svg"
                  alt="Loading"
                  width={80}
                  height={80}
                  className=""
                />
              </span>
            </div>
            <span className="re-logomark-text">
              Rent<em>Ease</em>
            </span>
          </div>

          {/* Spinner */}
          <div className="re-spinner-wrap" aria-hidden="true">
            <div className="re-ring-outer" />
            <div className="re-ring-inner" />
            <div className="re-ring-dot" />
          </div>

          {/* Dynamic message */}
          <div className="re-message">
            <h2>Good things take a moment</h2>
            <p className={fade ? 'fade-in' : 'fade-out'}>
              {MESSAGES[msgIndex]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="re-progress-wrap" aria-hidden="true">
            <div className="re-progress-bar" />
          </div>

          {/* Skeleton preview cards */}
          <div className="re-cards-row" aria-hidden="true">
            <SkeletonCard delay={0} />
            <SkeletonCard delay={120} />
            <SkeletonCard delay={240} />
          </div>

          {/* Tagline */}
          <p className="re-tagline">
            Rent<span>·</span>Enjoy<span>·</span>Return
          </p>
        </div>
      </div>
    </>
  )
}