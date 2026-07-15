
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, Shield,
  ArrowRight, Smartphone, Users, Package,
  AlertCircle, Loader2, Clock,
  ShoppingBag, TrendingUp, CheckCircle2,
  Zap, HeadphonesIcon, Award,
  MapPin, Truck, RefreshCcw
} from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').or(z.literal('')).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
})

type LoginFormValues = z.infer<typeof loginSchema>

const adminStats = [
  { label: 'Active Vendors', value: '2,345', change: '+12.5%', icon: Users, color: '#2874f0' },
  { label: 'Products Listed', value: '12,456', change: '+23.1%', icon: Package, color: '#ff6161' },
  { label: 'Monthly Revenue', value: '₹45.2L', change: '+18.7%', icon: TrendingUp, color: '#00b96b' },
  { label: 'Active Rentals', value: '3,421', change: '+8.3%', icon: ShoppingBag, color: '#ff9f00' },
]

const highlights = [
  { icon: Zap, title: 'Instant Analytics', desc: 'Real-time platform insights' },
  { icon: Shield, title: 'Secure Access', desc: 'Enterprise-grade protection' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always-on operations team' },
  { icon: Award, title: 'Top Rated', desc: '#1 rental management platform' },
]

const trustBadges = [
  { icon: Truck, text: 'Pan-India Coverage' },
  { icon: RefreshCcw, text: 'Real-time Sync' },
  { icon: MapPin, text: '500+ Cities' },
]

const recentActivity = [
  { text: 'Vendor "TechRent Delhi" onboarded', time: '2m ago', dot: '#00b96b' },
  { text: 'Payout of ₹1.2L processed', time: '18m ago', dot: '#2874f0' },
  { text: '47 new rental orders today', time: '1h ago', dot: '#ff9f00' },
  { text: 'Platform uptime: 99.97%', time: '2h ago', dot: '#00b96b' },
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email')
  const [mounted, setMounted] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', phone: '', password: '' },
    mode: 'onChange',
    shouldUnregister: false,
  })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (activeTab === 'email') { setValue('phone', ''); trigger('email') }
    else { setValue('email', ''); trigger('phone') }
  }, [activeTab, setValue, trigger])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      if (activeTab === 'email' && !data.email) throw new Error('Please enter your email address')
      if (activeTab === 'phone' && !data.phone) throw new Error('Please enter your phone number')

      const credentials: any = {
        password: data.password, loginType: 'super_admin',
        redirect: false, callbackUrl: '/admin/dashboard',
      }
      if (activeTab === 'email') credentials.email = data.email
      else credentials.phone = data.phone

      const result = await signIn('credentials', credentials)
      if (result?.error) throw new Error(result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error)
      if (!result?.ok) throw new Error('Login failed. Please try again.')

      toast.success('Login successful!', { description: 'Redirecting to dashboard...' })
      if (rememberMe) localStorage.setItem('admin_remember_me', 'true')
      else localStorage.removeItem('admin_remember_me')
      router.replace('/admin/dashboard')
    } catch (error: any) {
      toast.error('Login failed', { description: error.message || 'Invalid credentials.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#eef2fb', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Nunito:wght@700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .left-panel {
          background: linear-gradient(160deg, #2874f0 0%, #1a5dc8 55%, #0f3d9e 100%);
          border-radius: 20px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .left-panel::before {
          content: '';
          position: absolute;
          top: -100px; right: -80px;
          width: 340px; height: 340px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -130px; left: -70px;
          width: 420px; height: 420px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }
        .dots-bg {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          position: absolute;
          inset: 0;
          border-radius: 20px;
        }

        .stat-card {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 14px;
          padding: 16px;
          transition: all 0.2s ease;
          cursor: default;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.17);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 10px;
          transition: background 0.2s;
          cursor: default;
        }
        .highlight-item:hover { background: rgba(255,255,255,0.08); }

        .form-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 36px 30px;
          box-shadow: 0 4px 32px rgba(40,116,240,0.1), 0 1px 4px rgba(0,0,0,0.05);
          border: 1px solid rgba(40,116,240,0.1);
        }

        .tab-row { display: grid; grid-template-columns: 1fr 1fr; background: #f0f4ff; border-radius: 9px; padding: 3px; gap: 3px; }
        .tab-btn {
          padding: 9px 12px;
          border-radius: 7px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          color: #64748b;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .tab-btn.active {
          background: #ffffff;
          color: #2874f0;
          box-shadow: 0 1px 6px rgba(40,116,240,0.18);
        }
        .tab-btn:hover:not(.active) { color: #2874f0; background: rgba(255,255,255,0.6); }

        .field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; }
        .field-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border-radius: 8px;
          font-size: 13.5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          background: #f8faff;
          border: 1.5px solid #dde3ef;
        }
        .field-input::placeholder { color: #b0b9cc; }
        .field-input:focus {
          border-color: #2874f0;
          box-shadow: 0 0 0 3px rgba(40,116,240,0.1);
          background: #fff;
        }
        .field-input.has-error { border-color: #ef4444; background: #fff5f5; }
        .field-input.has-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .field-error { font-size: 11px; color: #ef4444; display: flex; align-items: center; gap: 4px; }

        .submit-btn {
          width: 100%; padding: 13.5px;
          border-radius: 9px; border: none; cursor: pointer;
          font-size: 14px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: 0.02em;
          color: white;
          background: linear-gradient(135deg, #2874f0 0%, #1755cc 100%);
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(40,116,240,0.3);
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1755cc 0%, #0f3fa8 100%);
          box-shadow: 0 6px 22px rgba(40,116,240,0.4);
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .top-nav {
          background: #2874f0;
          box-shadow: 0 2px 10px rgba(40,116,240,0.3);
        }
        .trust-strip {
          background: linear-gradient(90deg, #fffbeb, #fef3c7, #fffbeb);
          border-bottom: 1px solid #fcd34d;
        }
        .footer-bar {
          background: #fff;
          border-top: 1px solid #e2e8f0;
        }

        .divider { height: 1px; background: linear-gradient(90deg, transparent, #dde3ef, transparent); margin: 6px 0; }

        .mini-stat { background: #f0f4ff; border-radius: 10px; padding: 12px; text-align: center; }

        .link-hover { transition: color 0.15s; }
        .link-hover:hover { color: #2874f0 !important; }

        @keyframes liveDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .live-dot { animation: liveDot 2s ease-in-out infinite; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @media (max-width: 1024px) {
          .left-panel { display: none; }
          .main-grid { grid-template-columns: 1fr !important; max-width: 440px !important; }
        }
      `}</style>

      {/* TOP NAV */}
      <nav className="top-nav">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.18)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={17} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '18px', fontFamily: 'Nunito, sans-serif', letterSpacing: '-0.3px' }}>RentEase</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginLeft: '7px', fontWeight: 500 }}>Admin Console</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ color: '#a7f3d0', fontSize: '12px', fontWeight: 600 }}>All Systems Operational</span>
          </div>
        </div>
      </nav>

      {/* TRUST STRIP */}
      <div className="trust-strip" style={{ padding: '7px 28px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '36px', flexWrap: 'wrap' }}>
          {[...trustBadges, { icon: Award, text: 'Trusted by 2,000+ Vendors' }].map((b) => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <b.icon size={12} color="#92400e" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 28px 44px', display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 104px)' }}>
        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '28px', width: '100%', alignItems: 'stretch' }}>

          {/* LEFT */}
          <motion.div
            className="left-panel"
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="dots-bg" />

            {/* Hero */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 12px', marginBottom: '18px' }}>
                <Award size={11} color="#fbbf24" />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>India's #1 Rental Platform</span>
              </div>
              <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '34px', color: 'white', lineHeight: 1.18, marginBottom: '14px', letterSpacing: '-0.4px' }}>
                Power your rental<br />
                <span style={{ color: '#fde68a' }}>business forward.</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13.5px', lineHeight: 1.7, maxWidth: '380px', fontWeight: 400 }}>
                Complete control over vendors, inventory, payments, and analytics — all in one intelligent dashboard built for scale.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', position: 'relative', zIndex: 1 }}>
              {adminStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <stat.icon size={14} color="white" />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#86efac', background: 'rgba(134,239,172,0.15)', padding: '2px 8px', borderRadius: '20px' }}>
                      {stat.change}
                    </span>
                  </div>
                  <p style={{ fontSize: '21px', fontWeight: 900, color: 'white', fontFamily: 'Nunito, sans-serif' }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Highlights */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
                Why RentEase Admin?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {highlights.map((h, i) => (
                  <motion.div
                    key={h.title}
                    className="highlight-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.38 + i * 0.06 }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <h.icon size={13} color="rgba(255,255,255,0.85)" />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{h.title}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '1px' }}>{h.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', position: 'relative', zIndex: 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Activity</span>
                <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentActivity.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.dot, boxShadow: `0 0 5px ${item.dot}`, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', flex: 1 }}>{item.text}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div className="form-card">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'linear-gradient(135deg, #2874f0, #1755cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(40,116,240,0.3)', flexShrink: 0 }}>
                  <Shield size={19} color="white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', color: '#1e293b', lineHeight: 1 }}>Admin Sign In</h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', fontWeight: 500 }}>Secure · Encrypted · Role-based access</p>
                </div>
              </div>

              <div className="divider" />
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '10px 0 20px', lineHeight: 1.55 }}>
                Enter your credentials to access the RentEase management console.
              </p>

              {/* Tabs */}
              <div className="tab-row" style={{ marginBottom: '20px' }}>
                {(['email', 'phone'] as const).map((tab) => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'email' ? <Mail size={13} /> : <Smartphone size={13} />}
                    {tab === 'email' ? 'Email' : 'Phone'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Identifier */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                    className="field-wrap"
                  >
                    <label className="field-label">{activeTab === 'email' ? 'Email Address' : 'Phone Number'}</label>
                    <div style={{ position: 'relative' }}>
                      {activeTab === 'email' ? (
                        <>
                          <Mail size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                          <input
                            type="email"
                            placeholder="admin@rentease.com"
                            className={`field-input ${errors.email ? 'has-error' : ''}`}
                            {...register('email')}
                            disabled={isLoading}
                          />
                        </>
                      ) : (
                        <>
                          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '5px', pointerEvents: 'none' }}>
                            <Smartphone size={13} color="#94a3b8" />
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>+91</span>
                            <span style={{ width: '1px', height: '12px', background: '#dde3ef' }} />
                          </div>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            className={`field-input ${errors.phone ? 'has-error' : ''}`}
                            style={{ paddingLeft: '66px' }}
                            {...register('phone')}
                            disabled={isLoading}
                          />
                        </>
                      )}
                    </div>
                    {(errors.email || errors.phone) && (
                      <p className="field-error">
                        <AlertCircle size={11} />
                        {activeTab === 'email' ? errors.email?.message : errors.phone?.message}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Password */}
                <div className="field-wrap">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="field-label">Password</label>
                    <a href="/admin/forgot-password"
                      style={{ fontSize: '12px', color: '#2874f0', fontWeight: 600, textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                      Forgot?
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`field-input ${errors.password ? 'has-error' : ''}`}
                      style={{ paddingRight: '44px' }}
                      {...register('password')}
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', display: 'flex', alignItems: 'center' }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="field-error"><AlertCircle size={11} /> {errors.password.message}</p>
                  )}
                </div>

                {/* Remember */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    style={{
                      width: '17px', height: '17px', borderRadius: '4px', cursor: 'pointer', flexShrink: 0,
                      background: rememberMe ? '#2874f0' : '#f8faff',
                      border: rememberMe ? '1.5px solid #2874f0' : '1.5px solid #c8d4e8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}
                  >
                    {rememberMe && <CheckCircle2 size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span onClick={() => setRememberMe(!rememberMe)}
                    style={{ fontSize: '12.5px', color: '#64748b', cursor: 'pointer', userSelect: 'none', fontWeight: 500 }}>
                    Keep me signed in for 30 days
                  </span>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} className="submit-btn" style={{ marginTop: '2px' }}>
                  {isLoading
                    ? <><Loader2 size={15} className="spin" /> Authenticating...</>
                    : <>Sign in to Dashboard <ArrowRight size={15} /></>}
                </button>

                {/* Security */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e8edf5' }} />
                  <span style={{ padding: '0 12px', fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Secured</span>
                  <div style={{ flex: 1, height: '1px', background: '#e8edf5' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                  {[
                    { icon: Shield, label: '256-bit SSL' },
                    { icon: CheckCircle2, label: '2FA Ready' },
                    { icon: Clock, label: 'Auto Logout' },
                  ].map((b) => (
                    <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <b.icon size={12} color="#94a3b8" />
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            {/* Mini stats */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 12px rgba(40,116,240,0.07)', border: '1px solid rgba(40,116,240,0.08)' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Platform at a Glance</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Vendors', value: '2.3K+', color: '#2874f0' },
                  { label: 'Cities', value: '500+', color: '#ff9f00' },
                  { label: 'Uptime', value: '99.9%', color: '#00b96b' },
                ].map((s) => (
                  <div key={s.label} className="mini-stat">
                    <p style={{ fontSize: '16px', fontWeight: 900, color: s.color, fontFamily: 'Nunito, sans-serif' }}>{s.value}</p>
                    <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
              Need help?{' '}
              <a href="mailto:support@rentease.com" className="link-hover"
                style={{ color: '#2874f0', fontWeight: 600, textDecoration: 'none' }}>
                support@rentease.com
              </a>
              {' '}·{' '}
              <a href="#" className="link-hover" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer-bar" style={{ padding: '13px 28px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>© 2025 RentEase Technologies Pvt. Ltd. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '18px' }}>
            {['Terms', 'Privacy', 'Security', 'Status'].map((link) => (
              <a key={link} href="#" className="link-hover"
                style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}