// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
// import { signIn } from 'next-auth/react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { toast } from 'sonner'
// import { motion, AnimatePresence } from 'framer-motion'
// import useEmblaCarousel from 'embla-carousel-react'
// import {
//   Mail, Lock, Eye, EyeOff, Shield,
//   ArrowRight, Smartphone, Package, MapPin,
//   AlertCircle, Loader2, Clock,
//   Truck, Gift, Star, Users,
//   CheckCircle2, Zap, HeadphonesIcon, Award, Wind, 
//   Bike, Sparkles, Wallet, Navigation2, CloudRain, Sun,
//   RefreshCcw,
// } from 'lucide-react'

// // ========== Validation Schema ==========
// const loginSchema = z.object({
//   email: z.string().email('Invalid email address').or(z.literal('')).optional(),
//   phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').or(z.literal('')).optional(),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
// }).refine((data) => data.email || data.phone, {
//   message: 'Either email or phone is required',
//   path: ['email'],
// })

// type LoginFormValues = z.infer<typeof loginSchema>

// // ========== Static Data ==========
// const deliveryStats = [
//   { label: 'Active Deliveries', value: '1,284', change: '+18%', icon: Package, color: '#f97316' },
//   { label: 'Delivery Partners', value: '3,245', change: '+12%', icon: Users, color: '#3b82f6' },
//   { label: 'Avg. Delivery Time', value: '24 min', change: '-8%', icon: Clock, color: '#10b981' },
//   { label: 'Customer Rating', value: '4.92', change: '+0.12', icon: Star, color: '#f59e0b' },
// ]

// const partnerHighlights = [
//   { icon: Zap, title: 'Express Delivery', desc: 'Priority routing system' },
//   { icon: Shield, title: 'Insurance Cover', desc: 'Up to ₹50K protection' },
//   { icon: HeadphonesIcon, title: '24/7 Dispatch', desc: 'Round-the-clock support' },
//   { icon: Award, title: 'Top Earner', desc: '₹60K+ monthly potential' },
// ]

// const trustBadges = [
//   { icon: Truck, text: '1Cr+ Deliveries' },
//   { icon: RefreshCcw, text: 'Real-time Tracking' },
//   { icon: MapPin, text: '850+ Cities' },
//   { icon: Wallet, text: 'Weekly Payouts' },
// ]

// const recentDeliveries = [
//   { id: 'DEL-001', status: 'delivered', time: '2m ago', location: 'Andheri East', amount: '₹249', dot: '#10b981' },
//   { id: 'DEL-002', status: 'picked', time: '15m ago', location: 'BKC', amount: '₹189', dot: '#f59e0b' },
//   { id: 'DEL-003', status: 'assigned', time: '32m ago', location: 'Powai', amount: '₹312', dot: '#3b82f6' },
// ]

// const carouselSlides = [
//   {
//     image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=500&fit=crop",
//     title: "Lightning Fast Delivery",
//     subtitle: "Average delivery time under 25 minutes",
//     color: "#f97316"
//   },
//   {
//     image: "https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=800&h=500&fit=crop",
//     title: "Earn While You Ride",
//     subtitle: "Make up to ₹60,000 per month",
//     color: "#3b82f6"
//   },
//   {
//     image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop",
//     title: "Fleet Management",
//     subtitle: "Smart dispatching & route optimization",
//     color: "#10b981"
//   },
//   {
//     image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=500&fit=crop",
//     title: "24/7 Support",
//     subtitle: "Always here for our delivery heroes",
//     color: "#8b5cf6"
//   }
// ]

// // ========== Main Component ==========
// export default function DeliveryLoginPage() {
//   const router = useRouter()
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [rememberMe, setRememberMe] = useState(false)
//   const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email')
//   const [mounted, setMounted] = useState(false)
//   const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 })
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [currentWeather, setCurrentWeather] = useState<'sunny' | 'rainy' | 'cloudy'>('sunny')

//   const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: { email: '', phone: '', password: '' },
//     mode: 'onChange',
//   })

//   useEffect(() => { setMounted(true) }, [])

//   // Auto-rotate carousel
//   useEffect(() => {
//     if (!emblaApi) return
//     const interval = setInterval(() => {
//       emblaApi.scrollNext()
//     }, 5000)
//     return () => clearInterval(interval)
//   }, [emblaApi])

//   // Update current slide index
//   const onSelect = useCallback(() => {
//     if (!emblaApi) return
//     setCurrentIndex(emblaApi.selectedScrollSnap())
//   }, [emblaApi])

//   useEffect(() => {
//     if (!emblaApi) return
//     emblaApi.on('select', onSelect)
//     onSelect()
//   }, [emblaApi, onSelect])

//   // Simulate weather changes for dynamic background
//   useEffect(() => {
//     const weathers: Array<'sunny' | 'rainy' | 'cloudy'> = ['sunny', 'cloudy', 'rainy']
//     const interval = setInterval(() => {
//       setCurrentWeather(weathers[Math.floor(Math.random() * weathers.length)])
//     }, 30000)
//     return () => clearInterval(interval)
//   }, [])

//   useEffect(() => {
//     if (activeTab === 'email') { setValue('phone', ''); trigger('email') }
//     else { setValue('email', ''); trigger('phone') }
//   }, [activeTab, setValue, trigger])

//   const onSubmit = async (data: LoginFormValues) => {
//     setIsLoading(true)
//     try {
//       if (activeTab === 'email' && !data.email) throw new Error('Please enter your email address')
//       if (activeTab === 'phone' && !data.phone) throw new Error('Please enter your phone number')

//       const credentials: any = {
//         password: data.password,
//         loginType: 'delivery_partner',
//         redirect: false,
//         callbackUrl: '/delivery/dashboard',
//       }
//       if (activeTab === 'email') credentials.email = data.email
//       else credentials.phone = data.phone

//       const result = await signIn('credentials', credentials)
//       if (result?.error) throw new Error(result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error)
//       if (!result?.ok) throw new Error('Login failed. Please try again.')

//       toast.success('Welcome back, Delivery Partner!', { description: 'Redirecting to your dashboard...' })
//       if (rememberMe) localStorage.setItem('delivery_remember_me', 'true')
//       else localStorage.removeItem('delivery_remember_me')
//       router.replace('/delivery/dashboard')
//     } catch (error: any) {
//       toast.error('Login failed', { description: error.message || 'Invalid credentials.' })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (!mounted) return null

