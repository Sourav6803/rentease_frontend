'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  Mail, Phone, MapPin, ChevronRight,
  Shield, Clock, CreditCard, Sparkles,
  ArrowUp, Heart, ThumbsUp, Gift, Star,
  Zap,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useState, useEffect, useCallback, memo } from 'react'

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// All values are functions of `dark: boolean` so we get full theme support
const tok = (dark: boolean) => ({
  // Brand
  blue:        '#2874F0',
  blueDark:    '#1A5DC8',
  blueDeep:    '#0D47A1',
  yellow:      '#FFD700',
  yellowDark:  '#F9A825',

  // Surfaces
  bg:          dark ? '#0F1923' : '#F1F3F6',
  bgCard:      dark ? '#162032' : '#FFFFFF',
  bgCardHover: dark ? '#1C2B40' : '#F7F9FC',
  bgTop:       dark ? '#0A1520' : '#FFFFFF',

  // Dividers / borders
  border:      dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',
  borderHover: dark ? 'rgba(255,255,255,0.18)' : 'rgba(40,116,240,0.3)',

  // Text
  text:        dark ? '#E8EDF5' : '#212121',
  textMid:     dark ? '#A0AABB' : '#555555',
  textMuted:   dark ? '#6B7A90' : '#888888',

  // Misc
  shadow:      dark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.08)',
  white:       '#FFFFFF',
  red:         '#E53935',
  green:       '#2ECC71',
})

// ─── DATA ─────────────────────────────────────────────────────────────────────
const footerNav = {
  company: {
    title: 'Company',
    links: [
      { name: 'About Us',   href: '/about' },
      { name: 'Careers',    href: '/careers',  badge: "We're Hiring", badgeGreen: true },
      { name: 'Press',      href: '/press' },
      { name: 'Blog',       href: '/blog' },
      { name: 'Contact',    href: '/contact' },
    ],
  },
  products: {
    title: 'Products',
    links: [
      { name: 'Furniture',    href: '/products?category=furniture' },
      { name: 'Appliances',   href: '/products?category=appliances' },
      { name: 'Electronics',  href: '/products?category=electronics' },
      { name: 'New Arrivals', href: '/products?sort=newest', badge: 'New', badgeGreen: false },
      { name: 'Popular Items',href: '/products?sort=popular' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { name: 'Help Center',  href: '/help' },
      { name: 'Shipping Info',href: '/shipping' },
      { name: 'Returns',      href: '/returns' },
      { name: 'Report Issue', href: '/report' },
      { name: 'Live Chat',    href: '/chat', badge: 'Online', badgeGreen: true },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy',   href: '/privacy' },
      { name: 'Cookie Policy',    href: '/cookies' },
      { name: 'Security',         href: '/security' },
      { name: 'GDPR',             href: '/gdpr' },
    ],
  },
}

const socialLinks = [
  { name: 'Facebook',  icon: Facebook,  href: 'https://facebook.com',  color: '#1877F2' },
  { name: 'Twitter',   icon: Twitter,   href: 'https://twitter.com',   color: '#1DA1F2' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: '#E4405F' },
  { name: 'LinkedIn',  icon: Linkedin,  href: 'https://linkedin.com',  color: '#0A66C2' },
  { name: 'YouTube',   icon: Youtube,   href: 'https://youtube.com',   color: '#FF0000' },
]

const trustBadges = [
  { icon: Shield,     label: 'Secure Payments', desc: '100% secure transactions', color: '#2874F0' },
  { icon: Clock,      label: '24/7 Support',    desc: 'Round-the-clock help',      color: '#2ECC71' },
  { icon: CreditCard, label: 'Easy Returns',    desc: '7-day return policy',       color: '#9B59B6' },
  { icon: Sparkles,   label: 'Quality Assured', desc: 'All products verified',     color: '#FFD700' },
]

const stats = [
  { value: '50K+', label: 'Happy Customers', icon: ThumbsUp, color: '#2874F0' },
  { value: '10K+', label: 'Products Rented',  icon: Gift,     color: '#FFD700' },
  { value: '98%',  label: 'Satisfaction',     icon: Star,     color: '#E53935' },
  { value: '24/7', label: 'Support',          icon: Clock,    color: '#2ECC71' },
]

const payments = ['Visa', 'Mastercard', 'UPI', 'Razorpay', 'Paytm', 'GPay']

// ─── HEADSET ICON (inline SVG) ────────────────────────────────────────────────
function HeadsetSvg({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 0 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
    </svg>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = memo(({ stat, t }: { stat: typeof stats[0]; t: ReturnType<typeof tok> }) => {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign:     'center',
        padding:       '20px 16px',
        borderRadius:  '10px',
        background:    hover ? t.bgCardHover : t.bgCard,
        border:        `1px solid ${hover ? t.borderHover : t.border}`,
        boxShadow:     hover ? t.shadow : 'none',
        transition:    'all 0.22s ease',
        cursor:        'default',
      }}
    >
      <div style={{
        width:         '44px', height:'44px',
        borderRadius:  '50%',
        background:    `${stat.color}18`,
        display:       'flex', alignItems:'center', justifyContent:'center',
        margin:        '0 auto 10px',
        transform:     hover ? 'scale(1.1)' : 'scale(1)',
        transition:    'transform 0.22s ease',
      }}>
        <stat.icon size={20} color={stat.color} />
      </div>
      <p style={{ fontSize:'24px', fontWeight:800, color: t.text, lineHeight:1, margin:'0 0 4px' }}>
        {stat.value}
      </p>
      <p style={{ fontSize:'12px', color: t.textMuted, margin:0 }}>{stat.label}</p>
    </div>
  )
})
StatCard.displayName = 'StatCard'

