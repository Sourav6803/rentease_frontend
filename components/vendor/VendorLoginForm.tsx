

// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { signIn } from 'next-auth/react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import { toast } from 'sonner'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Button,
// } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import {
//   Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, Building2,
//   TrendingUp, Package, BarChart2, Smartphone, RefreshCw, Monitor,
//   ShieldCheck, Star, ArrowRight, BadgeCheck, Clock, TriangleAlert,
//   ChevronRight, ChevronDown, X, Quote, Wallet, Headphones, Sparkles,
//   Zap, Users, Globe, Crown, Gift, Rocket, PlayCircle, ArrowLeft,
// } from 'lucide-react'
// import { cn } from '@/lib/utils'

// // ── Schema ────────────────────────────────────────────────────────────────────
// const loginSchema = z.object({
//   email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
//   password: z.string().min(6, 'Password must be at least 6 characters').max(100),
//   rememberMe: z.boolean().default(false),
// })
// type LoginFormValues = z.infer<typeof loginSchema>

// // ── Navigation ────────────────────────────────────────────────────────────────
// const NAV_LINKS = [
//   { label: 'How it works', href: '/how-it-works' },
//   { label: 'Pricing', href: '/pricing' },
//   { label: 'Success stories', href: '/success-stories' },
//   { label: 'Integrations', href: '/integrations' },
//   { label: 'Support', href: '/support' },
// ]

// // ── Vendor benefits ───────────────────────────────────────────────────────────
// const VENDOR_BENEFITS = [
//   { icon: Package, title: 'Product & Inventory', desc: 'Add, edit, and track all your rental products with real-time availability.' },
//   { icon: TrendingUp, title: 'Rentals & Revenue', desc: 'Monitor active rentals, upcoming bookings, and daily earnings.' },
//   { icon: BarChart2, title: 'Business Analytics', desc: 'Deep insights into performance, top products, peak seasons & behaviour.' },
//   { icon: ShieldCheck, title: 'Secure Vendor Portal', desc: 'Enterprise-grade security with 2FA, session management & encrypted payouts.' },
//   { icon: Wallet, title: 'Fast Encrypted Payouts', desc: 'Paid in 2–3 days to your bank via UPI & NEFT. Zero hidden fees.' },
//   { icon: Headphones, title: '24/7 Vendor Support', desc: 'Dedicated relationship manager, phone/WhatsApp & vendor help centre.' },
// ]

// // ── Stats ─────────────────────────────────────────────────────────────────────
// const STATS = [
//   { value: 50000, suffix: '+', prefix: '', label: 'Active Vendors' },
//   { value: 120, prefix: '₹', suffix: 'Cr+', label: 'Monthly GMV' },
//   { value: 4.8, prefix: '', suffix: '★', label: 'Vendor Rating' },
//   { value: 3, prefix: '', suffix: ' Days', label: 'Payout Cycle' },
// ]

// // ── Trusted-by brands (static) ─────────────────────────────────────────────────
// const TRUSTED_BRANDS = [
//   'FurnitureRent Co.', 'UrbanLadder Pro', 'RentKart', 'HomeEssentials',
//   'DecorHub', 'ApplianceMart', 'Eventify', 'Rentomojo', 'CityFurnish',
// ]

// // ── Pricing teaser ────────────────────────────────────────────────────────────
// const PRICING_TEASERS = [
//   {
//     name: 'Starter',
//     price: '₹0',
//     period: '/mo',
//     tagline: 'List up to 30 products',
//     features: ['Basic analytics', 'Standard payouts (3 days)', 'Email support', 'Single location'],
//     accent: 'from-slate-600 to-slate-800',
//     highlight: false,
//   },
//   {
//     name: 'Growth',
//     price: '₹999',
//     period: '/mo',
//     tagline: 'Most popular for scaling vendors',
//     features: ['Unlimited products', 'Advanced analytics', 'Priority payouts (2 days)', 'Multi-location', 'WhatsApp support'],
//     accent: 'from-indigo-600 to-violet-600',
//     highlight: true,
//   },
//   {
//     name: 'Enterprise',
//     price: 'Custom',
//     period: '',
//     tagline: 'Dedicated infrastructure & SLA',
//     features: ['White-label portal', 'API access', 'Same-day payouts', 'Dedicated manager', 'Custom integrations'],
//     accent: 'from-amber-600 to-pink-600',
//     highlight: false,
//   },
// ]

// // ── Integrations strip ─────────────────────────────────────────────────────────
// const INTEGRATIONS = [
//   { name: 'Razorpay', icon: Wallet },
//   { name: 'Stripe', icon: ShieldCheck },
//   { name: 'WhatsApp', icon: Headphones },
//   { name: 'GST Suite', icon: BarChart2 },
//   { name: 'Shiprocket', icon: Package },
//   { name: 'Google Analytics', icon: TrendingUp },
// ]

// // ── Testimonials ──────────────────────────────────────────────────────────────
// const TESTIMONIALS = [
//   { name: 'Rajesh Kumar', business: 'FurnitureRent Co.', location: 'Bengaluru', rating: 5, text: "RentEase transformed my small furniture rental shop into a full-fledged business. The dashboard analytics are a game-changer." },
//   { name: 'Priya Sharma', business: 'Home Appliances Hub', location: 'Mumbai', rating: 5, text: "Payouts are always on time, usually within 2 days. I've expanded from 30 to 200+ products since joining." },
//   { name: 'Amit Patel', business: 'Decor & Events Rentals', location: 'Ahmedabad', rating: 5, text: "The customer reach is incredible — I get booking enquiries from across the city. 2FA gives me peace of mind." },
// ]

// // ── FAQ ────────────────────────────────────────────────────────────────────────
// const FAQ_ITEMS = [
//   { q: 'How do I become a RentEase vendor?', a: 'Click "Become a Vendor", complete the 3-step registration (business details → KYC → bank info), and our team approves vendors within 24–48 hours.' },
//   { q: 'When and how do I receive payouts?', a: 'Payouts are processed every 2–3 business days directly to your bank account via UPI, NEFT, or IMPS. Track payout status from your dashboard.' },
//   { q: 'Is my business data secure?', a: 'Yes. We use 256-bit SSL encryption, PCI-DSS L1 compliance, and ISO 27001 certified infrastructure. 2FA and session monitoring protect your account.' },
//   { q: 'What items can I rent or sell?', a: 'Furniture, appliances, electronics, decor, fitness equipment, event supplies, and more — as long as they comply with our marketplace policy.' },
//   { q: 'Do you offer a free plan?', a: 'Yes! The Starter plan is free forever and lets you list up to 30 products with standard payouts and email support.' },
// ]

// const TRUST_BADGES = ['PCI-DSS L1', 'ISO 27001', 'RBI Compliant', 'SOC 2 Type II']

// // ── Animated counter hook ─────────────────────────────────────────────────────
// function useCountUp(target: number, durationMs = 1500, start = false) {
//   const [value, setValue] = useState(0)
//   useEffect(() => {
//     if (!start) return
//     let frame: number
//     const startTime = performance.now()
//     const animate = (now: number) => {
//       const progress = Math.min((now - startTime) / durationMs, 1)
//       const eased = 1 - Math.pow(1 - progress, 3)
//       setValue(target * eased)
//       if (progress < 1) frame = requestAnimationFrame(animate)
//       else setValue(target)
//     }
//     frame = requestAnimationFrame(animate)
//     return () => cancelAnimationFrame(frame)
//   }, [target, durationMs, start])
//   return value
// }

// // ── CAPTCHA ────────────────────────────────────────────────────────────────────
// function generateCaptcha() {
//   const a = Math.floor(Math.random() * 9) + 1
//   const b = Math.floor(Math.random() * 9) + 1
//   return { question: `${a} + ${b} = ?`, answer: String(a + b) }
// }

