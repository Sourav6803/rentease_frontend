

// 'use client'

// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { signIn } from 'next-auth/react'
// import { FormEvent, useMemo, useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Mail, Lock, Eye, EyeOff, Shield,
//   ArrowRight, Smartphone, User,
//   CheckCircle2, AlertCircle, Loader2,
//   Clock, Star, Heart, ShoppingBag, Truck, Store
// } from 'lucide-react'

// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Checkbox } from '@/components/ui/checkbox'
// import { useToast } from '@/hooks/useToast'

// type LoginMode = 'email' | 'phone'

// // User benefits data
// const userBenefits = [
//   { 
//     icon: ShoppingBag, 
//     title: 'Wide Selection', 
//     description: '1000+ products to choose from',
//     color: 'from-emerald-500/20 to-emerald-600/20'
//   },
//   { 
//     icon: Truck, 
//     title: 'Free Delivery', 
//     description: 'On orders above ₹999',
//     color: 'from-blue-500/20 to-blue-600/20'
//   },
//   { 
//     icon: Heart, 
//     title: 'Easy Returns', 
//     description: '7-day hassle-free returns',
//     color: 'from-purple-500/20 to-purple-600/20'
//   },
//   { 
//     icon: Shield, 
//     title: 'Secure Payments', 
//     description: '100% payment protection',
//     color: 'from-amber-500/20 to-amber-600/20'
//   },
// ]

// // User testimonials
// const testimonials = [
//   {
//     name: 'Rahul Mehta',
//     role: 'Verified Buyer',
//     content: 'Amazing experience! Rented a laptop for my WFH setup. Smooth delivery and great condition.',
//     rating: 5
//   },
//   {
//     name: 'Sneha Sharma',
//     role: 'Premium Member',
//     content: 'The rental process is so easy. I love how I can upgrade my furniture anytime.',
//     rating: 5
//   },
//   {
//     name: 'Vikram Singh',
//     role: 'Regular Customer',
//     content: 'Best rental platform in India. Customer support is excellent and very responsive.',
//     rating: 5
//   },
// ]

// // Account types — "Customer" logs in on this page; the others route to their
// // dedicated login pages so no manual URL change is needed.
// const ACCOUNT_TYPES = [
//   { key: 'user', label: 'Customer', icon: User, href: '/login' },
//   { key: 'vendor', label: 'Vendor', icon: Store, href: '/vendor/login' },
//   { key: 'admin', label: 'Admin', icon: Shield, href: '/admin/login' },
//   { key: 'delivery', label: 'Delivery', icon: Truck, href: '/delivery/auth/login' },
// ] as const

// export function LoginForm() {
//   const router = useRouter()
//   const toast = useToast()

//   const handleAccountTypeSelect = (type: (typeof ACCOUNT_TYPES)[number]) => {
//     if (type.key === 'user') return
//     router.push(type.href)
//   }

//   const [mode, setMode] = useState<LoginMode>('email')
//   const [email, setEmail] = useState('')
//   const [phone, setPhone] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [rememberMe, setRememberMe] = useState(false)
//   const [currentTestimonial, setCurrentTestimonial] = useState(0)

//   // Auto-rotate testimonials
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
//     }, 5000)
//     return () => clearInterval(interval)
//   }, [])

//   // Load saved credentials if remember me was checked
//   useEffect(() => {
//     const savedLogin = localStorage.getItem('user_saved_login')
//     if (savedLogin) {
//       const { email: savedEmail, phone: savedPhone, remember } = JSON.parse(savedLogin)
//       if (remember) {
//         if (savedEmail) {
//           setEmail(savedEmail)
//           setMode('email')
//         } else if (savedPhone) {
//           setPhone(savedPhone)
//           setMode('phone')
//         }
//         setRememberMe(true)
//       }
//     }
//   }, [])

//   const canSubmit = useMemo(() => {
//     const hasIdentifier = mode === 'email'
//       ? email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
//       : /^[6-9]\d{9}$/.test(phone.trim())
//     return hasIdentifier && password.trim().length >= 6 && !isLoading
//   }, [mode, email, phone, password, isLoading])

//   const onSubmit = async () => {
//     setIsLoading(true)