//   // Dynamic weather styles
//   const getWeatherGradient = () => {
//     switch(currentWeather) {
//       case 'sunny': return 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #eab308 100%)'
//       case 'rainy': return 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
//       case 'cloudy': return 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)'
//       default: return 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #eab308 100%)'
//     }
//   }

//   const getWeatherIcon = () => {
//     switch(currentWeather) {
//       case 'sunny': return <Sun size={14} className="text-yellow-200" />
//       case 'rainy': return <CloudRain size={14} className="text-blue-200" />
//       case 'cloudy': return <Wind size={14} className="text-gray-200" />
//       default: return <Sun size={14} className="text-yellow-200" />
//     }
//   }

//   return (
//     <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Nunito:wght@700;800;900&display=swap');

//         * { box-sizing: border-box; margin: 0; padding: 0; }

//         .left-panel {
//           background: ${getWeatherGradient()};
//           border-radius: 24px;
//           padding: 32px;
//           position: relative;
//           overflow: hidden;
//           display: flex;
//           flex-direction: column;
//           gap: 24px;
//           transition: background 0.5s ease;
//         }
//         .left-panel::before {
//           content: '';
//           position: absolute;
//           top: -150px; right: -100px;
//           width: 400px; height: 400px;
//           background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
//           border-radius: 50%;
//         }
//         .left-panel::after {
//           content: '';
//           position: absolute;
//           bottom: -150px; left: -100px;
//           width: 400px; height: 400px;
//           background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
//           border-radius: 50%;
//         }

//         .carousel-container {
//           overflow: hidden;
//           border-radius: 20px;
//           box-shadow: 0 20px 35px -12px rgba(0,0,0,0.25);
//           position: relative;
//         }
//         .carousel-slide {
//           position: relative;
//           border-radius: 20px;
//           overflow: hidden;
//           cursor: pointer;
//         }
//         .carousel-slide img {
//           width: 100%;
//           height: 220px;
//           object-fit: cover;
//           transition: transform 0.3s ease;
//         }
//         .carousel-slide:hover img {
//           transform: scale(1.05);
//         }
//         .carousel-overlay {
//           position: absolute;
//           bottom: 0;
//           left: 0;
//           right: 0;
//           background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
//           padding: 20px;
//           color: white;
//         }

//         .stat-card {
//           background: rgba(255,255,255,0.12);
//           backdrop-filter: blur(8px);
//           border: 1px solid rgba(255,255,255,0.2);
//           border-radius: 16px;
//           padding: 14px;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           cursor: default;
//         }
//         .stat-card:hover {
//           background: rgba(255,255,255,0.2);
//           transform: translateY(-3px) scale(1.02);
//           box-shadow: 0 12px 25px -10px rgba(0,0,0,0.3);
//         }

//         .highlight-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 10px 12px;
//           border-radius: 12px;
//           transition: all 0.2s ease;
//           cursor: default;
//           background: rgba(255,255,255,0.05);
//         }
//         .highlight-item:hover { background: rgba(255,255,255,0.12); transform: translateX(5px); }

//         .form-card {
//           background: #ffffff;
//           border-radius: 24px;
//           padding: 32px 28px;
//           box-shadow: 0 20px 35px -12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05);
//           border: 1px solid rgba(0,0,0,0.05);
//         }

//         .tab-row { display: grid; grid-template-columns: 1fr 1fr; background: #f1f5f9; border-radius: 12px; padding: 4px; gap: 4px; }
//         .tab-btn {
//           padding: 10px 12px;
//           border-radius: 9px;
//           border: none;
//           cursor: pointer;
//           font-size: 13px;
//           font-weight: 600;
//           transition: all 0.2s;
//           color: #64748b;
//           background: transparent;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//         }
//         .tab-btn.active {
//           background: #ffffff;
//           color: #f97316;
//           box-shadow: 0 2px 8px rgba(249,115,22,0.12);
//         }
//         .tab-btn:hover:not(.active) { color: #f97316; background: rgba(249,115,22,0.05); }

//         .field-wrap { display: flex; flex-direction: column; gap: 6px; }
//         .field-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
//         .field-input {
//           width: 100%;
//           padding: 12px 14px 12px 40px;
//           border-radius: 12px;
//           font-size: 14px;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//           color: #1e293b;
//           outline: none;
//           transition: all 0.2s;
//           background: #f8fafc;
//           border: 1.5px solid #e2e8f0;
//         }
//         .field-input:focus {
//           border-color: #f97316;
//           box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
//           background: #fff;
//         }
//         .field-input.has-error { border-color: #ef4444; background: #fef2f2; }
//         .field-error { font-size: 11px; color: #ef4444; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

//         .submit-btn {
//           width: 100%; padding: 14px;
//           border-radius: 12px; border: none; cursor: pointer;
//           font-size: 14px; font-weight: 700;
//           background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
//           transition: all 0.2s;
//           display: flex; align-items: center; justify-content: center; gap: 8px;
//           box-shadow: 0 4px 14px rgba(249,115,22,0.3);
//         }
//         .submit-btn:hover:not(:disabled) {
//           background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
//           box-shadow: 0 6px 20px rgba(249,115,22,0.4);
//           transform: translateY(-2px);
//         }
//         .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

//         .top-nav {
//           background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
//           box-shadow: 0 4px 20px rgba(249,115,22,0.25);
//         }

//         .trust-strip {
//           background: linear-gradient(90deg, #fffbeb, #fef3c7, #fffbeb);
//           border-bottom: 1px solid #fde68a;
//         }

//         .delivery-banner {
//           background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
//           border-radius: 16px;
//           padding: 14px 20px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           border: 1px solid #fcd34d;
//         }

//         .badge-3d {
//           background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
//           backdrop-filter: blur(8px);
//           border-radius: 30px;
//           padding: 6px 14px;
//           border: 1px solid rgba(255,255,255,0.3);
//         }

//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-8px); }
//         }
//         .float-animation { animation: float 4s ease-in-out infinite; }

//         @keyframes pulse-ring {
//           0% { transform: scale(0.8); opacity: 0.6; }
//           100% { transform: scale(1.4); opacity: 0; }
//         }
//         .pulse-ring::before {
//           content: '';
//           position: absolute;
//           inset: -4px;
//           border-radius: 50%;
//           background: #f97316;
//           animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }

//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//         .spin { animation: spin 1s linear infinite; }