// // ── Device detection ──────────────────────────────────────────────────────────
// function getDeviceInfo() {
//   if (typeof window === 'undefined') return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }
//   const ua = navigator.userAgent
//   const device = /Mobi|Android/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop'
//   const browser = /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : /Edg/i.test(ua) ? 'Edge' : 'Browser'
//   const os = /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iOS|iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown OS'
//   return { device, browser, os }
// }

// // ── Animated stat tile ─────────────────────────────────────────────────────────
// function AnimatedStat({ stat, index }: { stat: typeof STATS[0]; index: number }) {
//   const [visible, setVisible] = useState(false)
//   const ref = useRef<HTMLDivElement>(null)
//   const count = useCountUp(stat.value, 1500, visible)
//   useEffect(() => {
//     const obs = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) setVisible(true)
//     }, { threshold: 0.3 })
//     if (ref.current) obs.observe(ref.current)
//     return () => obs.disconnect()
//   }, [])
//   const display = stat.value % 1 !== 0 ? count.toFixed(1) : Math.round(count).toLocaleString('en-IN')
//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 16, scale: 0.9 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{ delay: 0.7 + index * 0.1, type: 'spring', stiffness: 120 }}
//       className="flex flex-col items-center"
//     >
//       <p className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-violet-200 to-pink-200 bg-clip-text text-transparent">{stat.prefix}{display}{stat.suffix}</p>
//       <p className="text-xs text-violet-200/70 font-medium mt-0.5">{stat.label}</p>
//     </motion.div>
//   )
// }

// // ── Testimonial carousel ────────────────────────────────────────────────────────
// function TestimonialCarousel() {
//   const [current, setCurrent] = useState(0)
//   useEffect(() => {
//     const t = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 6000)
//     return () => clearInterval(t)
//   }, [])
//   const { name, business, location, rating, text } = TESTIMONIALS[current]
//   return (
//     <div className="relative">
//       <AnimatePresence mode="wait">
//         <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
//           <Quote className="h-6 w-6 text-amber-300 mb-2" />
//           <p className="text-sm text-white leading-relaxed italic">{text}</p>
//           <div className="flex items-center gap-3 mt-4">
//             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">{name.charAt(0)}</div>
//             <div>
//               <p className="text-sm font-semibold text-white">{name}</p>
//               <p className="text-xs text-violet-200/70">{business} · {location}</p>
//               <div className="flex gap-0.5 mt-0.5">{Array.from({ length: rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
//             </div>
//           </div>
//         </motion.div>
//       </AnimatePresence>
//       <div className="flex gap-1.5 justify-center mt-3">
//         {TESTIMONIALS.map((_, i) => (
//           <button key={i} onClick={() => setCurrent(i)} className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/50')} />
//         ))}
//       </div>
//     </div>
//   )
// }

// // ── FAQ item ───────────────────────────────────────────────────────────────────
// function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
//   return (
//     <div className="border-b border-slate-100 last:border-0">
//       <button type="button" onClick={onToggle} className="flex items-center justify-between w-full py-4 text-left group">
//         <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.q}</span>
//         <ChevronDown className={cn('h-4 w-4 text-slate-400 shrink-0 transition-transform', isOpen && 'rotate-180')} />
//       </button>
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
//             <p className="text-sm text-slate-500 leading-relaxed pb-4 pr-6">{item.a}</p>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// // ── Full-width colorful header ─────────────────────────────────────────────────
// function ColorfulHeader() {
//   const [scrolled, setScrolled] = useState(false)
//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 6)
//     window.addEventListener('scroll', onScroll)
//     return () => window.removeEventListener('scroll', onScroll)
//   }, [])
//   return (
//     <header className="w-full sticky top-0 z-50">
//       <div className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 shadow-lg">
//         <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
//           <Link href="/" className="flex items-center gap-2.5 shrink-0">
//             <motion.div initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 140, delay: 0.1 }} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
//               <Building2 className="h-5 w-5 text-white" />
//             </motion.div>
//             <div className="leading-tight">
//               <span className="text-lg font-extrabold text-white tracking-tight block">RentEase</span>
//               <span className="text-[10px] font-bold text-violet-100/80 uppercase tracking-[0.18em]">Vendor Portal</span>
//             </div>
//           </Link>
//           <nav className="hidden md:flex items-center gap-7">
//             {NAV_LINKS.map(l => (
//               <Link key={l.href} href={l.href} className="text-sm font-medium text-violet-50 hover:text-white relative group">
//                 {l.label}
//                 <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-300 rounded-full group-hover:w-full transition-all duration-300" />
//               </Link>
//             ))}
//           </nav>
//           <div className="flex items-center gap-3">
//             <a href="tel:18001234567" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-violet-50">
//               <Headphones className="h-3.5 w-3.5" /> 1800-123-4567
//             </a>
//             <Link href="/vendor/register">
//               <Button variant="secondary" className="h-9 rounded-lg bg-white text-indigo-700 font-semibold text-sm hover:bg-amber-300 hover:text-indigo-900 gap-1.5 shadow-md">
//                 Become a Vendor <ArrowRight className="h-3.5 w-3.5" />
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//       <div className="w-full h-0.5 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-pulse" />
//       {scrolled && <div className="w-full h-px bg-black/5" />}
//     </header>
//   )
// }

// // ── Brand marquee ──────────────────────────────────────────────────────────────
// function BrandMarquee() {
//   return (
//     <div className="w-full py-6 bg-white border-y border-slate-100 overflow-hidden">
//       <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Trusted by 50,000+ vendors across India</p>
//       <div className="relative flex overflow-hidden">
//         <motion.div className="flex gap-10 shrink-0 pr-10" animate={{ x: ['-0%', '-50%'] }} transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}>
//           {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((b, i) => (
//             <span key={i} className="text-base font-bold text-slate-300 whitespace-nowrap tracking-tight">{b}</span>
//           ))}
//         </motion.div>
//       </div>
//     </div>
//   )
// }

// // ── Pricing teaser card ────────────────────────────────────────────────────────
// function PricingCard({ plan, i }: { plan: typeof PRICING_TEASERS[0]; i: number }) {
//   const Icon = [Rocket, Crown, Globe][i]
//   return (
//     <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className={cn('relative rounded-2xl p-6 border-2 bg-white', plan.highlight ? 'border-indigo-500 shadow-xl shadow-indigo-200/50 lg:-mt-3 lg:mb-3' : 'border-slate-200 shadow-sm')}>
//       {plan.highlight && (
//         <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">Most Popular</span>
//       )}
//       <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', plan.accent)}>
//         <Icon className="h-5 w-5 text-white" />
//       </div>
//       <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
//       <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
//       <div className="mt-3 flex items-end gap-0.5">
//         <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
//         <span className="text-sm font-semibold text-slate-400 mb-1">{plan.period}</span>
//       </div>
//       <ul className="mt-4 space-y-2">
//         {plan.features.map(f => (
//           <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
//             <BadgeCheck className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" /> {f}
//           </li>
//         ))}
//       </ul>
//       <Button className={cn('w-full mt-5 h-10 rounded-xl font-semibold', plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900')}>
//         {plan.highlight ? 'Start free trial' : 'Choose plan'} <ArrowRight className="h-4 w-4" />
//       </Button>
//     </motion.div>
//   )
// }

// // ── Integrations strip ─────────────────────────────────────────────────────────
// function IntegrationsStrip() {
//   return (
//     <div className="w-full py-8 bg-slate-50 border-y border-slate-100">
//       <div className="max-w-[1200px] mx-auto px-6">
//         <p className="text-center text-sm font-bold text-slate-500 mb-5 flex items-center justify-center gap-2">
//           <Zap className="h-4 w-4 text-amber-500" /> Integrations that power your business
//         </p>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//           {INTEGRATIONS.map((it, i) => {
//             const Icon = it.icon
//             return (
//               <motion.div key={it.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-3 hover:shadow-md hover:border-indigo-300 transition-all">
//                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
//                   <Icon className="h-4 w-4 text-indigo-600" />
//                 </div>
//                 <span className="text-xs font-semibold text-slate-700">{it.name}</span>
//               </motion.div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Live activity ticker ────────────────────────────────────────────────────────
// const LIVE_ACTIVITIES = [
//   'Rajesh K. listed 3 new sofas in Bengaluru',
//   'Priya S. received ₹12,400 payout',
//   'Amit P. got 8 new booking enquiries',
//   'DecorHub crossed ₹1 Lakh monthly GMV',
//   'UrbanLadder Pro added a new warehouse location',
//   'RentKart hit 4.9★ vendor rating',
// ]