//     try {
//       // Validate inputs
//       if (mode === 'email' && !email.trim()) {
//         toast.error('Validation Error', {
//           description: 'Please enter your email address'
//         })
//         setIsLoading(false)
//         return
//       }

//       if (mode === 'phone' && !phone.trim()) {
//         toast.error('Validation Error', {
//           description: 'Please enter your phone number'
//         })
//         setIsLoading(false)
//         return
//       }

//       if (!password || password.length < 6) {
//         toast.error('Validation Error', {
//           description: 'Password must be at least 6 characters'
//         })
//         setIsLoading(false)
//         return
//       }

//       // Prepare credentials
//       const credentials: any = {
//         password: password.trim(),
//         loginType: 'user', // Change from 'super_admin' to 'user'
//         redirect: false,
//         callbackUrl: '/',
//       }
      
//       if (mode === 'email') {
//         credentials.email = email.trim().toLowerCase()
//       } else {
//         credentials.phone = phone.trim()
//       }

//       console.log("Calling signIn...")

//       // Call NextAuth signIn
//       const result = await signIn('credentials', credentials)

//       console.log("signIn result:", result)

//       if (result?.error) {
//         console.error("signIn error:", result.error)
        
//         if (result.error === 'CredentialsSignin') {
//           throw new Error('Invalid email/phone or password')
//         } else if (result.error === 'AccessDenied') {
//           throw new Error('Account access denied. Please contact support.')
//         } else {
//           throw new Error(result.error)
//         }
//       }

//       if (!result?.ok) {
//         throw new Error('Login failed. Please try again.')
//       }

//       toast.success("Login successful!", {
//         description: "Redirecting to your dashboard...",
//       })
      
//       // Store remember me preference
//       if (rememberMe) {
//         localStorage.setItem('user_saved_login', JSON.stringify({
//           email: mode === 'email' ? email.trim() : '',
//           phone: mode === 'phone' ? phone.trim() : '',
//           remember: true
//         }))
//       } else {
//         localStorage.removeItem('user_saved_login')
//       }
      
//       // Use router.replace instead of push to prevent back navigation issues
//       // router.replace('/dashboard')
//       router.replace('/')
//       router.refresh()
      
//     } catch (error: any) {
//       console.error('Login error:', error)
//       toast.error('Login failed', {
//         description: error.message || 'Invalid credentials. Please try again.'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault()
//     onSubmit()
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
//       <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
//         <div className="grid lg:grid-cols-2 gap-8 max-w-6xl w-full">
          
//           {/* Left Column - Branding & Benefits */}
//           <motion.div
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5 }}
//             className="hidden lg:flex flex-col justify-center space-y-8"
//           >
//             {/* Logo & Brand */}
//             <div className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
//                   <Shield className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900">RentEase</h1>
//                   <p className="text-gray-500 text-sm">India's Favorite Rental Platform</p>
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <h2 className="text-4xl font-bold text-gray-900 leading-tight">
//                   Welcome Back,
//                   <br />
//                   <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                     Valued Customer
//                   </span>
//                 </h2>
//                 <p className="text-gray-600 text-lg">
//                   Rent what you need, when you need it. No commitment, just convenience.
//                 </p>
//               </div>
//             </div>

//             {/* Benefits Grid */}
//             <div className="grid grid-cols-2 gap-4">
//               {userBenefits.map((benefit, index) => (
//                 <motion.div
//                   key={benefit.title}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className="relative group"
//                 >
//                   <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${benefit.color} blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
//                   <div className="relative bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/50 transition-all shadow-sm">
//                     <benefit.icon className="w-5 h-5 text-primary mb-2" />
//                     <p className="font-semibold text-gray-900 text-sm">{benefit.title}</p>
//                     <p className="text-xs text-gray-500 mt-1">{benefit.description}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Why Choose Us */}
//             <div className="space-y-4">
//               <h3 className="text-gray-900 font-semibold">Why choose RentEase?</h3>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
//                   <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-xs font-medium text-gray-900">No Hidden Costs</p>
//                     <p className="text-[10px] text-gray-500">Transparent pricing</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
//                   <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-xs font-medium text-gray-900">Free Delivery</p>
//                     <p className="text-[10px] text-gray-500">On orders above ₹999</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
//                   <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-xs font-medium text-gray-900">7-Day Returns</p>
//                     <p className="text-[10px] text-gray-500">Hassle-free returns</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
//                   <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-xs font-medium text-gray-900">24/7 Support</p>
//                     <p className="text-[10px] text-gray-500">Always here to help</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Testimonials */}
//             <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 p-6 border border-gray-200">
//               <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={currentTestimonial}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.3 }}
//                   className="relative z-10"
//                 >
//                   <div className="flex gap-1 mb-3">
//                     {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
//                       <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
//                     ))}
//                   </div>
//                   <p className="text-sm text-gray-700 italic">"{testimonials[currentTestimonial].content}"</p>
//                   <div className="flex items-center gap-3 mt-4">
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
//                       <User className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">{testimonials[currentTestimonial].name}</p>
//                       <p className="text-xs text-gray-500">{testimonials[currentTestimonial].role}</p>
//                     </div>
//                   </div>
//                 </motion.div>
//               </AnimatePresence>
              
