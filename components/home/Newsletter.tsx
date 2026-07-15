// // src/components/home/Newsletter.tsx
// 'use client'

// import { useState } from 'react'
// import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { toast } from 'sonner'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// export function Newsletter() {
//   const [email, setEmail] = useState('')
//   const [isLoading, setIsLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!email) return

//     setIsLoading(true)
//     try {
//       await axios.post(`${BASE_URL}/api/v1/newsletter/subscribe`, { email })
//       toast.success('Subscribed!', {
//         description: 'Thank you for subscribing to our newsletter.'
//       })
//       setEmail('')
//     } catch (error) {
//       toast.error('Subscription failed', {
//         description: 'Please try again later.'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 px-4">
//       <div className="max-w-4xl mx-auto text-center">
//         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
//           <Mail className="h-8 w-8 text-primary" />
//         </div>
//         <h2 className="text-2xl md:text-3xl font-bold mb-2">Subscribe to Our Newsletter</h2>
//         <p className="text-muted-foreground mb-6">
//           Get the latest updates on new products, exclusive offers, and rental tips.
//         </p>
        
//         <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
//           <Input
//             type="email"
//             placeholder="Enter your email address"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="flex-1"
//           />
//           <Button type="submit" disabled={isLoading} className="gap-2">
//             {isLoading ? (
//               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//             ) : (
//               <Send className="h-4 w-4" />
//             )}
//             Subscribe
//           </Button>
//         </form>

//         <p className="text-xs text-muted-foreground mt-4">
//           No spam, unsubscribe anytime.
//         </p>
//       </div>
//     </div>
//   )
// }


// src/components/home/Newsletter.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, CheckCircle2, Sparkles, ShieldCheck, Gift, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const perks = [
  { icon: Gift, label: 'Exclusive offers' },
  { icon: Bell, label: 'New arrivals first' },
  { icon: ShieldCheck, label: 'No spam, ever' },
]

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [touched, setTouched] = useState(false)

  const isValidEmail = EMAIL_REGEX.test(email)
  const showError = touched && email.length > 0 && !isValidEmail

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!email || !isValidEmail) return

    setIsLoading(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/newsletter/subscribe`, { email })
      toast.success('You\'re subscribed!', {
        description: 'Thank you for joining our newsletter.',
      })
      setIsSubscribed(true)
      setEmail('')
      setTouched(false)
    } catch (error) {
      toast.error('Subscription failed', {
        description: 'Please try again in a moment.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden py-14 sm:py-16 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-blue-50" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-5 relative"
        >
          <Mail className="h-7 w-7 text-white" />
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-blue-400">
              <Sparkles className="h-3 w-3 text-white" />
            </span>
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2.5"
        >
          Stay in the loop
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-slate-600 text-sm sm:text-base mb-7 max-w-md mx-auto"
        >
          Join our newsletter for the latest products, exclusive deals, and handy rental tips —
          straight to your inbox.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-xl shadow-blue-900/5 p-2 max-w-md mx-auto"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isSubscribed ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center gap-2.5 py-4 px-4"
              >
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-sm font-semibold text-slate-800">
                  You&apos;re on the list! Check your inbox soon.
                </span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 relative">
                  <Input
                    type="email"
                    inputMode="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    aria-invalid={showError}
                    aria-label="Email address"
                    className={`h-12 rounded-xl border-slate-200 bg-white px-4 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-400 transition-colors ${
                      showError ? 'border-red-300 focus-visible:ring-red-400' : ''
                    }`}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || (touched && !isValidEmail)}
                  className="h-12 px-6 gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:shadow-none transition-all"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Subscribe</span>
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showError && !isSubscribed && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500 font-medium text-left px-3 pt-1.5"
              >
                Please enter a valid email address.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6"
        >
          {perks.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
              <Icon className="h-3.5 w-3.5 text-blue-500" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}