//         @media (max-width: 1024px) {
//           .left-panel { display: none; }
//           .main-grid { grid-template-columns: 1fr !important; max-width: 480px !important; }
//         }
//       `}</style>

//       {/* TOP NAVIGATION */}
//       <nav className="top-nav">
//         <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Truck size={18} color="white" strokeWidth={2} />
//             </div>
//             <div>
//               <span style={{ color: 'white', fontWeight: 900, fontSize: '20px', fontFamily: 'Nunito, sans-serif', letterSpacing: '-0.5px' }}>RentEase</span>
//               <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginLeft: '8px', fontWeight: 600, background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '20px' }}>Delivery Partner</span>
//             </div>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//             <div className="badge-3d" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//               {getWeatherIcon()}
//               <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>
//                 {currentWeather === 'sunny' ? 'Clear skies, good for deliveries' : currentWeather === 'rainy' ? 'Rain alert, drive safe' : 'Cloudy, 22°C'}
//               </span>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//               <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', position: 'relative' }} />
//               <span style={{ color: '#dcfce7', fontSize: '12px', fontWeight: 600 }}>2,345 Active Riders</span>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* TRUST STRIP */}
//       <div className="trust-strip" style={{ padding: '8px 28px' }}>
//         <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
//           {trustBadges.map((b) => (
//             <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//               <b.icon size={13} color="#92400e" />
//               <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>{b.text}</span>
//             </div>
//           ))}
//           <div className="delivery-banner" style={{ padding: '4px 12px', gap: '8px' }}>
//             <Sparkles size={14} color="#ea580c" />
//             <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c' }}>🔥 Refer & Earn: ₹500 per successful referral</span>
//           </div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 28px 48px', minHeight: 'calc(100vh - 116px)', display: 'flex', alignItems: 'center' }}>
//         <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: '32px', width: '100%', alignItems: 'stretch' }}>

//           {/* LEFT PANEL - Enhanced with Carousel & 3D Elements */}
//           <motion.div
//             className="left-panel"
//             initial={{ opacity: 0, x: -24 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//           >
//             {/* 3D Carousel Section */}
//             <div style={{ position: 'relative', zIndex: 2 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//                 <div className="badge-3d" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                   <Navigation2 size={12} color="white" />
//                   <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>Live Fleet Updates</span>
//                 </div>
//                 <div style={{ display: 'flex', gap: '6px' }}>
//                   {carouselSlides.map((_, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => emblaApi?.scrollTo(idx)}
//                       style={{
//                         width: currentIndex === idx ? '24px' : '6px',
//                         height: '6px',
//                         borderRadius: '10px',
//                         background: currentIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
//                         transition: 'all 0.2s',
//                         cursor: 'pointer',
//                         border: 'none'
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>
//               <div className="carousel-container" ref={emblaRef}>
//                 <div style={{ display: 'flex' }}>
//                   {carouselSlides.map((slide, idx) => (
//                     <div key={idx} className="carousel-slide" style={{ flex: '0 0 100%', minWidth: 0 }}>
//                       <img src={slide.image} alt={slide.title} loading="lazy" />
//                       <div className="carousel-overlay">
//                         <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>{slide.title}</h3>
//                         <p style={{ fontSize: '12px', opacity: 0.9 }}>{slide.subtitle}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Hero Text */}
//             <div style={{ position: 'relative', zIndex: 2 }}>
//               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '30px', padding: '5px 14px', marginBottom: '16px' }}>
//                 <Bike size={13} color="#fde68a" />
//                 <span style={{ fontSize: '11px', fontWeight: 700, color: '#fef3c7' }}>Join India's Fastest Growing Delivery Network</span>
//               </div>
//               <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '32px', color: 'white', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.3px' }}>
//                 Deliver Happiness,<br />
//                 <span style={{ color: '#fde68a' }}>Earn Big with RentEase</span>
//               </h1>
//               <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.6, maxWidth: '380px' }}>
//                 India's premier delivery platform. Get instant payouts, insurance coverage, and 24/7 support.
//               </p>
//             </div>

//             {/* Stats Grid */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', position: 'relative', zIndex: 2 }}>
//               {deliveryStats.map((stat, i) => (
//                 <motion.div
//                   key={stat.label}
//                   className="stat-card"
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.1 + i * 0.08 }}
//                 >
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
//                     <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                       <stat.icon size={15} color="white" />
//                     </div>
//                     <span style={{ fontSize: '11px', fontWeight: 700, color: '#fde68a', background: 'rgba(253,230,138,0.2)', padding: '2px 8px', borderRadius: '20px' }}>
//                       {stat.change}
//                     </span>
//                   </div>
//                   <p style={{ fontSize: '24px', fontWeight: 900, color: 'white', fontFamily: 'Nunito, sans-serif' }}>{stat.value}</p>
//                   <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '4px' }}>{stat.label}</p>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Partner Highlights */}
//             <div style={{ position: 'relative', zIndex: 2 }}>
//               <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
//                 Why Deliver with Us?
//               </p>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
//                 {partnerHighlights.map((h, i) => (
//                   <motion.div
//                     key={h.title}
//                     className="highlight-item"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.4 + i * 0.06 }}
//                   >
//                     <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                       <h.icon size={14} color="rgba(255,255,255,0.9)" />
//                     </div>
//                     <div>
//                       <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{h.title}</p>
//                       <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{h.desc}</p>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>