//               {/* Dots */}
//               <div className="flex justify-center gap-1 mt-4">
//                 {testimonials.map((_, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setCurrentTestimonial(idx)}
//                     className={`h-1.5 rounded-full transition-all ${
//                       idx === currentTestimonial ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300'
//                     }`}
//                     aria-label={`View testimonial ${idx + 1}`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </motion.div>

//           {/* Right Column - Login Form */}
//           <motion.div
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
//           >
//             <Card className="border-gray-200 shadow-xl">
//               <CardHeader className="space-y-3 pb-6">
//                 {/* Mobile Logo */}
//                 <div className="lg:hidden flex justify-center mb-4">
//                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
//                     <Shield className="w-8 h-8 text-white" />
//                   </div>
//                 </div>
                
//                 <CardTitle className="text-2xl text-center lg:text-left">
//                   Welcome back
//                 </CardTitle>
//                 <CardDescription className="text-center lg:text-left">
//                   Login to manage your rentals, payments, and profile.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {/* Account Type Selector */}
//                 <div className="mb-6">
//                   <p className="mb-2 text-xs font-medium text-gray-500">I am a</p>
//                   <div className="grid grid-cols-4 gap-2">
//                     {ACCOUNT_TYPES.map((type) => {
//                       const Icon = type.icon
//                       const isActive = type.key === 'user'
//                       return (
//                         <button
//                           key={type.key}
//                           type="button"
//                           onClick={() => handleAccountTypeSelect(type)}
//                           aria-pressed={isActive}
//                           className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all ${
//                             isActive
//                               ? 'border-primary bg-primary/5 shadow-sm'
//                               : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
//                           }`}
//                         >
//                           <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
//                           <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : 'text-gray-600'}`}>
//                             {type.label}
//                           </span>
//                         </button>
//                       )
//                     })}
//                   </div>
//                   <p className="mt-2 text-[11px] text-gray-400">
//                     Not a customer? Pick your role above to go to the right login.
//                   </p>
//                 </div>

//                 {/* Mode Toggle */}
//                 <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setMode('email')
//                     }}
//                     className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
//                       mode === 'email' 
//                         ? 'bg-white text-primary shadow-sm' 
//                         : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                   >
//                     <Mail className="inline-block w-4 h-4 mr-2" />
//                     Email
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setMode('phone')
//                     }}
//                     className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
//                       mode === 'phone' 
//                         ? 'bg-white text-primary shadow-sm' 
//                         : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                   >
//                     <Smartphone className="inline-block w-4 h-4 mr-2" />
//                     Phone
//                   </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-5" noValidate>
//                   {mode === 'email' ? (
//                     <div className="space-y-2">
//                       <Label htmlFor="email" className="text-gray-700">Email Address</Label>
//                       <div className="relative">
//                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                         <Input
//                           id="email"
//                           type="email"
//                           placeholder="you@example.com"
//                           value={email}
//                           onChange={(event) => setEmail(event.target.value)}
//                           className="pl-10"
//                           autoComplete="email"
//                           disabled={isLoading}
//                           required
//                         />
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-2">
//                       <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
//                       <div className="relative">
//                         <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                         <Input
//                           id="phone"
//                           type="tel"
//                           placeholder="9876543210"
//                           value={phone}
//                           onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
//                           className="pl-10"
//                           autoComplete="tel"
//                           disabled={isLoading}
//                           required
//                         />
//                       </div>
//                     </div>
//                   )}