// ─── TRUST BADGE ─────────────────────────────────────────────────────────────
const TrustBadge = memo(({ badge, t }: { badge: typeof trustBadges[0]; t: ReturnType<typeof tok> }) => {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '12px',
        padding:       '14px 16px',
        borderRadius:  '10px',
        background:    hover ? t.bgCardHover : t.bgCard,
        border:        `1px solid ${hover ? badge.color + '40' : t.border}`,
        boxShadow:     hover ? `0 4px 20px ${badge.color}20` : 'none',
        transition:    'all 0.22s ease',
        cursor:        'default',
      }}
    >
      <div style={{
        width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
        background: `${badge.color}18`,
        display:'flex', alignItems:'center', justifyContent:'center',
        transform: hover ? 'scale(1.12)' : 'scale(1)',
        transition: 'transform 0.22s ease',
      }}>
        <badge.icon size={18} color={badge.color} />
      </div>
      <div>
        <p style={{ fontSize:'13px', fontWeight:700, color:t.text, margin:'0 0 2px' }}>{badge.label}</p>
        <p style={{ fontSize:'11px', color:t.textMuted, margin:0 }}>{badge.desc}</p>
      </div>
    </div>
  )
})
TrustBadge.displayName = 'TrustBadge'

// ─── NAV LINK ─────────────────────────────────────────────────────────────────
const NavLink = memo(({ link, t }: { link: any; t: ReturnType<typeof tok> }) => {
  const [hover, setHover] = useState(false)
  return (
    <li>
      <Link
        href={link.href}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          fontSize:       '13px',
          color:          hover ? t.blue : t.textMid,
          textDecoration: 'none',
          padding:        '4px 0',
          transition:     'color 0.18s',
          gap:            '6px',
        }}
      >
        <span style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <ChevronRight
            size={12}
            color={t.blue}
            style={{
              opacity:   hover ? 1 : 0,
              transform: hover ? 'translateX(0)' : 'translateX(-6px)',
              transition:'all 0.18s ease',
              flexShrink:0,
            }}
          />
          {link.name}
        </span>
        {link.badge && (
          <span style={{
            fontSize:     '10px',
            fontWeight:   700,
            padding:      '2px 7px',
            borderRadius: '20px',
            background:   link.badgeGreen ? '#2ECC7120' : '#2874F018',
            color:        link.badgeGreen ? '#2ECC71'   : t.blue,
            border:       `1px solid ${link.badgeGreen ? '#2ECC7140' : t.blue + '30'}`,
            whiteSpace:   'nowrap',
            flexShrink:   0,
          }}>
            {link.badge}
          </span>
        )}
      </Link>
    </li>
  )
})
NavLink.displayName = 'NavLink'

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
const Newsletter = memo(({ t }: { t: ReturnType<typeof tok> }) => {
  const [email, setEmail]           = useState('')
  const [busy, setBusy]             = useState(false)
  const [done, setDone]             = useState(false)
  const [focused, setFocused]       = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    await new Promise(r => setTimeout(r, 900))
    toast.success('Subscribed!', { description: 'Thank you for subscribing.' })
    setDone(true)
    setEmail('')
    setBusy(false)
    setTimeout(() => setDone(false), 4000)
  }

  return (
    <div style={{
      borderRadius:  '12px',
      background:    `linear-gradient(135deg, ${t.blue}18 0%, ${t.blue}08 50%, transparent 100%)`,
      border:        `1px solid ${t.blue}30`,
      padding:       'clamp(20px, 4vw, 36px)',
      position:      'relative',
      overflow:      'hidden',
    }}>
      {/* Decorative corner accent */}
      <div style={{
        position:'absolute', top:0, right:0,
        width:'120px', height:'120px',
        background:`radial-gradient(circle at top right, ${t.yellow}18, transparent 70%)`,
        pointerEvents:'none',
      }} />

      <div style={{
        display:       'flex',
        flexWrap:      'wrap',
        gap:           '24px',
        alignItems:    'center',
      }}>
        {/* Text side */}
        <div style={{ flex:'1 1 240px', minWidth:0 }}>
          <div style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          '6px',
            padding:      '3px 10px',
            borderRadius: '20px',
            background:   `${t.blue}15`,
            marginBottom: '10px',
          }}>
            <Zap size={12} color={t.blue} />
            <span style={{ fontSize:'11px', fontWeight:700, color:t.blue, letterSpacing:'0.5px', textTransform:'uppercase' }}>
              Stay Updated
            </span>
          </div>
          <h3 style={{ fontSize:'clamp(16px,2.5vw,22px)', fontWeight:800, color:t.text, margin:'0 0 6px', lineHeight:1.2 }}>
            Subscribe to Our Newsletter
          </h3>
          <p style={{ fontSize:'13px', color:t.textMuted, margin:0, lineHeight:1.5 }}>
            Get exclusive deals, new arrivals & rental tips delivered to your inbox.
          </p>
        </div>

        {/* Form side */}
        <form onSubmit={handleSubmit} style={{ flex:'1 1 300px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 180px', position:'relative' }}>
            <Mail size={15} color={t.textMuted} style={{
              position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none',
            }} />
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              required
              style={{
                width:       '100%',
                height:      '42px',
                paddingLeft: '36px',
                paddingRight:'12px',
                borderRadius:'6px',
                border:      `1.5px solid ${focused ? t.blue : t.border}`,
                background:  t.bgCard,
                color:       t.text,
                fontSize:    '13px',
                outline:     'none',
                boxSizing:   'border-box',
                transition:  'border 0.2s',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            style={{
              height:        '42px',
              padding:       '0 20px',
              borderRadius:  '6px',
              background:    done
                ? '#2ECC71'
                : `linear-gradient(135deg, ${t.blue} 0%, ${t.blueDeep} 100%)`,
              color:         '#fff',
              fontSize:      '13px',
              fontWeight:    700,
              border:        'none',
              cursor:        busy ? 'not-allowed' : 'pointer',
              opacity:       busy ? 0.75 : 1,
              flexShrink:    0,
              transition:    'background 0.3s, opacity 0.2s',
              display:       'flex',
              alignItems:    'center',
              gap:           '6px',
              whiteSpace:    'nowrap',
            }}
          >
            {done ? '✓ Subscribed' : busy ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  )
})
Newsletter.displayName = 'Newsletter'