// function LiveTicker() {
//   const [idx, setIdx] = useState(0)
//   useEffect(() => {
//     const t = setInterval(() => setIdx(i => (i + 1) % LIVE_ACTIVITIES.length), 3500)
//     return () => clearInterval(t)
//   }, [])
//   return (
//     <div className="w-full bg-slate-900 text-white py-2.5 px-4 overflow-hidden">
//       <div className="max-w-[1400px] mx-auto flex items-center gap-3">
//         <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 shrink-0">
//           <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" /></span>
//           LIVE
//         </span>
//         <AnimatePresence mode="wait">
//           <motion.span key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-xs text-slate-200 truncate">
//             {LIVE_ACTIVITIES[idx]}
//           </motion.span>
//         </AnimatePresence>
//       </div>
//     </div>
//   )
// }

// // ── CTA band ────────────────────────────────────────────────────────────────────
// function CTABand() {
//   return (
//     <div className="w-full py-10 px-6 bg-gradient-to-r from-indigo-700 via-violet-600 to-pink-600 relative overflow-hidden">
//       <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(251,191,36,0.4), transparent 40%), radial-gradient(circle at 20% 80%, rgba(34,211,238,0.3), transparent 40%)' }} />
//       <div className="relative max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
//         <div>
//           <h3 className="text-2xl lg:text-3xl font-extrabold text-white">Ready to grow your rental business?</h3>
//           <p className="text-violet-100 mt-1 text-sm">Join 50,000+ vendors earning more with RentEase. Free to start, no credit card required.</p>
//         </div>
//         <div className="flex gap-3 shrink-0">
//           <Link href="/vendor/register"><Button className="h-11 px-6 bg-amber-400 hover:bg-amber-300 text-indigo-900 font-bold rounded-xl gap-2">Become a Vendor <ArrowRight className="h-4 w-4" /></Button></Link>
//           <Link href="/how-it-works"><Button variant="outline" className="h-11 px-6 bg-white/0 border-white/40 text-white hover:bg-white/10 rounded-xl gap-2"><PlayCircle className="h-4 w-4" /> See how it works</Button></Link>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Footer ─────────────────────────────────────────────────────────────────────
// function Footer() {
//   return (
//     <footer className="w-full bg-slate-950 text-slate-400 py-10 px-6">
//       <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
//         <div className="col-span-2 md:col-span-1">
//           <div className="flex items-center gap-2 mb-3">
//             <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center"><Building2 className="h-4 w-4 text-white" /></div>
//             <span className="text-base font-bold text-white">RentEase</span>
//           </div>
//           <p className="text-xs leading-relaxed">India's most trusted rental marketplace. Empowering vendors with technology, security, and visibility.</p>
//         </div>
//         <div>
//           <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Platform</p>
//           {[['How it works', '/how-it-works'], ['Pricing', '/pricing'], ['Integrations', '/integrations'], ['Success stories', '/success-stories']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
//         </div>
//         <div>
//           <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Vendor</p>
//           {[['Become a Vendor', '/vendor/register'], ['Vendor Login', '/vendor/login'], ['Support', '/support'], ['Vendor Handbook', '/handbook']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
//         </div>
//         <div>
//           <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Company</p>
//           {[['About', '/about'], ['Careers', '/careers'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
//         </div>
//       </div>
//       <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
//         <p className="text-xs">© 2026 RentEase Technologies Pvt. Ltd. All rights reserved.</p>
//         <div className="flex flex-wrap justify-center gap-2">{TRUST_BADGES.map(b => <span key={b} className="flex items-center gap-1 text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-full"><BadgeCheck className="h-3 w-3 text-indigo-400" /> {b}</span>)}</div>
//       </div>
//     </footer>
//   )
// }

// // ── Main component ────────────────────────────────────────────────────────────
// export function VendorLoginForm() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [loginAttempts, setLoginAttempts] = useState(0)
//   const [showCaptcha, setShowCaptcha] = useState(false)
//   const [captcha, setCaptcha] = useState(generateCaptcha())
//   const [captchaInput, setCaptchaInput] = useState('')
//   const [captchaError, setCaptchaError] = useState(false)
//   const [show2FA, setShow2FA] = useState(false)
//   const [twoFACode, setTwoFACode] = useState(['', '', '', '', '', ''])
//   const [twoFAError, setTwoFAError] = useState(false)
//   const [isLocked, setIsLocked] = useState(false)
//   const [lockCountdown, setLockCountdown] = useState(0)
//   const [deviceInfo] = useState(getDeviceInfo)
//   const [showDeviceBanner, setShowDeviceBanner] = useState(true)
//   const [openFAQ, setOpenFAQ] = useState<number | null>(0)
//   const otpRefs = useRef<(HTMLInputElement | null)[]>([])
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const callbackUrl = searchParams.get('callbackUrl') || '/vendor/dashboard'

//   const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema) as any,
//     defaultValues: { email: '', password: '', rememberMe: false },
//   })
//   const rememberMe = watch('rememberMe')

//   // Lockout countdown
//   useEffect(() => {
//     if (!isLocked || lockCountdown <= 0) return
//     const t = setTimeout(() => {
//       setLockCountdown(c => { if (c <= 1) { setIsLocked(false); return 0 } return c - 1 })
//     }, 1000)
//     return () => clearTimeout(t)
//   }, [isLocked, lockCountdown])

//   // 2FA input handler
//   const handle2FAInput = (idx: number, val: string) => {
//     const cleaned = val.replace(/\D/, '').slice(-1)
//     const next = [...twoFACode]
//     next[idx] = cleaned
//     setTwoFACode(next)
//     if (cleaned && idx < 5) otpRefs.current[idx + 1]?.focus()
//     if (!cleaned && idx > 0) otpRefs.current[idx - 1]?.focus()
//   }

//   const regenerateCaptcha = () => {
//     setCaptcha(generateCaptcha())
//     setCaptchaInput('')
//     setCaptchaError(false)
//   }

//   const onSubmit = async (data: LoginFormValues) => {
//     if (isLocked) return
//     setError(null); setCaptchaError(false); setTwoFAError(false)
//     if (showCaptcha && captchaInput.trim() !== captcha.answer) { setCaptchaError(true); regenerateCaptcha(); return }
//     if (show2FA) {
//       const code = twoFACode.join('')
//       if (code.length !== 6) { setTwoFAError(true); return }
//       toast.success('2FA verified!', { description: 'Signing you in…' })
//     }
//     setIsLoading(true)
//     try {
//       const result = await signIn('credentials', { email: data.email, password: data.password, loginType: 'vendor', redirect: false })
//       if (result?.error) {
//         const newAttempts = loginAttempts + 1
//         setLoginAttempts(newAttempts)
//         if (newAttempts >= 5) { setIsLocked(true); setLockCountdown(30); setError('Too many failed attempts. Account locked for 30 seconds.'); return }
//         if (newAttempts >= 3 && !showCaptcha) { setShowCaptcha(true); regenerateCaptcha() }
//         const remaining = 5 - newAttempts
//         if (result.error === 'CredentialsSignin') setError(`Invalid email or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`)
//         else if (result.error === 'VendorNotApproved') setError('Your vendor account is pending approval.')
//         else if (result.error === 'VendorSuspended') setError('Your account has been suspended. Contact support.')
//         else setError(result.error || 'Login failed. Please try again.')
//         toast.error('Login Failed', { description: 'Please check your credentials.' })
//         return
//       }
//       const response = await fetch('/api/auth/session')
//       const session = await response.json()
//       if (session?.user?.role === 'vendor') {
//         setLoginAttempts(0)
//         toast.success('Welcome back!', { description: 'Redirecting to your dashboard…' })
//         router.push(callbackUrl); router.refresh()
//       } else if (session?.user?.role === 'admin' || session?.user?.role === 'super-admin') {
//         toast.info('Admin Access Detected', { description: 'Redirecting to admin dashboard…' })
//         router.push('/admin/dashboard'); router.refresh()
//       } else {
//         setError('You do not have vendor access. Please use a vendor account.')
//       }
//     } catch (err: any) {
//       setError(err.message || 'An unexpected error occurred.')
//       toast.error('Login Error', { description: 'Please try again or contact support.' })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleForgotPassword = async () => {
//     const email = watch('email')
//     if (!email) { toast.error('Enter your email first', { description: 'We need your email to send a reset link.' }); return }
//     try {
//       const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
//       if (res.ok) toast.success('Reset link sent!', { description: 'Check your inbox.' })
//       else toast.error('Could not send reset link')
//     } catch { toast.error('Error', { description: 'Failed to send reset link.' }) }
//   }