//             {/* Recent Activity Feed with 3D effect */}
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.58 }}
//               style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '18px', position: 'relative', zIndex: 2 }}
//             >
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
//                 <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
//                   <Clock size={10} style={{ display: 'inline', marginRight: '5px' }} /> Live Orders
//                 </span>
//                 <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', position: 'relative' }} />
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 {recentDeliveries.map((item, i) => (
//                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                     <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dot, boxShadow: `0 0 6px ${item.dot}`, flexShrink: 0 }} />
//                     <div style={{ flex: 1 }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
//                         <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.id}</span>
//                         <span style={{ fontSize: '11px', fontWeight: 700, color: '#fde68a' }}>{item.amount}</span>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
//                         <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}><MapPin size={8} style={{ display: 'inline', marginRight: '3px' }} />{item.location}</span>
//                         <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>{item.time}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* 3D Floating Element */}
//             <div className="float-animation" style={{ position: 'absolute', bottom: '30px', right: '20px', zIndex: 1, opacity: 0.4 }}>
//               <Truck size={80} color="rgba(255,255,255,0.15)" strokeWidth={1} />
//             </div>
//           </motion.div>

//           {/* RIGHT PANEL - Login Form */}
//           <motion.div
//             initial={{ opacity: 0, x: 24 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.15 }}
//             style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
//           >
//             <div className="form-card">
//               {/* Header */}
//               <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
//                 <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(249,115,22,0.3)' }}>
//                   <Truck size={22} color="white" strokeWidth={2} />
//                 </div>
//                 <div>
//                   <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '22px', color: '#1e293b' }}>Delivery Portal</h2>
//                   <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Access your delivery dashboard</p>
//                 </div>
//               </div>

//               <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', margin: '0 0 20px' }} />

//               {/* Login Tabs */}
//               <div className="tab-row" style={{ marginBottom: '22px' }}>
//                 {(['email', 'phone'] as const).map((tab) => (
//                   <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
//                     {tab === 'email' ? <Mail size={13} /> : <Smartphone size={13} />}
//                     {tab === 'email' ? 'Email Login' : 'Phone Login'}
//                   </button>
//                 ))}
//               </div>

//               <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={activeTab}
//                     initial={{ opacity: 0, y: 5 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -5 }}
//                     className="field-wrap"
//                   >
//                     <label className="field-label">{activeTab === 'email' ? 'Email Address' : 'Phone Number'}</label>
//                     <div style={{ position: 'relative' }}>
//                       {activeTab === 'email' ? (
//                         <>
//                           <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
//                           <input
//                             type="email"
//                             placeholder="delivery@rentease.com"
//                             className={`field-input ${errors.email ? 'has-error' : ''}`}
//                             {...register('email')}
//                             disabled={isLoading}
//                           />
//                         </>
//                       ) : (
//                         <>
//                           <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '5px' }}>
//                             <Smartphone size={13} color="#94a3b8" />
//                             <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>+91</span>
//                             <span style={{ width: '1px', height: '14px', background: '#cbd5e1' }} />
//                           </div>
//                           <input
//                             type="tel"
//                             placeholder="9876543210"
//                             className={`field-input ${errors.phone ? 'has-error' : ''}`}
//                             style={{ paddingLeft: '66px' }}
//                             {...register('phone')}
//                             disabled={isLoading}
//                           />
//                         </>
//                       )}
//                     </div>
//                     {(errors.email || errors.phone) && (
//                       <p className="field-error"><AlertCircle size={11} /> {activeTab === 'email' ? errors.email?.message : errors.phone?.message}</p>
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 {/* Password */}
//                 <div className="field-wrap">
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <label className="field-label">Password</label>
//                     <a href="/delivery/forgot-password" style={{ fontSize: '12px', color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Forgot?</a>
//                   </div>
//                   <div style={{ position: 'relative' }}>
//                     <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       placeholder="Enter your password"
//                       className={`field-input ${errors.password ? 'has-error' : ''}`}
//                       style={{ paddingRight: '44px' }}
//                       {...register('password')}
//                       disabled={isLoading}
//                     />
//                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
//                       {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
//                     </button>
//                   </div>
//                   {errors.password && <p className="field-error"><AlertCircle size={11} /> {errors.password.message}</p>}
//                 </div>

//                 {/* Remember Me */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <div
//                     onClick={() => setRememberMe(!rememberMe)}
//                     style={{
//                       width: '18px', height: '18px', borderRadius: '5px', cursor: 'pointer',
//                       background: rememberMe ? '#f97316' : '#f1f5f9',
//                       border: rememberMe ? '1.5px solid #f97316' : '1.5px solid #cbd5e1',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center'
//                     }}
//                   >
//                     {rememberMe && <CheckCircle2 size={11} color="white" strokeWidth={3} />}
//                   </div>
//                   <span onClick={() => setRememberMe(!rememberMe)} style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>Keep me signed in</span>
//                 </div>

//                 {/* Submit Button */}
//                 <button type="submit" disabled={isLoading} className="submit-btn" style={{ marginTop: '6px' }}>
//                   {isLoading ? <><Loader2 size={16} className="spin" /> Authenticating...</> : <>Access Dashboard <ArrowRight size={15} /></>}
//                 </button>

//                 {/* Security & Trust */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0', margin: '4px 0' }}>
//                   <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
//                   <span style={{ padding: '0 12px', fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Secure Login</span>
//                   <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'center', gap: '28px' }}>
//                   {[
//                     { icon: Shield, label: '256-bit SSL' },
//                     { icon: CheckCircle2, label: '2FA Ready' },
//                     { icon: Clock, label: 'Auto Logout' },
//                   ].map((b) => (
//                     <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                       <b.icon size={12} color="#94a3b8" />
//                       <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{b.label}</span>
//                     </div>
//                   ))}
//                 </div>
//               </form>
//             </div>

//             {/* Partner Benefits Card */}
//             <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '20px', padding: '18px 20px', border: '1px solid #fcd34d' }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <div style={{ background: 'white', borderRadius: '10px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
//                     <Gift size={16} color="#ea580c" />
//                   </div>
//                   <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>Partner Benefits</span>
//                 </div>
//                 <span style={{ background: 'white', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 800, color: '#ea580c' }}>Limited Offer</span>
//               </div>
//               <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
//                 <div><span style={{ fontWeight: 800, color: '#92400e' }}>₹500</span> <span style={{ fontSize: '11px', color: '#78350f' }}>Referral Bonus</span></div>
//                 <div><span style={{ fontWeight: 800, color: '#92400e' }}>Free</span> <span style={{ fontSize: '11px', color: '#78350f' }}>Insurance Coverage</span></div>
//                 <div><span style={{ fontWeight: 800, color: '#92400e' }}>Weekly</span> <span style={{ fontSize: '11px', color: '#78350f' }}>Payouts</span></div>
//               </div>
//             </div>

//             {/* Support & Policy Links */}
//             <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
//               Delivery partner support:{' '}
//               <a href="tel:1800123456" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>1-800-DELIVER</a>
//               {' '}·{' '}
//               <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Partner Policies</a>
//             </p>
//           </motion.div>
//         </div>
//       </div>

//       {/* FOOTER */}
//       <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 28px' }}>
//         <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
//           <span style={{ fontSize: '11px', color: '#94a3b8' }}>© 2025 RentEase Technologies. Delivering Excellence.</span>
//           <div style={{ display: 'flex', gap: '24px' }}>
//             {['Partner Terms', 'Safety Guidelines', 'Payout Policy', 'Support'].map((link) => (
//               <a key={link} href="#" style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>{link}</a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Mail, Lock, Eye, EyeOff, Shield,
  ArrowRight, Smartphone, Package, MapPin,
  AlertCircle, Loader2, Clock,
  Truck, Gift, Star, Users,
  CheckCircle2, Zap, HeadphonesIcon, Award, Wind,
  Bike, Sparkles, Wallet, Navigation2, CloudRain, Sun,
  RefreshCcw, TrendingUp, Quote, BadgeCheck, Menu, X,
  IndianRupee, Timer, ShieldCheck, ThumbsUp,
} from 'lucide-react'

// ========== Validation Schema ==========
const loginSchema = z.object({
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').or(z.literal('')).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
})

type LoginFormValues = z.infer<typeof loginSchema>

// ========== Static Data ==========
const deliveryStats = [
  { label: 'Active Deliveries', value: '1,284', change: '+18%', icon: Package, color: '#f97316' },
  { label: 'Delivery Partners', value: '3,245', change: '+12%', icon: Users, color: '#3b82f6' },
  { label: 'Avg. Delivery Time', value: '24 min', change: '-8%', icon: Clock, color: '#10b981' },
  { label: 'Customer Rating', value: '4.92', change: '+0.12', icon: Star, color: '#f59e0b' },
]

const partnerHighlights = [
  { icon: Zap, title: 'Express Delivery', desc: 'Priority routing system' },
  { icon: Shield, title: 'Insurance Cover', desc: 'Up to ₹50K protection' },
  { icon: HeadphonesIcon, title: '24/7 Dispatch', desc: 'Round-the-clock support' },
  { icon: Award, title: 'Top Earner', desc: '₹60K+ monthly potential' },
]

const trustBadges = [
  { icon: Truck, text: '1Cr+ Deliveries' },
  { icon: RefreshCcw, text: 'Real-time Tracking' },
  { icon: MapPin, text: '850+ Cities' },
  { icon: Wallet, text: 'Weekly Payouts' },
]

const recentDeliveries = [
  { id: 'DEL-001', status: 'delivered', time: '2m ago', location: 'Andheri East', amount: '₹249', dot: '#10b981' },
  { id: 'DEL-002', status: 'picked', time: '15m ago', location: 'BKC', amount: '₹189', dot: '#f59e0b' },
  { id: 'DEL-003', status: 'assigned', time: '32m ago', location: 'Powai', amount: '₹312', dot: '#3b82f6' },
]

const carouselSlides = [
  {
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=500&fit=crop",
    title: "Lightning Fast Delivery",
    subtitle: "Average delivery time under 25 minutes",
    color: "#f97316"
  },
  {
    image: "https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=800&h=500&fit=crop",
    title: "Earn While You Ride",
    subtitle: "Make up to ₹60,000 per month",
    color: "#3b82f6"
  },
  {
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop",
    title: "Fleet Management",
    subtitle: "Smart dispatching & route optimization",
    color: "#10b981"
  },
  {
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=500&fit=crop",
    title: "24/7 Support",
    subtitle: "Always here for our delivery heroes",
    color: "#8b5cf6"
  }
]

// ========== NEW Premium Static Content ==========
const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Top Partner · Mumbai',
    text: 'Earning ₹58,000 a month with flexible hours. RentEase changed my life completely.',
    rating: 5,
    avatar: 'RK',
    color: '#f97316'
  },
  {
    name: 'Amit Sharma',
    role: 'Elite Rider · Delhi',
    text: 'Weekly payouts hit my account on time, every time. Best delivery platform in India.',
    rating: 5,
    avatar: 'AS',
    color: '#3b82f6'
  },
  {
    name: 'Suresh Patel',
    role: 'Fleet Lead · Bangalore',
    text: 'The insurance coverage and 24/7 support gives me complete peace of mind on the road.',
    rating: 5,
    avatar: 'SP',
    color: '#10b981'
  },
]