//                   <div className="space-y-2">
//                     <Label htmlFor="password" className="text-gray-700">Password</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                       <Input
//                         id="password"
//                         type={showPassword ? 'text' : 'password'}
//                         placeholder="••••••••"
//                         value={password}
//                         onChange={(event) => setPassword(event.target.value)}
//                         className="pl-10 pr-10"
//                         autoComplete="current-password"
//                         disabled={isLoading}
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                         aria-label={showPassword ? 'Hide password' : 'Show password'}
//                       >
//                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id="remember"
//                         checked={rememberMe}
//                         onCheckedChange={(checked) => setRememberMe(checked as boolean)}
//                         className="border-gray-300 data-[state=checked]:bg-primary"
//                       />
//                       <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
//                         Remember me
//                       </label>
//                     </div>
//                     <Link href="/forgot-password" className="text-sm text-primary hover:underline">
//                       Forgot password?
//                     </Link>
//                   </div>

//                   <Button 
//                     type="submit" 
//                     className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all group"
//                     disabled={!canSubmit}
//                   >
//                     {isLoading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Signing in...
//                       </>
//                     ) : (
//                       <>
//                         Sign in
//                         <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
//                       </>
//                     )}
//                   </Button>
//                 </form>

//                 <div className="relative my-6">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-200"></div>
//                   </div>
//                   <div className="relative flex justify-center text-xs uppercase">
//                     <span className="bg-white px-2 text-gray-500">New to RentEase?</span>
//                   </div>
//                 </div>

//                 <div className="text-center">
//                   <Link href="/register">
//                     <Button variant="outline" className="w-full">
//                       Create an account
//                     </Button>
//                   </Link>
//                 </div>

//                 {/* Security Badges */}
//                 <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
//                   <div className="flex items-center gap-1 text-xs text-gray-500">
//                     <Shield className="h-3 w-3" />
//                     <span>256-bit SSL</span>
//                   </div>
//                   <div className="flex items-center gap-1 text-xs text-gray-500">
//                     <CheckCircle2 className="h-3 w-3" />
//                     <span>Secure Payment</span>
//                   </div>
//                   <div className="flex items-center gap-1 text-xs text-gray-500">
//                     <Clock className="h-3 w-3" />
//                     <span>24/7 Support</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
            
//             {/* Help Text */}
//             <p className="text-center text-xs text-gray-500 mt-6">
//               Need help? Contact our support team at{' '}
//               <a href="mailto:support@rentease.com" className="text-primary hover:underline">
//                 support@rentease.com
//               </a>
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { FormEvent, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, Shield,
  ArrowRight, Smartphone, User,
  CheckCircle2, AlertCircle, Loader2,
  Clock, Star, Heart, ShoppingBag, Truck, Store,
  KeyRound, Armchair, Camera, Bike, Laptop2, Quote, Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/useToast'

type LoginMode = 'email' | 'phone'

// User benefits data
const userBenefits = [
  {
    icon: ShoppingBag,
    title: 'Wide Selection',
    description: '1000+ products to choose from',
    accent: 'text-amber-600',
    ring: 'from-amber-400/25 to-amber-500/10',
    border: 'hover:border-amber-300',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'On orders above ₹999',
    accent: 'text-sky-600',
    ring: 'from-sky-400/25 to-sky-500/10',
    border: 'hover:border-sky-300',
  },
  {
    icon: Heart,
    title: 'Easy Returns',
    description: '7-day hassle-free returns',
    accent: 'text-rose-600',
    ring: 'from-rose-400/25 to-rose-500/10',
    border: 'hover:border-rose-300',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: '100% payment protection',
    accent: 'text-violet-600',
    ring: 'from-violet-400/25 to-violet-500/10',
    border: 'hover:border-violet-300',
  },
]

// What people rent — the signature "shelf" strip
const rentalCategories = [
  { icon: Armchair, label: 'Furniture', chip: 'bg-amber-100 text-amber-700 ring-amber-200' },
  { icon: Laptop2, label: 'Electronics', chip: 'bg-violet-100 text-violet-700 ring-violet-200' },
  { icon: Camera, label: 'Cameras', chip: 'bg-rose-100 text-rose-700 ring-rose-200' },
  { icon: Bike, label: 'Bikes', chip: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
]

// Trust stats — count up on mount
const trustStats = [
  { label: 'Happy renters', value: 52000, suffix: '+' },
  { label: 'Products listed', value: 12500, suffix: '+' },
  { label: 'Cities covered', value: 480, suffix: '+' },
]

// User testimonials
const testimonials = [
  {
    name: 'Rahul Mehta',
    role: 'Verified Buyer',
    content: 'Amazing experience! Rented a laptop for my WFH setup. Smooth delivery and great condition.',
    rating: 5
  },
  {
    name: 'Sneha Sharma',
    role: 'Premium Member',
    content: 'The rental process is so easy. I love how I can upgrade my furniture anytime.',
    rating: 5
  },
  {
    name: 'Vikram Singh',
    role: 'Regular Customer',
    content: 'Best rental platform in India. Customer support is excellent and very responsive.',
    rating: 5
  },
]

// Account types — "Customer" logs in on this page; the others route to their
// dedicated login pages so no manual URL change is needed.
const ACCOUNT_TYPES = [
  { key: 'user', label: 'Customer', icon: User, href: '/login', dot: 'bg-amber-500' },
  { key: 'vendor', label: 'Vendor', icon: Store, href: '/vendor/login', dot: 'bg-violet-500' },
  { key: 'admin', label: 'Admin', icon: Shield, href: '/admin/login', dot: 'bg-blue-500' },
  { key: 'delivery', label: 'Delivery', icon: Truck, href: '/delivery/auth/login', dot: 'bg-emerald-500' },
] as const

// Lightweight count-up hook for the trust stats
function useCountUp(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let rafId: number
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, start])

  return value
}

function TrustStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const [started, setStarted] = useState(false)
  const count = useCountUp(value, 1600, started)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className="text-center lg:text-left">
      <p className="text-2xl font-bold text-gray-900 tabular-nums">
        {count.toLocaleString('en-IN')}{suffix}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export function LoginForm() {
  const router = useRouter()
  const toast = useToast()

  const handleAccountTypeSelect = (type: (typeof ACCOUNT_TYPES)[number]) => {
    if (type.key === 'user') return
    router.push(type.href)
  }

  const [mode, setMode] = useState<LoginMode>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [justSucceeded, setJustSucceeded] = useState(false)

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedLogin = localStorage.getItem('user_saved_login')
    if (savedLogin) {
      const { email: savedEmail, phone: savedPhone, remember } = JSON.parse(savedLogin)
      if (remember) {
        if (savedEmail) {
          setEmail(savedEmail)
          setMode('email')
        } else if (savedPhone) {
          setPhone(savedPhone)
          setMode('phone')
        }
        setRememberMe(true)
      }
    }
  }, [])

  const canSubmit = useMemo(() => {
    const hasIdentifier = mode === 'email'
      ? email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      : /^[6-9]\d{9}$/.test(phone.trim())
    return hasIdentifier && password.trim().length >= 6 && !isLoading
  }, [mode, email, phone, password, isLoading])

  const onSubmit = async () => {
    setIsLoading(true)

    try {
      // Validate inputs
      if (mode === 'email' && !email.trim()) {
        toast.error('Validation Error', {
          description: 'Please enter your email address'
        })
        setIsLoading(false)
        return
      }

      if (mode === 'phone' && !phone.trim()) {
        toast.error('Validation Error', {
          description: 'Please enter your phone number'
        })
        setIsLoading(false)
        return
      }

      if (!password || password.length < 6) {
        toast.error('Validation Error', {
          description: 'Password must be at least 6 characters'
        })
        setIsLoading(false)
        return
      }

      // Prepare credentials
      const credentials: any = {
        password: password.trim(),
        loginType: 'user', // Change from 'super_admin' to 'user'
        redirect: false,
        callbackUrl: '/',
      }

      if (mode === 'email') {
        credentials.email = email.trim().toLowerCase()
      } else {
        credentials.phone = phone.trim()
      }

      console.log("Calling signIn...")

      // Call NextAuth signIn
      const result = await signIn('credentials', credentials)

      console.log("signIn result:", result)

      if (result?.error) {
        console.error("signIn error:", result.error)

        if (result.error === 'CredentialsSignin') {
          throw new Error('Invalid email/phone or password')
        } else if (result.error === 'AccessDenied') {
          throw new Error('Account access denied. Please contact support.')
        } else {
          throw new Error(result.error)
        }
      }

      if (!result?.ok) {
        throw new Error('Login failed. Please try again.')
      }

      toast.success("Login successful!", {
        description: "Redirecting to your dashboard...",
      })

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('user_saved_login', JSON.stringify({
          email: mode === 'email' ? email.trim() : '',
          phone: mode === 'phone' ? phone.trim() : '',
          remember: true
        }))
      } else {
        localStorage.removeItem('user_saved_login')
      }

      // Brief success moment before navigating away
      setJustSucceeded(true)

      // Use router.replace instead of push to prevent back navigation issues
      // router.replace('/dashboard')
      setTimeout(() => {
        router.replace('/')
        router.refresh()
      }, 500)

    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Login failed', {
        description: error.message || 'Invalid credentials. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-rose-50">
        {/* Ambient background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-24 -left-24 h-[26rem] w-[26rem] rounded-full bg-amber-300/25 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-rose-300/20 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-32 left-1/4 h-[24rem] w-[24rem] rounded-full bg-violet-300/20 blur-3xl"
            animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container relative mx-auto flex min-h-screen items-center justify-center px-4 py-8">
          <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">

            {/* Left Column - Branding & Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden flex-col justify-center space-y-8 lg:flex"
            >
              {/* Logo & Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-amber-500/30"
                  >
                    <KeyRound className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">RentEase</h1>
                    <p className="text-sm text-gray-500">India's Favorite Rental Platform</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-4xl font-bold leading-tight text-gray-900">
                    Welcome Back,
                    <br />
                    <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                      Valued Customer
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600">
                    Rent what you need, when you need it. No commitment, just convenience.
                  </p>
                </div>
              </div>

              {/* What you can rent - signature category shelf */}
              <div className="flex flex-wrap gap-2">
                {rentalCategories.map((category, index) => (
                  <motion.div
                    key={category.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                    whileHover={{ y: -2 }}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${category.chip}`}
                  >
                    <category.icon className="h-3.5 w-3.5" />
                    {category.label}
                  </motion.div>
                ))}
              </div>

              {/* Trust stats */}
              <div className="grid grid-cols-3 gap-4 rounded-2xl border border-gray-100 bg-white/60 p-4 backdrop-blur-sm">
                {trustStats.map((stat, index) => (
                  <TrustStat
                    key={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    delay={200 + index * 150}
                  />
                ))}
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                {userBenefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -3 }}
                    className="group relative"
                  >
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${benefit.ring} opacity-0 blur-xl transition-opacity group-hover:opacity-100`} />
                    <div className={`relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all ${benefit.border}`}>
                      <benefit.icon className={`mb-2 h-5 w-5 ${benefit.accent}`} />
                      <p className="text-sm font-semibold text-gray-900">{benefit.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Why Choose Us */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-1.5 font-semibold text-gray-900">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Why choose RentEase?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex cursor-default items-start gap-2 rounded-lg p-2 transition-colors hover:bg-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">No Hidden Costs</p>
                      <p className="text-[10px] text-gray-500">Transparent pricing</p>
                    </div>
                  </div>
                  <div className="flex cursor-default items-start gap-2 rounded-lg p-2 transition-colors hover:bg-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Free Delivery</p>
                      <p className="text-[10px] text-gray-500">On orders above ₹999</p>
                    </div>
                  </div>
                  <div className="flex cursor-default items-start gap-2 rounded-lg p-2 transition-colors hover:bg-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">7-Day Returns</p>
                      <p className="text-[10px] text-gray-500">Hassle-free returns</p>
                    </div>
                  </div>
                  <div className="flex cursor-default items-start gap-2 rounded-lg p-2 transition-colors hover:bg-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">24/7 Support</p>
                      <p className="text-[10px] text-gray-500">Always here to help</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-amber-500/5 to-rose-500/5 p-6">
                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-amber-400/10 blur-2xl" />
                <Quote className="absolute right-4 top-4 h-8 w-8 text-amber-500/10" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                    <div className="mb-3 flex gap-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm italic text-gray-700">"{testimonials[currentTestimonial].content}"</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{testimonials[currentTestimonial].name}</p>
                        <p className="text-xs text-gray-500">{testimonials[currentTestimonial].role}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress-style indicator */}
                <div className="mt-4 flex gap-1.5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonial(idx)}
                      className="relative h-1 flex-1 overflow-hidden rounded-full bg-gray-200"
                      aria-label={`View testimonial ${idx + 1}`}
                    >
                      {idx === currentTestimonial && (
                        <motion.div
                          key={currentTestimonial}
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 5, ease: 'linear' }}
                        />
                      )}
                      {idx < currentTestimonial && (
                        <div className="absolute inset-0 rounded-full bg-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto"
            >
              <Card className="relative overflow-hidden border-gray-200 shadow-xl shadow-amber-900/5">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

                <AnimatePresence>
                  {justSucceeded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/95 backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600"
                      >
                        <CheckCircle2 className="h-9 w-9 text-white" />
                      </motion.div>
                      <p className="font-medium text-gray-900">Welcome back!</p>
                      <p className="text-sm text-gray-500">Taking you to your dashboard…</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <CardHeader className="space-y-3 pb-6">
                  {/* Mobile Logo */}
                  <div className="mb-4 flex justify-center lg:hidden">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-amber-500/30">
                      <KeyRound className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <CardTitle className="text-center text-2xl lg:text-left">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-center lg:text-left">
                    Login to manage your rentals, payments, and profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Account Type Selector */}
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-medium text-gray-500">I am a</p>
                    <div className="grid grid-cols-4 gap-2">
                      {ACCOUNT_TYPES.map((type) => {
                        const Icon = type.icon
                        const isActive = type.key === 'user'
                        return (
                          <motion.button
                            key={type.key}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAccountTypeSelect(type)}
                            aria-pressed={isActive}
                            className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all ${
                              isActive
                                ? 'border-amber-400 bg-amber-50 shadow-sm'
                                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                            }`}
                          >
                            {isActive && (
                              <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${type.dot}`} />
                            )}
                            <Icon className={`h-5 w-5 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                            <span className={`text-[11px] font-medium ${isActive ? 'text-amber-700' : 'text-gray-600'}`}>
                              {type.label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400">
                      Not a customer? Pick your role above to go to the right login.
                    </p>
                  </div>

                  {/* Mode Toggle */}
                  <div className="relative mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
                    <motion.div
                      className="absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm"
                      animate={{ x: mode === 'email' ? 4 : 'calc(100% + 4px)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <button
                      type="button"
                      onClick={() => setMode('email')}
                      className={`relative z-10 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        mode === 'email' ? 'text-amber-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Mail className="mr-2 inline-block h-4 w-4" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('phone')}
                      className={`relative z-10 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        mode === 'phone' ? 'text-amber-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Smartphone className="mr-2 inline-block h-4 w-4" />
                      Phone
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <AnimatePresence mode="wait">
                      {mode === 'email' ? (
                        <motion.div
                          key="email-field"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(event) => setEmail(event.target.value)}
                              className="pl-10 transition-shadow focus-visible:ring-amber-400"
                              autoComplete="email"
                              disabled={isLoading}
                              required
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="phone-field"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="9876543210"
                              value={phone}
                              onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="pl-10 transition-shadow focus-visible:ring-amber-400"
                              autoComplete="tel"
                              disabled={isLoading}
                              required
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="pl-10 pr-10 transition-shadow focus-visible:ring-amber-400"
                          autoComplete="current-password"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="border-gray-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <label htmlFor="remember" className="cursor-pointer select-none text-sm text-gray-600">
                          Remember me
                        </label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-amber-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <motion.div whileHover={canSubmit ? { scale: 1.01 } : undefined} whileTap={canSubmit ? { scale: 0.99 } : undefined}>
                      <Button
                        type="submit"
                        className="group w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-amber-500/25 transition-all hover:opacity-90 hover:shadow-amber-500/40"
                        disabled={!canSubmit}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">New to RentEase?</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link href="/register">
                      <Button variant="outline" className="w-full border-amber-200 hover:border-amber-400 hover:bg-amber-50">
                        Create an account
                      </Button>
                    </Link>
                  </div>

                  {/* Security Badges */}
                  <div className="mt-6 flex justify-center gap-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Text */}
              <p className="mt-6 text-center text-xs text-gray-500">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@rentease.com" className="text-amber-600 hover:underline">
                  support@rentease.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}