//   return (
//     <div className="min-h-screen w-full flex flex-col bg-slate-50" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
//       <ColorfulHeader />
//       <LiveTicker />

//       {/* ── FULL-WIDTH SPLIT BODY ──────────────────────────────────────────── */}
//       <div className="w-full flex flex-col lg:flex-row flex-1">
//         {/* LEFT — brand showcase */}
//         <div className="w-full lg:w-[56%] relative overflow-hidden p-8 xl:p-14 flex flex-col justify-between gap-8 min-h-[560px]">
//           {/* Background layers */}
//           <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
//           <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 82% 18%, rgba(236,72,153,0.25), transparent 42%), radial-gradient(circle at 12% 88%, rgba(99,102,241,0.4), transparent 50%), radial-gradient(circle at 50% 50%, rgba(167,139,250,0.12), transparent 60%)' }} />
//           <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
//           <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
//           <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

//           <div className="relative z-10 flex flex-col h-full justify-between gap-6">
//             {/* hero + benefits */}
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="space-y-6">
//               <div>
//                 <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-violet-100 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
//                   <Sparkles className="h-3 w-3" /> India's trusted rental marketplace
//                 </span>
//                 <h1 className="text-3xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
//                   Grow your rental<br />
//                   <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">business with RentEase</span>
//                 </h1>
//                 <p className="text-violet-100/80 mt-3 text-base leading-relaxed max-w-md">
//                   Join 50,000+ vendors renting & selling furniture, appliances, electronics and home items on India's most trusted marketplace.
//                 </p>
//               </div>
//               {/* benefits grid */}
//               <div className="grid grid-cols-2 gap-3">
//                 {VENDOR_BENEFITS.map((b, i) => {
//                   const Icon = b.icon
//                   return (
//                     <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.07 }} className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 hover:bg-white/15 hover:-translate-y-0.5 transition-all group">
//                       <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center mb-2 group-hover:bg-amber-400/30 transition-colors">
//                         <Icon className="h-4 w-4 text-white" />
//                       </div>
//                       <p className="text-sm font-semibold text-white">{b.title}</p>
//                       <p className="text-xs text-violet-100/70 leading-relaxed mt-0.5">{b.desc}</p>
//                     </motion.div>
//                   )
//                 })}
//               </div>
//             </motion.div>

//             {/* testimonial */}
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="max-w-md">
//               <TestimonialCarousel />
//             </motion.div>

//             {/* stats */}
//             <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15 pt-5 backdrop-blur-sm">
//               {STATS.map((s, i) => <AnimatedStat key={i} stat={s} index={i} />)}
//             </motion.div>
//           </div>
//         </div>

//         {/* RIGHT — login form */}
//         <div className="w-full lg:w-[44%] flex flex-col bg-white">
//           <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20 bg-white">
//             <div className="w-full max-w-md mx-auto">
//               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
//                 <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
//                 <p className="text-sm text-slate-500 mt-1">Sign in to your vendor account to continue</p>
//               </motion.div>

//               {/* device banner */}
//               <AnimatePresence>
//                 {showDeviceBanner && (
//                   <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mt-5 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
//                     <Monitor className="h-4 w-4 text-indigo-500 shrink-0" />
//                     <p className="text-xs text-indigo-700 flex-1">Signing in on <strong>{deviceInfo.device}</strong> · {deviceInfo.browser} · {deviceInfo.os}</p>
//                     <button onClick={() => setShowDeviceBanner(false)} className="text-indigo-400 hover:text-indigo-600"><X className="h-3.5 w-3.5" /></button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* error */}
//               <AnimatePresence>
//                 {error && (
//                   <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
//                     <Alert className="border-red-200 bg-red-50"><AlertCircle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-700 text-sm">{error}</AlertDescription></Alert>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* lockout */}
//               <AnimatePresence>
//                 {isLocked && (
//                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
//                     <TriangleAlert className="h-5 w-5 text-amber-500 shrink-0" />
//                     <div><p className="text-sm font-semibold text-amber-800">Account temporarily locked</p><p className="text-xs text-amber-600">Too many failed attempts. Try again in <strong>{lockCountdown}s</strong></p></div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* attempt warning */}
//               <AnimatePresence>
//                 {loginAttempts >= 2 && loginAttempts < 5 && !isLocked && (
//                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
//                     <TriangleAlert className="h-4 w-4 text-amber-500 shrink-0" />
//                     <p className="text-xs text-amber-700"><strong>{5 - loginAttempts} attempt{5 - loginAttempts > 1 ? 's' : ''}</strong> remaining before lockout.</p>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* ── FORM ─────────────────────────────────────────────── */}
//               <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
//                 {/* email */}
//                 <div>
//                   <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address <span className="text-red-400">*</span></Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                     <Input type="email" placeholder="vendor@example.com" className={cn('pl-10 rounded-xl border-slate-200 focus-visible:ring-indigo-300 focus-visible:border-indigo-500 h-11', errors.email && 'border-red-400')} {...register('email')} disabled={isLoading || isLocked} autoComplete="email" />
//                   </div>
//                   {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>}
//                 </div>
//                 {/* password */}
//                 <div>
//                   <div className="flex items-center justify-between mb-1.5">
//                     <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password <span className="text-red-400">*</span></Label>
//                     <button type="button" onClick={handleForgotPassword} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Forgot password?</button>
//                   </div>
//                   <div className="relative">
//                     <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                     <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={cn('pl-10 pr-11 rounded-xl border-slate-200 focus-visible:ring-indigo-300 focus-visible:border-indigo-500 h-11', errors.password && 'border-red-400')} {...register('password')} disabled={isLoading || isLocked} autoComplete="current-password" />
//                     <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
//                   </div>
//                   {errors.password && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>}
//                 </div>