const howItWorks = [
  { step: '01', icon: BadgeCheck, title: 'Sign In', desc: 'Login to your verified partner account' },
  { step: '02', icon: Navigation2, title: 'Accept Orders', desc: 'Get smart-routed delivery requests' },
  { step: '03', icon: Wallet, title: 'Get Paid', desc: 'Receive weekly instant payouts' },
]

const achievements = [
  { icon: IndianRupee, value: '₹60K+', label: 'Monthly Earnings' },
  { icon: Timer, value: '24 min', label: 'Avg Delivery' },
  { icon: ShieldCheck, value: '100%', label: 'Insured Rides' },
  { icon: ThumbsUp, value: '4.92★', label: 'Partner Rating' },
]

// ========== Main Component ==========
export default function DeliveryLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email')
  const [mounted, setMounted] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentWeather, setCurrentWeather] = useState<'sunny' | 'rainy' | 'cloudy'>('sunny')
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', phone: '', password: '' },
    mode: 'onChange',
  })

  useEffect(() => { setMounted(true) }, [])

  // Auto-rotate carousel
  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)
    return () => clearInterval(interval)
  }, [emblaApi])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  useEffect(() => {
    const weathers: Array<'sunny' | 'rainy' | 'cloudy'> = ['sunny', 'cloudy', 'rainy']
    const interval = setInterval(() => {
      setCurrentWeather(weathers[Math.floor(Math.random() * weathers.length)])
    }, 30000)
    return () => clearInterval(interval)
  }, [])

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
        password: data.password,
        loginType: 'delivery_partner',
        redirect: false,
        callbackUrl: '/delivery/dashboard',
      }
      if (activeTab === 'email') credentials.email = data.email
      else credentials.phone = data.phone

      const result = await signIn('credentials', credentials)
      if (result?.error) throw new Error(result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error)
      if (!result?.ok) throw new Error('Login failed. Please try again.')

      toast.success('Welcome back, Delivery Partner!', { description: 'Redirecting to your dashboard...' })
      if (rememberMe) localStorage.setItem('delivery_remember_me', 'true')
      else localStorage.removeItem('delivery_remember_me')
      router.replace('/delivery/dashboard')
    } catch (error: any) {
      toast.error('Login failed', { description: error.message || 'Invalid credentials.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  const getWeatherGradient = () => {
    switch(currentWeather) {
      case 'sunny': return 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #eab308 100%)'
      case 'rainy': return 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
      case 'cloudy': return 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)'
      default: return 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #eab308 100%)'
    }
  }

  const getWeatherIcon = () => {
    switch(currentWeather) {
      case 'sunny': return <Sun size={14} className="text-yellow-200" />
      case 'rainy': return <CloudRain size={14} className="text-blue-200" />
      case 'cloudy': return <Wind size={14} className="text-gray-200" />
      default: return <Sun size={14} className="text-yellow-200" />
    }
  }

  const getWeatherText = () => {
    switch(currentWeather) {
      case 'sunny': return 'Clear skies, good for deliveries'
      case 'rainy': return 'Rain alert, drive safe'
      case 'cloudy': return 'Cloudy, 22°C'
      default: return 'Clear skies'
    }
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Nunito:wght@700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

        html { scroll-behavior: smooth; }

        /* ===== Layout Helpers ===== */
        .container-pad { max-width: 1280px; margin: 0 auto; padding-left: 28px; padding-right: 28px; }

        /* ===== Left Panel ===== */
        .left-panel {
          background: ${getWeatherGradient()};
          border-radius: 24px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transition: background 0.5s ease;
        }
        .left-panel::before {
          content: '';
          position: absolute;
          top: -150px; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          border-radius: 50%;
        }
        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -150px; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .carousel-container {
          overflow: hidden;
          border-radius: 20px;
          box-shadow: 0 20px 35px -12px rgba(0,0,0,0.25);
          position: relative;
        }
        .carousel-slide { position: relative; border-radius: 20px; overflow: hidden; cursor: pointer; }
        .carousel-slide img { width: 100%; height: 220px; object-fit: cover; transition: transform 0.4s ease; display: block; }
        .carousel-slide:hover img { transform: scale(1.05); }
        .carousel-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
          padding: 20px; color: white;
        }

        .stat-card {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px; padding: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }
        .stat-card:hover { background: rgba(255,255,255,0.2); transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 25px -10px rgba(0,0,0,0.3); }

        .highlight-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 12px;
          transition: all 0.2s ease; cursor: default;
          background: rgba(255,255,255,0.05);
        }
        .highlight-item:hover { background: rgba(255,255,255,0.12); transform: translateX(5px); }

        /* ===== Form Card ===== */
        .form-card {
          background: #ffffff; border-radius: 24px; padding: 32px 28px;
          box-shadow: 0 20px 35px -12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .tab-row { display: grid; grid-template-columns: 1fr 1fr; background: #f1f5f9; border-radius: 12px; padding: 4px; gap: 4px; }
        .tab-btn {
          padding: 10px 12px; border-radius: 9px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; transition: all 0.2s;
          color: #64748b; background: transparent;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .tab-btn.active { background: #ffffff; color: #f97316; box-shadow: 0 2px 8px rgba(249,115,22,0.12); }
        .tab-btn:hover:not(.active) { color: #f97316; background: rgba(249,115,22,0.05); }

        .field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
        .field-input {
          width: 100%; padding: 12px 14px 12px 40px; border-radius: 12px;
          font-size: 16px; /* 16px prevents iOS zoom */ font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1e293b; outline: none; transition: all 0.2s;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
        }
        @media (min-width: 640px) { .field-input { font-size: 14px; } }
        .field-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); background: #fff; }
        .field-input.has-error { border-color: #ef4444; background: #fef2f2; }
        .field-error { font-size: 11px; color: #ef4444; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

        .submit-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
          font-size: 14px; font-weight: 700; color: white;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(249,115,22,0.3);
        }
        .submit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); box-shadow: 0 6px 20px rgba(249,115,22,0.4); transform: translateY(-2px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .top-nav { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); box-shadow: 0 4px 20px rgba(249,115,22,0.25); position: sticky; top: 0; z-index: 50; }
        .trust-strip { background: linear-gradient(90deg, #fffbeb, #fef3c7, #fffbeb); border-bottom: 1px solid #fde68a; }

        .badge-3d {
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
          backdrop-filter: blur(8px); border-radius: 30px; padding: 6px 14px;
          border: 1px solid rgba(255,255,255,0.3);
        }

        /* ===== NEW Premium Sections ===== */
        .section-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 28px; color: #0f172a; letter-spacing: -0.5px; }
        .section-sub { font-size: 14px; color: #64748b; margin-top: 8px; max-width: 560px; }

        .premium-card {
          background: #fff; border-radius: 20px; padding: 24px;
          border: 1px solid #eef2f7; box-shadow: 0 4px 20px -8px rgba(0,0,0,0.06);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .premium-card:hover { transform: translateY(-6px); box-shadow: 0 24px 40px -16px rgba(249,115,22,0.18); border-color: #fed7aa; }

        .step-card {
          position: relative; background: #fff; border-radius: 20px; padding: 28px 24px;
          border: 1px solid #eef2f7; overflow: hidden; transition: all 0.3s;
        }
        .step-card:hover { border-color: #fed7aa; box-shadow: 0 20px 40px -16px rgba(249,115,22,0.2); }
        .step-num {
          position: absolute; top: -10px; right: 8px; font-family: 'Nunito', sans-serif;
          font-weight: 900; font-size: 72px; color: #f8fafc; z-index: 0; line-height: 1;
        }

        .achievement-card {
          background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
          border: 1px solid #fed7aa; border-radius: 18px; padding: 22px 18px; text-align: center;
          transition: all 0.3s;
        }
        .achievement-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 30px -12px rgba(249,115,22,0.25); }

        .testimonial-card { background: #fff; border-radius: 24px; padding: 32px; border: 1px solid #eef2f7; box-shadow: 0 10px 40px -12px rgba(0,0,0,0.08); }

        /* ===== Mobile Menu ===== */
        .mobile-menu-btn { display: none; }
        .nav-desktop-info { display: flex; }
        .mobile-drawer {
          background: linear-gradient(135deg, #ea580c, #c2410c);
          overflow: hidden;
        }

        /* ===== Animations ===== */
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float-animation { animation: float 4s ease-in-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        /* ===== RESPONSIVE BREAKPOINTS ===== */

        /* Tablet & below */
        @media (max-width: 1024px) {
          .left-panel { display: none; }
          .main-grid { grid-template-columns: 1fr !important; max-width: 480px !important; margin: 0 auto; }
        }

        /* Small tablet / large phone */
        @media (max-width: 768px) {
          .container-pad { padding-left: 18px; padding-right: 18px; }
          .nav-desktop-info { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .trust-strip-inner { gap: 16px !important; justify-content: flex-start !important; overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 2px; -ms-overflow-style: none; scrollbar-width: none; }
          .trust-strip-inner::-webkit-scrollbar { display: none; }
          .trust-badge-item { flex-shrink: 0; }
          .refer-banner { display: none !important; }
          .section-title { font-size: 23px !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .form-card { padding: 24px 18px !important; }
        }

        /* Phone */
        @media (max-width: 480px) {
          .container-pad { padding-left: 14px; padding-right: 14px; }
          .nav-logo-sub { display: none !important; }
          .nav-height { height: 56px !important; }
          .form-card { padding: 22px 16px !important; border-radius: 20px; }
          .section-title { font-size: 20px !important; }
          .trust-badge-text { font-size: 10px !important; }
          .footer-links { gap: 14px !important; }
          .achievement-card { padding: 18px 12px; }
          .testimonial-card { padding: 24px 18px; }
          .premium-card { padding: 20px; }
        }

        /* Extra small */
        @media (max-width: 360px) {
          .tab-btn { font-size: 11px; gap: 5px; padding: 9px 6px; }
          .grid-4 { gap: 10px !important; }
        }
      `}</style>

      {/* ============ TOP NAVIGATION (Responsive) ============ */}
      <nav className="top-nav">
        <div className="container-pad nav-height" style={{ height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Truck size={18} color="white" strokeWidth={2} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '20px', fontFamily: 'Nunito, sans-serif', letterSpacing: '-0.5px' }}>RentEase</span>
              <span className="nav-logo-sub" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginLeft: '8px', fontWeight: 600, background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '20px' }}>Delivery Partner</span>
            </div>
          </div>

          {/* Desktop Info */}
          <div className="nav-desktop-info" style={{ alignItems: 'center', gap: '16px' }}>
            <div className="badge-3d" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {getWeatherIcon()}
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>{getWeatherText()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ color: '#dcfce7', fontSize: '12px', fontWeight: 600 }}>2,345 Active Riders</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '10px', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="container-pad" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px' }}>
                  {getWeatherIcon()}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>{getWeatherText()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ color: '#dcfce7', fontSize: '12px', fontWeight: 600 }}>2,345 Active Riders Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px' }}>
                  <Sparkles size={14} color="#fde68a" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>Refer & Earn ₹500 per referral</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ============ TRUST STRIP (Responsive scroll on mobile) ============ */}
      <div className="trust-strip" style={{ padding: '8px 0' }}>
        <div className="container-pad trust-strip-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {trustBadges.map((b) => (
            <div key={b.text} className="trust-badge-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <b.icon size={13} color="#92400e" />
              <span className="trust-badge-text" style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', whiteSpace: 'nowrap' }}>{b.text}</span>
            </div>
          ))}
          <div className="refer-banner" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '16px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fcd34d' }}>
            <Sparkles size={14} color="#ea580c" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', whiteSpace: 'nowrap' }}>🔥 Refer & Earn: ₹500 per successful referral</span>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="container-pad" style={{ padding: '32px 28px 48px', display: 'flex', alignItems: 'center' }}>
        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: '32px', width: '100%', alignItems: 'stretch' }}>

          {/* LEFT PANEL */}
          <motion.div
            className="left-panel"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="badge-3d" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation2 size={12} color="white" />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>Live Fleet Updates</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => emblaApi?.scrollTo(idx)}
                      style={{
                        width: currentIndex === idx ? '24px' : '6px', height: '6px', borderRadius: '10px',
                        background: currentIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s', cursor: 'pointer', border: 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="carousel-container" ref={emblaRef}>
                <div style={{ display: 'flex' }}>
                  {carouselSlides.map((slide, idx) => (
                    <div key={idx} className="carousel-slide" style={{ flex: '0 0 100%', minWidth: 0 }}>
                      <img src={slide.image} alt={slide.title} loading="lazy" />
                      <div className="carousel-overlay">
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', fontFamily: 'Nunito, sans-serif' }}>{slide.title}</h3>
                        <p style={{ fontSize: '12px', opacity: 0.9 }}>{slide.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '30px', padding: '5px 14px', marginBottom: '16px' }}>
                <Bike size={13} color="#fde68a" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fef3c7' }}>Join India's Fastest Growing Delivery Network</span>
              </div>
              <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '32px', color: 'white', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.3px' }}>
                Deliver Happiness,<br />
                <span style={{ color: '#fde68a' }}>Earn Big with RentEase</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.6, maxWidth: '380px' }}>
                India's premier delivery platform. Get instant payouts, insurance coverage, and 24/7 support.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', position: 'relative', zIndex: 2 }}>
              {deliveryStats.map((stat, i) => (
                <motion.div key={stat.label} className="stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <stat.icon size={15} color="white" />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fde68a', background: 'rgba(253,230,138,0.2)', padding: '2px 8px', borderRadius: '20px' }}>{stat.change}</span>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: 'white', fontFamily: 'Nunito, sans-serif' }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '4px' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Why Deliver with Us?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {partnerHighlights.map((h, i) => (
                  <motion.div key={h.title} className="highlight-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.06 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <h.icon size={14} color="rgba(255,255,255,0.9)" />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{h.title}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{h.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
              style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '18px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <Clock size={10} style={{ display: 'inline', marginRight: '5px' }} /> Live Orders
                </span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentDeliveries.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dot, boxShadow: `0 0 6px ${item.dot}`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.id}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#fde68a' }}>{item.amount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}><MapPin size={8} style={{ display: 'inline', marginRight: '3px' }} />{item.location}</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="float-animation" style={{ position: 'absolute', bottom: '30px', right: '20px', zIndex: 1, opacity: 0.4 }}>
              <Truck size={80} color="rgba(255,255,255,0.15)" strokeWidth={1} />
            </div>
          </motion.div>

          {/* RIGHT PANEL - Login Form */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(249,115,22,0.3)', flexShrink: 0 }}>
                  <Truck size={22} color="white" strokeWidth={2} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '22px', color: '#1e293b' }}>Delivery Portal</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Access your delivery dashboard</p>
                </div>
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', margin: '0 0 20px' }} />

              <div className="tab-row" style={{ marginBottom: '22px' }}>
                {(['email', 'phone'] as const).map((tab) => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'email' ? <Mail size={13} /> : <Smartphone size={13} />}
                    {tab === 'email' ? 'Email Login' : 'Phone Login'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="field-wrap">
                    <label className="field-label">{activeTab === 'email' ? 'Email Address' : 'Phone Number'}</label>
                    <div style={{ position: 'relative' }}>
                      {activeTab === 'email' ? (
                        <>
                          <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input type="email" placeholder="delivery@rentease.com" className={`field-input ${errors.email ? 'has-error' : ''}`} {...register('email')} disabled={isLoading} />
                        </>
                      ) : (
                        <>
                          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Smartphone size={13} color="#94a3b8" />
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>+91</span>
                            <span style={{ width: '1px', height: '14px', background: '#cbd5e1' }} />
                          </div>
                          <input type="tel" placeholder="9876543210" className={`field-input ${errors.phone ? 'has-error' : ''}`} style={{ paddingLeft: '66px' }} {...register('phone')} disabled={isLoading} />
                        </>
                      )}
                    </div>
                    {(errors.email || errors.phone) && (
                      <p className="field-error"><AlertCircle size={11} /> {activeTab === 'email' ? errors.email?.message : errors.phone?.message}</p>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="field-wrap">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="field-label">Password</label>
                    <a href="/delivery/forgot-password" style={{ fontSize: '12px', color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Forgot?</a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className={`field-input ${errors.password ? 'has-error' : ''}`} style={{ paddingRight: '44px' }} {...register('password')} disabled={isLoading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="field-error"><AlertCircle size={11} /> {errors.password.message}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div onClick={() => setRememberMe(!rememberMe)} style={{ width: '18px', height: '18px', borderRadius: '5px', cursor: 'pointer', background: rememberMe ? '#f97316' : '#f1f5f9', border: rememberMe ? '1.5px solid #f97316' : '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {rememberMe && <CheckCircle2 size={11} color="white" strokeWidth={3} />}
                  </div>
                  <span onClick={() => setRememberMe(!rememberMe)} style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>Keep me signed in</span>
                </div>

                <button type="submit" disabled={isLoading} className="submit-btn" style={{ marginTop: '6px' }}>
                  {isLoading ? <><Loader2 size={16} className="spin" /> Authenticating...</> : <>Access Dashboard <ArrowRight size={15} /></>}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0', margin: '4px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ padding: '0 12px', fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Secure Login</span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' }}>
                  {[{ icon: Shield, label: '256-bit SSL' }, { icon: CheckCircle2, label: '2FA Ready' }, { icon: Clock, label: 'Auto Logout' }].map((b) => (
                    <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b.icon size={12} color="#94a3b8" />
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '20px', padding: '18px 20px', border: '1px solid #fcd34d' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'white', borderRadius: '10px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Gift size={16} color="#ea580c" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>Partner Benefits</span>
                </div>
                <span style={{ background: 'white', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 800, color: '#ea580c' }}>Limited Offer</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div><span style={{ fontWeight: 800, color: '#92400e' }}>₹500</span> <span style={{ fontSize: '11px', color: '#78350f' }}>Referral Bonus</span></div>
                <div><span style={{ fontWeight: 800, color: '#92400e' }}>Free</span> <span style={{ fontSize: '11px', color: '#78350f' }}>Insurance Coverage</span></div>
                <div><span style={{ fontWeight: 800, color: '#92400e' }}>Weekly</span> <span style={{ fontSize: '11px', color: '#78350f' }}>Payouts</span></div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
              Delivery partner support:{' '}
              <a href="tel:1800123456" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>1-800-DELIVER</a>
              {' '}·{' '}
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Partner Policies</a>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ============ NEW: ACHIEVEMENTS BAR ============ */}
      <div className="container-pad" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {achievements.map((a, i) => (
            <motion.div key={a.label} className="achievement-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div style={{ width: '44px', height: '44px', margin: '0 auto 12px', borderRadius: '14px', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(249,115,22,0.3)' }}>
                <a.icon size={20} color="white" />
              </div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '24px', color: '#0f172a' }}>{a.value}</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>{a.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============ NEW: HOW IT WORKS ============ */}
      <div className="container-pad" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff7ed', color: '#ea580c', fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '30px', border: '1px solid #fed7aa' }}>
            <TrendingUp size={13} /> Simple Process
          </span>
          <h2 className="section-title" style={{ marginTop: '16px' }}>Start Earning in 3 Easy Steps</h2>
          <p className="section-sub" style={{ margin: '8px auto 0' }}>From login to your first payout — we've made the entire journey seamless for our delivery partners.</p>
        </div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {howItWorks.map((s, i) => (
            <motion.div key={s.step} className="step-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <span className="step-num">{s.step}</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #fed7aa' }}>
                  <s.icon size={24} color="#ea580c" />
                </div>
                <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============ NEW: TESTIMONIALS ============ */}
      <div style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f8fafc 100%)', padding: '48px 0' }}>
        <div className="container-pad">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#ea580c', fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '30px', border: '1px solid #fed7aa' }}>
              <Star size={13} fill="#ea580c" /> Loved by 3,245+ Partners
            </span>
            <h2 className="section-title" style={{ marginTop: '16px' }}>What Our Partners Say</h2>
          </div>

          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIndex} className="testimonial-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <Quote size={36} color="#fed7aa" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '17px', color: '#334155', lineHeight: 1.6, fontWeight: 500, marginBottom: '20px' }}>"{testimonials[testimonialIndex].text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: testimonials[testimonialIndex].color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px', fontFamily: 'Nunito, sans-serif' }}>
                    {testimonials[testimonialIndex].avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{testimonials[testimonialIndex].name}</p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{testimonials[testimonialIndex].role}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: testimonials[testimonialIndex].rating }).map((_, idx) => (
                      <Star key={idx} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {testimonials.map((_, idx) => (
                <button key={idx} onClick={() => setTestimonialIndex(idx)} style={{ width: testimonialIndex === idx ? '28px' : '8px', height: '8px', borderRadius: '10px', background: testimonialIndex === idx ? '#f97316' : '#fed7aa', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ FOOTER (Responsive) ============ */}
      <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '20px 0' }}>
        <div className="container-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>© 2025 RentEase Technologies. Delivering Excellence.</span>
          <div className="footer-links" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {['Partner Terms', 'Safety Guidelines', 'Payout Policy', 'Support'].map((link) => (
              <a key={link} href="#" style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}