// ─── MAIN FOOTER ──────────────────────────────────────────────────────────────
export function Footer() {
  const [mounted,     setMounted]     = useState(false)
  const [year,        setYear]        = useState(2024)
  const [showTop,     setShowTop]     = useState(false)
  const { resolvedTheme }             = useTheme()
  const pathname                      = usePathname()

  useEffect(() => { setMounted(true); setYear(new Date().getFullYear()) }, [])
  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [])

  if (
    !mounted ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/vendor') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/delivery') ||
    pathname?.startsWith('/verify-email')
  ) return null

  const dark = resolvedTheme === 'dark'
  const t    = tok(dark)

  // ── Shared container style ─────────────────────────────────────────────────
  const wrap: React.CSSProperties = {
    maxWidth: '1280px',
    margin:   '0 auto',
    padding:  '0 16px',
  }

  return (
    <footer style={{ background: t.bg, borderTop: `3px solid ${t.blue}`, position:'relative' }}>

      {/* ── STATS ROW ────────────────────────────────────────────────────── */}
      <div style={{ ...wrap, padding:'32px 16px' }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap:                 '12px',
        }}>
          {stats.map(s => <StatCard key={s.label} stat={s} t={t} />)}
        </div>
      </div>

      {/* ── TRUST BADGES ─────────────────────────────────────────────────── */}
      <div style={{
        borderTop:    `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ ...wrap, padding:'24px 16px' }}>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap:                 '12px',
          }}>
            {trustBadges.map(b => <TrustBadge key={b.label} badge={b} t={t} />)}
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div style={{ ...wrap, padding:'40px 16px 32px' }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap:                 '32px 24px',
        }}>

          {/* Brand column */}
          <div style={{ gridColumn: 'span 1', minWidth:0 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration:'none', display:'inline-block', marginBottom:'16px' }}>
              <span style={{
                fontFamily:   'Georgia, serif',
                fontSize:     '26px',
                fontWeight:   900,
                color:        t.blue,
                letterSpacing:'-0.5px',
              }}>
                Rent<span style={{ color: t.yellow }}>Ease</span>
                <span style={{
                  display:'inline-block', width:'7px', height:'7px',
                  borderRadius:'50%', background:t.yellow,
                  marginLeft:'2px', verticalAlign:'super', fontSize:'7px',
                }} />
              </span>
            </Link>

            <p style={{ fontSize:'13px', color:t.textMid, lineHeight:1.65, margin:'0 0 20px' }}>
              Rent furniture & appliances on flexible monthly plans. Affordable, convenient, and completely hassle-free.
            </p>

            {/* Contact */}
            {[
              { icon: MapPin, text: '123 Business Park, Sector 62, Noida, UP 201309', href: undefined },
              { icon: Phone,  text: '+91 98765 43210',        href: 'tel:+919876543210' },
              { icon: Mail,   text: 'support@rentease.com',   href: 'mailto:support@rentease.com' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px' }}>
                <div style={{
                  width:'28px', height:'28px', borderRadius:'6px', flexShrink:0,
                  background:`${t.blue}15`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  marginTop:'1px',
                }}>
                  <item.icon size={13} color={t.blue} />
                </div>
                {item.href
                  ? <a href={item.href} style={{ fontSize:'12px', color:t.textMid, textDecoration:'none', lineHeight:1.5 }}>{item.text}</a>
                  : <span style={{ fontSize:'12px', color:t.textMid, lineHeight:1.5 }}>{item.text}</span>
                }
              </div>
            ))}

            {/* Social icons */}
            <div style={{ display:'flex', gap:'8px', marginTop:'8px', flexWrap:'wrap' }}>
              {socialLinks.map(s => (
                <SocialIcon key={s.name} link={s} t={t} />
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerNav).map(([key, section]) => (
            <div key={key} style={{ minWidth:0 }}>
              <div style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '7px',
                marginBottom: '14px',
                paddingBottom:'10px',
                borderBottom: `2px solid ${t.blue}`,
              }}>
                <span style={{
                  fontSize:      '12px',
                  fontWeight:    800,
                  color:         t.blue,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}>
                  {section.title}
                </span>
              </div>
              <ul style={{ listStyle:'none', margin:0, padding:0 }}>
                {section.links.map((link: any) => (
                  <NavLink key={link.href} link={link} t={t} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{ marginTop:'40px' }}>
          <Newsletter t={t} />
        </div>
      </div>

      {/* ── BOTTOM BAR ───────────────────────────────────────────────────── */}
      <div style={{
        borderTop:  `1px solid ${t.border}`,
        background: dark ? '#080E1A' : '#E8ECF4',
      }}>
        <div style={{ ...wrap, padding:'14px 16px' }}>
          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            '12px',
          }}>
            {/* Left: copyright */}
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'12px', color:t.textMuted }}>
                © {year} RentEase. All rights reserved.
              </span>
              <span style={{
                width:'1px', height:'14px',
                background: t.border,
                display:'inline-block',
              }} />
              <span style={{ fontSize:'12px', color:t.textMuted, display:'flex', alignItems:'center', gap:'4px' }}>
                Made with <Heart size={11} color="#E53935" fill="#E53935" /> in India
              </span>
            </div>

            {/* Right: payments + back-to-top */}
            <div style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'11px', color:t.textMuted, whiteSpace:'nowrap' }}>We Accept:</span>
                {payments.map(p => (
                  <span key={p} style={{
                    fontSize:     '10px',
                    fontWeight:   700,
                    padding:      '3px 8px',
                    borderRadius: '4px',
                    border:       `1px solid ${t.border}`,
                    background:   t.bgCard,
                    color:        t.textMid,
                    whiteSpace:   'nowrap',
                  }}>
                    {p}
                  </span>
                ))}
              </div>

              <BackToTop show={showTop} onClick={scrollToTop} t={t} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── SOCIAL ICON ──────────────────────────────────────────────────────────────
function SocialIcon({ link, t }: { link: typeof socialLinks[0]; t: ReturnType<typeof tok> }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.name}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width:         '34px', height:'34px',
        borderRadius:  '8px',
        display:       'flex', alignItems:'center', justifyContent:'center',
        background:    hover ? link.color : `${link.color}18`,
        border:        `1px solid ${hover ? link.color : link.color + '30'}`,
        transition:    'all 0.2s ease',
        transform:     hover ? 'translateY(-2px)' : 'none',
        flexShrink:    0,
      }}
    >
      <link.icon size={15} color={hover ? '#fff' : link.color} />
    </a>
  )
}

// ─── BACK TO TOP ──────────────────────────────────────────────────────────────
function BackToTop({ show, onClick, t }: { show: boolean; onClick: () => void; t: ReturnType<typeof tok> }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      aria-label="Back to top"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width:         '34px', height:'34px',
        borderRadius:  '8px',
        display:       'flex', alignItems:'center', justifyContent:'center',
        background:    hover ? t.blue : t.bgCard,
        border:        `1px solid ${hover ? t.blue : t.border}`,
        color:         hover ? '#fff' : t.textMid,
        cursor:        'pointer',
        transition:    'all 0.22s ease',
        opacity:       show ? 1 : 0.4,
        transform:     hover ? 'translateY(-2px)' : 'none',
        flexShrink:    0,
      }}
    >
      <ArrowUp size={15} />
    </button>
  )
}