//                 {/* CAPTCHA */}
//                 <AnimatePresence>
//                   {showCaptcha && (
//                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
//                       <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
//                         <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-600" /><p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Security Verification</p></div>
//                         <div className="flex items-center gap-3">
//                           <div className="bg-white border-2 border-indigo-300 rounded-lg px-4 py-2.5 font-mono font-bold text-lg text-slate-800 tracking-widest select-none">{captcha.question}</div>
//                           <button type="button" onClick={regenerateCaptcha} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50"><RefreshCw className="h-4 w-4" /></button>
//                         </div>
//                         <Input placeholder="Enter your answer" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} className={cn('rounded-xl h-10 font-mono text-base', captchaError && 'border-red-400')} inputMode="numeric" />
//                         {captchaError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Incorrect. A new challenge has been generated.</p>}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* 2FA */}
//                 <AnimatePresence>
//                   {show2FA && (
//                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
//                       <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
//                         <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-indigo-600" /><p className="text-sm font-semibold text-indigo-800">Two-Factor Authentication</p></div>
//                         <p className="text-xs text-indigo-600">Enter the 6-digit code sent to your registered mobile number.</p>
//                         <div className="flex gap-2 justify-center">
//                           {twoFACode.map((digit, i) => (
//                             <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handle2FAInput(i, e.target.value)} onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i - 1]?.focus() }} className={cn('w-11 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all', digit ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white', twoFAError && 'border-red-400', 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200')} />
//                           ))}
//                         </div>
//                         {twoFAError && <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1"><AlertCircle className="h-3 w-3" /> Please enter all 6 digits</p>}
//                         <p className="text-xs text-indigo-500 text-center">Didn't receive a code? <button type="button" className="font-semibold underline">Resend OTP</button></p>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* remember me */}
//                 <div className="flex items-center gap-2">
//                   <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={v => setValue('rememberMe', v as boolean)} disabled={isLoading || isLocked} className="rounded" />
//                   <Label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer font-normal select-none">Remember me for 30 days</Label>
//                 </div>

//                 {/* submit */}
//                 <Button type="submit" disabled={isLoading || isLocked} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-base rounded-xl gap-2 shadow-lg shadow-indigo-300/40 transition-all">
//                   {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>)
//                     : isLocked ? (<><Clock className="h-4 w-4" /> Locked · {lockCountdown}s</>)
//                       : (<><Shield className="h-4 w-4" /> Sign in to Vendor Portal</>)}
//                 </Button>

//                 {/* divider */}
//                 <div className="relative my-1"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">New to RentEase?</span></div></div>

//                 {/* register link */}
//                 <Link href="/vendor/register" className="flex items-center justify-center gap-2 w-full h-11 border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold text-sm rounded-xl transition-all group">
//                   <Building2 className="h-4 w-4" /> Become a Vendor <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
//                 </Link>
//               </form>

//               {/* FAQ */}
//               <div className="mt-8 pt-6 border-t border-slate-100">
//                 <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /> Frequently Asked Questions</p>
//                 <div className="bg-slate-50/70 rounded-xl px-4">
//                   {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} isOpen={openFAQ === i} onToggle={() => setOpenFAQ(openFAQ === i ? null : i)} />)}
//                 </div>
//               </div>

//               {/* trust badges */}
//               <div className="mt-6 pt-5 border-t border-slate-100">
//                 <p className="text-[11px] text-slate-400 text-center font-medium mb-3 uppercase tracking-wider">Secured & Compliant</p>
//                 <div className="flex flex-wrap justify-center gap-2">
//                   {TRUST_BADGES.map(b => <span key={b} className="flex items-center gap-1 text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full"><BadgeCheck className="h-3 w-3 text-indigo-500" /> {b}</span>)}
//                 </div>
//                 <p className="text-[11px] text-slate-400 text-center mt-3">Protected by 256-bit SSL encryption · Your data is never shared</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── BRAND MARQUEE ──────────────────────────────────────────────────── */}
//       <BrandMarquee />

//       {/* ── INTEGRATIONS STRIP ──────────────────────────────────────────────── */}
//       <IntegrationsStrip />

//       {/* ── PRICING TEASER ──────────────────────────────────────────────────── */}
//       <div className="w-full py-12 px-6 bg-white">
//         <div className="max-w-[1200px] mx-auto">
//           <div className="text-center mb-8">
//             <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"><Gift className="h-3 w-3" /> Pricing</span>
//             <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Plans that scale with your business</h2>
//             <p className="text-sm text-slate-500 mt-1">Start free and upgrade as you grow. No hidden charges, cancel anytime.</p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-center">
//             {PRICING_TEASERS.map((p, i) => <PricingCard key={p.name} plan={p} i={i} />)}
//           </div>
//         </div>
//       </div>

//       {/* ── CTA BAND ───────────────────────────────────────────────────────── */}
//       <CTABand />

//       {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
//       <Footer />

//       {/* dev credentials */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="fixed bottom-4 right-4 rounded-xl bg-amber-50 border border-amber-200 p-3 shadow-lg z-50">
//           <p className="text-xs font-bold text-amber-800 mb-1">Dev Credentials</p>
//           <p className="text-xs text-amber-700 font-mono">vendor@rentease.com</p>
//           <p className="text-xs text-amber-700 font-mono">vendor123</p>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Button,
} from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, Building2,
  TrendingUp, Package, BarChart2, Smartphone, RefreshCw, Monitor,
  ShieldCheck, Star, ArrowRight, BadgeCheck, Clock, TriangleAlert,
  ChevronRight, ChevronDown, X, Quote, Wallet, Headphones, Sparkles,
  Zap, Users, Globe, Crown, Gift, Rocket, PlayCircle, ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Schema ────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  rememberMe: z.boolean().default(false),
})
type LoginFormValues = z.infer<typeof loginSchema>

// ── Navigation ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Success stories', href: '/success-stories' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Support', href: '/support' },
]

// ── Vendor benefits ───────────────────────────────────────────────────────────
const VENDOR_BENEFITS = [
  { icon: Package, title: 'Product & Inventory', desc: 'Add, edit, and track all your rental products with real-time availability.' },
  { icon: TrendingUp, title: 'Rentals & Revenue', desc: 'Monitor active rentals, upcoming bookings, and daily earnings.' },
  { icon: BarChart2, title: 'Business Analytics', desc: 'Deep insights into performance, top products, peak seasons & behaviour.' },
  { icon: ShieldCheck, title: 'Secure Vendor Portal', desc: 'Enterprise-grade security with 2FA, session management & encrypted payouts.' },
  { icon: Wallet, title: 'Fast Encrypted Payouts', desc: 'Paid in 2–3 days to your bank via UPI & NEFT. Zero hidden fees.' },
  { icon: Headphones, title: '24/7 Vendor Support', desc: 'Dedicated relationship manager, phone/WhatsApp & vendor help centre.' },
]

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 50000, suffix: '+', prefix: '', label: 'Active Vendors' },
  { value: 120, prefix: '₹', suffix: 'Cr+', label: 'Monthly GMV' },
  { value: 4.8, prefix: '', suffix: '★', label: 'Vendor Rating' },
  { value: 3, prefix: '', suffix: ' Days', label: 'Payout Cycle' },
]

// ── Trusted-by brands (static) ─────────────────────────────────────────────────
const TRUSTED_BRANDS = [
  'FurnitureRent Co.', 'UrbanLadder Pro', 'RentKart', 'HomeEssentials',
  'DecorHub', 'ApplianceMart', 'Eventify', 'Rentomojo', 'CityFurnish',
]

// ── Pricing teaser ────────────────────────────────────────────────────────────
const PRICING_TEASERS = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/mo',
    tagline: 'List up to 30 products',
    features: ['Basic analytics', 'Standard payouts (3 days)', 'Email support', 'Single location'],
    accent: 'from-slate-600 to-slate-800',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹999',
    period: '/mo',
    tagline: 'Most popular for scaling vendors',
    features: ['Unlimited products', 'Advanced analytics', 'Priority payouts (2 days)', 'Multi-location', 'WhatsApp support'],
    accent: 'from-indigo-600 to-violet-600',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'Dedicated infrastructure & SLA',
    features: ['White-label portal', 'API access', 'Same-day payouts', 'Dedicated manager', 'Custom integrations'],
    accent: 'from-amber-600 to-pink-600',
    highlight: false,
  },
]

// ── Integrations strip ─────────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: 'Razorpay', icon: Wallet },
  { name: 'Stripe', icon: ShieldCheck },
  { name: 'WhatsApp', icon: Headphones },
  { name: 'GST Suite', icon: BarChart2 },
  { name: 'Shiprocket', icon: Package },
  { name: 'Google Analytics', icon: TrendingUp },
]

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Rajesh Kumar', business: 'FurnitureRent Co.', location: 'Bengaluru', rating: 5, text: "RentEase transformed my small furniture rental shop into a full-fledged business. The dashboard analytics are a game-changer." },
  { name: 'Priya Sharma', business: 'Home Appliances Hub', location: 'Mumbai', rating: 5, text: "Payouts are always on time, usually within 2 days. I've expanded from 30 to 200+ products since joining." },
  { name: 'Amit Patel', business: 'Decor & Events Rentals', location: 'Ahmedabad', rating: 5, text: "The customer reach is incredible — I get booking enquiries from across the city. 2FA gives me peace of mind." },
]

// ── FAQ ────────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'How do I become a RentEase vendor?', a: 'Click "Become a Vendor", complete the 3-step registration (business details → KYC → bank info), and our team approves vendors within 24–48 hours.' },
  { q: 'When and how do I receive payouts?', a: 'Payouts are processed every 2–3 business days directly to your bank account via UPI, NEFT, or IMPS. Track payout status from your dashboard.' },
  { q: 'Is my business data secure?', a: 'Yes. We use 256-bit SSL encryption, PCI-DSS L1 compliance, and ISO 27001 certified infrastructure. 2FA and session monitoring protect your account.' },
  { q: 'What items can I rent or sell?', a: 'Furniture, appliances, electronics, decor, fitness equipment, event supplies, and more — as long as they comply with our marketplace policy.' },
  { q: 'Do you offer a free plan?', a: 'Yes! The Starter plan is free forever and lets you list up to 30 products with standard payouts and email support.' },
]

const TRUST_BADGES = ['PCI-DSS L1', 'ISO 27001', 'RBI Compliant', 'SOC 2 Type II']

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, durationMs = 1500, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let frame: number
    const startTime = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(animate)
      else setValue(target)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, start])
  return value
}

// ── CAPTCHA ────────────────────────────────────────────────────────────────────
function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { question: `${a} + ${b} = ?`, answer: String(a + b) }
}

// ── Device detection ──────────────────────────────────────────────────────────
function getDeviceInfo() {
  if (typeof window === 'undefined') return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }
  const ua = navigator.userAgent
  const device = /Mobi|Android/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop'
  const browser = /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : /Edg/i.test(ua) ? 'Edge' : 'Browser'
  const os = /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iOS|iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown OS'
  return { device, browser, os }
}

// ── Animated stat tile ─────────────────────────────────────────────────────────
function AnimatedStat({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(stat.value, 1500, visible)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const display = stat.value % 1 !== 0 ? count.toFixed(1) : Math.round(count).toLocaleString('en-IN')
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.7 + index * 0.1, type: 'spring', stiffness: 120 }}
      className="flex flex-col items-center"
    >
      <p className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-violet-200 to-pink-200 bg-clip-text text-transparent">{stat.prefix}{display}{stat.suffix}</p>
      <p className="text-xs text-violet-200/70 font-medium mt-0.5">{stat.label}</p>
    </motion.div>
  )
}

// ── Testimonial carousel ────────────────────────────────────────────────────────
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(t)
  }, [])
  const { name, business, location, rating, text } = TESTIMONIALS[current]
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
          <Quote className="h-6 w-6 text-amber-300 mb-2" />
          <p className="text-sm text-white leading-relaxed italic">{text}</p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">{name.charAt(0)}</div>
            <div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-violet-200/70">{business} · {location}</p>
              <div className="flex gap-0.5 mt-0.5">{Array.from({ length: rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1.5 justify-center mt-3">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/50')} />
        ))}
      </div>
    </div>
  )
}

// ── FAQ item ───────────────────────────────────────────────────────────────────
function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button type="button" onClick={onToggle} className="flex items-center justify-between w-full py-4 text-left group">
        <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.q}</span>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="text-sm text-slate-500 leading-relaxed pb-4 pr-6">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Full-width colorful header ─────────────────────────────────────────────────
function ColorfulHeader() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={cn('fixed top-0 inset-x-0 z-50 transition-shadow duration-300', scrolled ? 'shadow-xl shadow-indigo-950/20' : '')}>
      <div className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <motion.div initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 140, delay: 0.1 }} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
              <Building2 className="h-5 w-5 text-white" />
            </motion.div>
            <div className="leading-tight">
              <span className="text-lg font-extrabold text-white tracking-tight block">RentEase</span>
              <span className="text-[10px] font-bold text-violet-100/80 uppercase tracking-[0.18em]">Vendor Portal</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-violet-50 hover:text-white relative group">
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-300 rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:18001234567" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-violet-50">
              <Headphones className="h-3.5 w-3.5" /> 1800-123-4567
            </a>
            <Link href="/vendor/register">
              <Button variant="secondary" className="h-9 rounded-lg bg-white text-indigo-700 font-semibold text-sm hover:bg-amber-300 hover:text-indigo-900 gap-1.5 shadow-md">
                Become a Vendor <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full h-0.5 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-pulse" />
      {scrolled && <div className="w-full h-px bg-black/5" />}
    </header>
  )
}

// ── Brand marquee ──────────────────────────────────────────────────────────────
function BrandMarquee() {
  return (
    <div className="w-full py-6 bg-white border-y border-slate-100 overflow-hidden">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Trusted by 50,000+ vendors across India</p>
      <div className="relative flex overflow-hidden">
        <motion.div className="flex gap-10 shrink-0 pr-10" animate={{ x: ['-0%', '-50%'] }} transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}>
          {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((b, i) => (
            <span key={i} className="text-base font-bold text-slate-300 whitespace-nowrap tracking-tight">{b}</span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ── Pricing teaser card ────────────────────────────────────────────────────────
function PricingCard({ plan, i }: { plan: typeof PRICING_TEASERS[0]; i: number }) {
  const Icon = [Rocket, Crown, Globe][i]
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className={cn('relative rounded-2xl p-6 border-2 bg-white', plan.highlight ? 'border-indigo-500 shadow-xl shadow-indigo-200/50 lg:-mt-3 lg:mb-3' : 'border-slate-200 shadow-sm')}>
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">Most Popular</span>
      )}
      <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', plan.accent)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
      <div className="mt-3 flex items-end gap-0.5">
        <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
        <span className="text-sm font-semibold text-slate-400 mb-1">{plan.period}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
            <BadgeCheck className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <Button className={cn('w-full mt-5 h-10 rounded-xl font-semibold', plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900')}>
        {plan.highlight ? 'Start free trial' : 'Choose plan'} <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}

// ── Integrations strip ─────────────────────────────────────────────────────────
function IntegrationsStrip() {
  return (
    <div className="w-full py-8 bg-slate-50 border-y border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center text-sm font-bold text-slate-500 mb-5 flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" /> Integrations that power your business
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INTEGRATIONS.map((it, i) => {
            const Icon = it.icon
            return (
              <motion.div key={it.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-3 hover:shadow-md hover:border-indigo-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">{it.name}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Live activity ticker ────────────────────────────────────────────────────────
const LIVE_ACTIVITIES = [
  'Rajesh K. listed 3 new sofas in Bengaluru',
  'Priya S. received ₹12,400 payout',
  'Amit P. got 8 new booking enquiries',
  'DecorHub crossed ₹1 Lakh monthly GMV',
  'UrbanLadder Pro added a new warehouse location',
  'RentKart hit 4.9★ vendor rating',
]

function LiveTicker() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LIVE_ACTIVITIES.length), 3500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="w-full bg-slate-900 text-white py-2.5 px-4 overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 shrink-0">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" /></span>
          LIVE
        </span>
        <AnimatePresence mode="wait">
          <motion.span key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-xs text-slate-200 truncate">
            {LIVE_ACTIVITIES[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── CTA band ────────────────────────────────────────────────────────────────────
function CTABand() {
  return (
    <div className="w-full py-10 px-6 bg-gradient-to-r from-indigo-700 via-violet-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(251,191,36,0.4), transparent 40%), radial-gradient(circle at 20% 80%, rgba(34,211,238,0.3), transparent 40%)' }} />
      <div className="relative max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
        <div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white">Ready to grow your rental business?</h3>
          <p className="text-violet-100 mt-1 text-sm">Join 50,000+ vendors earning more with RentEase. Free to start, no credit card required.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/vendor/register"><Button className="h-11 px-6 bg-amber-400 hover:bg-amber-300 text-indigo-900 font-bold rounded-xl gap-2">Become a Vendor <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link href="/how-it-works"><Button variant="outline" className="h-11 px-6 bg-white/0 border-white/40 text-white hover:bg-white/10 rounded-xl gap-2"><PlayCircle className="h-4 w-4" /> See how it works</Button></Link>
        </div>
      </div>
    </div>
  )
}

// ── Onboarding steps (real 3-step sequence) ─────────────────────────────────────
const ONBOARDING_STEPS = [
  { title: 'Register your business', desc: 'Add your business name, category, and the cities you plan to serve.', icon: Building2 },
  { title: 'Get verified in 24–48 hrs', desc: 'Upload KYC, PAN, and bank details. Our team reviews and approves your account.', icon: ShieldCheck },
  { title: 'List products & start earning', desc: 'Publish your catalogue, go live, and receive your first payout within days.', icon: TrendingUp },
]

function OnboardingSteps() {
  return (
    <div className="w-full py-14 px-6 bg-slate-50">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"><Rocket className="h-3 w-3" /> Getting started</span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">From sign-up to your first payout</h2>
          <p className="text-sm text-slate-500 mt-1">Three steps, most vendors are live within two days.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-9 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-pink-200" />
          {ONBOARDING_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 w-[72px] h-[72px] rounded-2xl bg-white border-2 border-indigo-100 shadow-sm flex items-center justify-center">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-indigo-900 text-[11px] font-extrabold flex items-center justify-center shadow">{i + 1}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-4">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-[240px]">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 py-10 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center"><Building2 className="h-4 w-4 text-white" /></div>
            <span className="text-base font-bold text-white">RentEase</span>
          </div>
          <p className="text-xs leading-relaxed">India's most trusted rental marketplace. Empowering vendors with technology, security, and visibility.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Platform</p>
          {[['How it works', '/how-it-works'], ['Pricing', '/pricing'], ['Integrations', '/integrations'], ['Success stories', '/success-stories']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Vendor</p>
          {[['Become a Vendor', '/vendor/register'], ['Vendor Login', '/vendor/login'], ['Support', '/support'], ['Vendor Handbook', '/handbook']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Company</p>
          {[['About', '/about'], ['Careers', '/careers'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs">© 2026 RentEase Technologies Pvt. Ltd. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-2">{TRUST_BADGES.map(b => <span key={b} className="flex items-center gap-1 text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-full"><BadgeCheck className="h-3 w-3 text-indigo-400" /> {b}</span>)}</div>
      </div>
    </footer>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function VendorLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState(['', '', '', '', '', ''])
  const [twoFAError, setTwoFAError] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)
  const [deviceInfo] = useState(getDeviceInfo)
  const [showDeviceBanner, setShowDeviceBanner] = useState(true)
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/vendor/dashboard'

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: '', password: '', rememberMe: false },
  })
  const rememberMe = watch('rememberMe')

  // Lockout countdown
  useEffect(() => {
    if (!isLocked || lockCountdown <= 0) return
    const t = setTimeout(() => {
      setLockCountdown(c => { if (c <= 1) { setIsLocked(false); return 0 } return c - 1 })
    }, 1000)
    return () => clearTimeout(t)
  }, [isLocked, lockCountdown])

  // 2FA input handler
  const handle2FAInput = (idx: number, val: string) => {
    const cleaned = val.replace(/\D/, '').slice(-1)
    const next = [...twoFACode]
    next[idx] = cleaned
    setTwoFACode(next)
    if (cleaned && idx < 5) otpRefs.current[idx + 1]?.focus()
    if (!cleaned && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  const regenerateCaptcha = () => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
    setCaptchaError(false)
  }

  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) return
    setError(null); setCaptchaError(false); setTwoFAError(false)
    if (showCaptcha && captchaInput.trim() !== captcha.answer) { setCaptchaError(true); regenerateCaptcha(); return }
    if (show2FA) {
      const code = twoFACode.join('')
      if (code.length !== 6) { setTwoFAError(true); return }
      toast.success('2FA verified!', { description: 'Signing you in…' })
    }
    setIsLoading(true)
    try {
      const result = await signIn('credentials', { email: data.email, password: data.password, loginType: 'vendor', redirect: false })
      if (result?.error) {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        if (newAttempts >= 5) { setIsLocked(true); setLockCountdown(30); setError('Too many failed attempts. Account locked for 30 seconds.'); return }
        if (newAttempts >= 3 && !showCaptcha) { setShowCaptcha(true); regenerateCaptcha() }
        const remaining = 5 - newAttempts
        if (result.error === 'CredentialsSignin') setError(`Invalid email or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`)
        else if (result.error === 'VendorNotApproved') setError('Your vendor account is pending approval.')
        else if (result.error === 'VendorSuspended') setError('Your account has been suspended. Contact support.')
        else setError(result.error || 'Login failed. Please try again.')
        toast.error('Login Failed', { description: 'Please check your credentials.' })
        return
      }
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      if (session?.user?.role === 'vendor') {
        setLoginAttempts(0)
        toast.success('Welcome back!', { description: 'Redirecting to your dashboard…' })
        router.push(callbackUrl); router.refresh()
      } else if (session?.user?.role === 'admin' || session?.user?.role === 'super-admin') {
        toast.info('Admin Access Detected', { description: 'Redirecting to admin dashboard…' })
        router.push('/admin/dashboard'); router.refresh()
      } else {
        setError('You do not have vendor access. Please use a vendor account.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      toast.error('Login Error', { description: 'Please try again or contact support.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = watch('email')
    if (!email) { toast.error('Enter your email first', { description: 'We need your email to send a reset link.' }); return }
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      if (res.ok) toast.success('Reset link sent!', { description: 'Check your inbox.' })
      else toast.error('Could not send reset link')
    } catch { toast.error('Error', { description: 'Failed to send reset link.' }) }
  }

  return (
    <div className="fixed inset-0 z-0 w-screen h-screen overflow-y-auto overflow-x-hidden bg-slate-50" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div className="flex flex-col min-h-full w-full">
      <ColorfulHeader />
      {/* spacer so page content clears the fixed header */}
      <div className="h-[66px] shrink-0" aria-hidden="true" />
      <LiveTicker />

      {/* ── FULL-WIDTH SPLIT BODY ──────────────────────────────────────────── */}
      <div className="w-full flex flex-col lg:flex-row flex-1">
        {/* LEFT — brand showcase */}
        <div className="w-full lg:w-[56%] relative overflow-hidden p-8 xl:p-14 flex flex-col justify-between gap-8 min-h-[560px]">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 82% 18%, rgba(236,72,153,0.25), transparent 42%), radial-gradient(circle at 12% 88%, rgba(99,102,241,0.4), transparent 50%), radial-gradient(circle at 50% 50%, rgba(167,139,250,0.12), transparent 60%)' }} />
          <motion.div animate={{ y: [0, 18, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }} className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <motion.div animate={{ y: [0, -22, 0], x: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 13, ease: 'easeInOut' }} className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            {/* hero + benefits */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-violet-100 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                  <Sparkles className="h-3 w-3" /> India's trusted rental marketplace
                </span>
                <h1 className="text-3xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                  Grow your rental<br />
                  <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">business with RentEase</span>
                </h1>
                <p className="text-violet-100/80 mt-3 text-base leading-relaxed max-w-md">
                  Join 50,000+ vendors renting & selling furniture, appliances, electronics and home items on India's most trusted marketplace.
                </p>
              </div>
              {/* benefits grid */}
              <div className="grid grid-cols-2 gap-3">
                {VENDOR_BENEFITS.map((b, i) => {
                  const Icon = b.icon
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.07 }} className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 hover:bg-white/15 hover:-translate-y-0.5 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center mb-2 group-hover:bg-amber-400/30 transition-colors">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-white">{b.title}</p>
                      <p className="text-xs text-violet-100/70 leading-relaxed mt-0.5">{b.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* testimonial */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="max-w-md">
              <TestimonialCarousel />
            </motion.div>

            {/* stats */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15 pt-5 backdrop-blur-sm">
              {STATS.map((s, i) => <AnimatedStat key={i} stat={s} index={i} />)}
            </motion.div>
          </div>
        </div>

        {/* RIGHT — login form */}
        <div className="w-full lg:w-[44%] flex flex-col bg-white">
          <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20 bg-white">
            <div className="w-full max-w-md mx-auto">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-sm text-slate-500 mt-1">Sign in to your vendor account to continue</p>
              </motion.div>

              {/* device banner */}
              <AnimatePresence>
                {showDeviceBanner && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mt-5 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                    <Monitor className="h-4 w-4 text-indigo-500 shrink-0" />
                    <p className="text-xs text-indigo-700 flex-1">Signing in on <strong>{deviceInfo.device}</strong> · {deviceInfo.browser} · {deviceInfo.os}</p>
                    <button onClick={() => setShowDeviceBanner(false)} className="text-indigo-400 hover:text-indigo-600"><X className="h-3.5 w-3.5" /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
                    <Alert className="border-red-200 bg-red-50"><AlertCircle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-700 text-sm">{error}</AlertDescription></Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* lockout */}
              <AnimatePresence>
                {isLocked && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <TriangleAlert className="h-5 w-5 text-amber-500 shrink-0" />
                    <div><p className="text-sm font-semibold text-amber-800">Account temporarily locked</p><p className="text-xs text-amber-600">Too many failed attempts. Try again in <strong>{lockCountdown}s</strong></p></div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* attempt warning */}
              <AnimatePresence>
                {loginAttempts >= 2 && loginAttempts < 5 && !isLocked && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                    <TriangleAlert className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700"><strong>{5 - loginAttempts} attempt{5 - loginAttempts > 1 ? 's' : ''}</strong> remaining before lockout.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FORM ─────────────────────────────────────────────── */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                {/* email */}
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address <span className="text-red-400">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="email" placeholder="vendor@example.com" className={cn('pl-10 rounded-xl border-slate-200 focus-visible:ring-indigo-300 focus-visible:border-indigo-500 h-11', errors.email && 'border-red-400')} {...register('email')} disabled={isLoading || isLocked} autoComplete="email" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>}
                </div>
                {/* password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password <span className="text-red-400">*</span></Label>
                    <button type="button" onClick={handleForgotPassword} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={cn('pl-10 pr-11 rounded-xl border-slate-200 focus-visible:ring-indigo-300 focus-visible:border-indigo-500 h-11', errors.password && 'border-red-400')} {...register('password')} disabled={isLoading || isLocked} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>}
                </div>

                {/* CAPTCHA */}
                <AnimatePresence>
                  {showCaptcha && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-600" /><p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Security Verification</p></div>
                        <div className="flex items-center gap-3">
                          <div className="bg-white border-2 border-indigo-300 rounded-lg px-4 py-2.5 font-mono font-bold text-lg text-slate-800 tracking-widest select-none">{captcha.question}</div>
                          <button type="button" onClick={regenerateCaptcha} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50"><RefreshCw className="h-4 w-4" /></button>
                        </div>
                        <Input placeholder="Enter your answer" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} className={cn('rounded-xl h-10 font-mono text-base', captchaError && 'border-red-400')} inputMode="numeric" />
                        {captchaError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Incorrect. A new challenge has been generated.</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2FA */}
                <AnimatePresence>
                  {show2FA && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-indigo-600" /><p className="text-sm font-semibold text-indigo-800">Two-Factor Authentication</p></div>
                        <p className="text-xs text-indigo-600">Enter the 6-digit code sent to your registered mobile number.</p>
                        <div className="flex gap-2 justify-center">
                          {twoFACode.map((digit, i) => (
                            <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handle2FAInput(i, e.target.value)} onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i - 1]?.focus() }} className={cn('w-11 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all', digit ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white', twoFAError && 'border-red-400', 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200')} />
                          ))}
                        </div>
                        {twoFAError && <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1"><AlertCircle className="h-3 w-3" /> Please enter all 6 digits</p>}
                        <p className="text-xs text-indigo-500 text-center">Didn't receive a code? <button type="button" className="font-semibold underline">Resend OTP</button></p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* remember me */}
                <div className="flex items-center gap-2">
                  <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={v => setValue('rememberMe', v as boolean)} disabled={isLoading || isLocked} className="rounded" />
                  <Label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer font-normal select-none">Remember me for 30 days</Label>
                </div>

                {/* submit */}
                <Button type="submit" disabled={isLoading || isLocked} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-base rounded-xl gap-2 shadow-lg shadow-indigo-300/40 transition-all">
                  {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>)
                    : isLocked ? (<><Clock className="h-4 w-4" /> Locked · {lockCountdown}s</>)
                      : (<><Shield className="h-4 w-4" /> Sign in to Vendor Portal</>)}
                </Button>

                {/* divider */}
                <div className="relative my-1"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">New to RentEase?</span></div></div>

                {/* register link */}
                <Link href="/vendor/register" className="flex items-center justify-center gap-2 w-full h-11 border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold text-sm rounded-xl transition-all group">
                  <Building2 className="h-4 w-4" /> Become a Vendor <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </form>

              {/* FAQ */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /> Frequently Asked Questions</p>
                <div className="bg-slate-50/70 rounded-xl px-4">
                  {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} isOpen={openFAQ === i} onToggle={() => setOpenFAQ(openFAQ === i ? null : i)} />)}
                </div>
              </div>

              {/* trust badges */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 text-center font-medium mb-3 uppercase tracking-wider">Secured & Compliant</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {TRUST_BADGES.map(b => <span key={b} className="flex items-center gap-1 text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full"><BadgeCheck className="h-3 w-3 text-indigo-500" /> {b}</span>)}
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-3">Protected by 256-bit SSL encryption · Your data is never shared</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BRAND MARQUEE ──────────────────────────────────────────────────── */}
      <BrandMarquee />

      {/* ── INTEGRATIONS STRIP ──────────────────────────────────────────────── */}
      <IntegrationsStrip />

      {/* ── ONBOARDING STEPS ──────────────────────────────────────────────── */}
      <OnboardingSteps />

      {/* ── PRICING TEASER ──────────────────────────────────────────────────── */}
      <div className="w-full py-12 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"><Gift className="h-3 w-3" /> Pricing</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Plans that scale with your business</h2>
            <p className="text-sm text-slate-500 mt-1">Start free and upgrade as you grow. No hidden charges, cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-center">
            {PRICING_TEASERS.map((p, i) => <PricingCard key={p.name} plan={p} i={i} />)}
          </div>
        </div>
      </div>

      {/* ── CTA BAND ───────────────────────────────────────────────────────── */}
      <CTABand />

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <Footer />

      {/* dev credentials */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 rounded-xl bg-amber-50 border border-amber-200 p-3 shadow-lg z-50">
          <p className="text-xs font-bold text-amber-800 mb-1">Dev Credentials</p>
          <p className="text-xs text-amber-700 font-mono">vendor@rentease.com</p>
          <p className="text-xs text-amber-700 font-mono">Vendor@123</p>
          <p className="text-[10px] text-amber-600 mt-1">Run <span className="font-mono">npm run seed:demo-vendor</span> in backend first.</p>
        </div>
      )}
      </div>
    </div>
  )
}