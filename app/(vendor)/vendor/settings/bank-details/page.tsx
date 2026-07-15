// // src/app/vendor/settings/bank-details/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { toast } from 'sonner'
// import {
//   CreditCard,
//   Building2,
//   Banknote,
//   Shield,
//   Eye,
//   EyeOff,
//   Loader2,
//   Save,
//   CheckCircle,
//   AlertCircle,
//   Lock
// } from 'lucide-react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// const bankDetailsSchema = z.object({
//   accountHolderName: z.string().min(3, 'Account holder name is required'),
//   accountNumber: z.string().min(9, 'Account number must be at least 9 digits').max(18),
//   confirmAccountNumber: z.string(),
//   ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
//   bankName: z.string().min(2, 'Bank name is required'),
//   branchName: z.string().optional(),
//   accountType: z.enum(['savings', 'current']),
//   upiId: z.string().optional(),
// }).refine((data) => data.accountNumber === data.confirmAccountNumber, {
//   message: "Account numbers don't match",
//   path: ['confirmAccountNumber'],
// })

// type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>

// export default function BankDetailsPage() {
//   const { data: session } = useSession()
//   const [profile, setProfile] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSaving, setIsSaving] = useState(false)
//   const [showAccountNumber, setShowAccountNumber] = useState(false)
//   const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false)
//   const [ifscDetails, setIfscDetails] = useState<any>(null)
//   const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false)

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors }
//   } = useForm<BankDetailsFormValues>({
//     resolver: zodResolver(bankDetailsSchema),
//     defaultValues: {
//       accountHolderName: '',
//       accountNumber: '',
//       confirmAccountNumber: '',
//       ifscCode: '',
//       bankName: '',
//       branchName: '',
//       accountType: 'savings',
//       upiId: '',
//     }
//   })

//   const ifscCode = watch('ifscCode')

//   useEffect(() => {
//     fetchProfile()
//   }, [])

//   const fetchProfile = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
//         headers: {
//           Authorization: `Bearer ${session?.user?.accessToken}`
//         }
//       })
//       if (response.data.success) {
//         const data = response.data.data.profile
//         setProfile(data)
//         setValue('accountHolderName', data.bankDetails?.accountHolderName || '')
//         setValue('ifscCode', data.bankDetails?.ifscCode || '')
//         setValue('bankName', data.bankDetails?.bankName || '')
//         setValue('branchName', data.bankDetails?.branchName || '')
//         setValue('accountType', data.bankDetails?.accountType || 'savings')
//         setValue('upiId', data.bankDetails?.upiId || '')
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const verifyIFSC = async (code: string) => {
//     if (!code || code.length !== 11) return
    
//     setIsVerifyingIFSC(true)
//     try {
//       const response = await axios.get(`https://ifsc.razorpay.com/${code.toUpperCase()}`)
//       if (response.data) {
//         setIfscDetails(response.data)
//         setValue('bankName', response.data.BANK)
//         setValue('branchName', response.data.BRANCH)
//         toast.success('IFSC code verified')
//       }
//     } catch (error) {
//       console.error('IFSC verification failed:', error)
//       toast.error('Invalid IFSC code')
//       setIfscDetails(null)
//     } finally {
//       setIsVerifyingIFSC(false)
//     }
//   }

//   const onSubmit = async (data: BankDetailsFormValues) => {
//     setIsSaving(true)
//     try {
//       const payload = {
//         accountHolderName: data.accountHolderName,
//         accountNumber: data.accountNumber,
//         ifscCode: data.ifscCode,
//         bankName: data.bankName,
//         branchName: data.branchName,
//         accountType: data.accountType,
//         upiId: data.upiId,
//       }

//       const response = await axios.put(`${BASE_URL}/api/v1/vendor/bank-details`, payload, {
//         headers: {
//           Authorization: `Bearer ${session?.user?.accessToken}`
//         }
//       })

//       if (response.data.success) {
//         toast.success('Bank details updated successfully')
//         fetchProfile()
//       }
//     } catch (error: any) {
//       console.error('Error updating bank details:', error)
//       toast.error(error.response?.data?.message || 'Failed to update bank details')
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-xl font-semibold">Bank Account Details</h2>
//         <p className="text-sm text-muted-foreground">
//           Manage your payout account information
//         </p>
//       </div>

//       {/* Verification Status */}
//       {profile?.bankDetails?.verified && (
//         <Card className="bg-green-50 border-green-200">
//           <CardContent className="p-4">
//             <div className="flex items-center gap-3">
//               <CheckCircle className="h-5 w-5 text-green-600" />
//               <div>
//                 <p className="font-medium text-green-800">Bank Account Verified</p>
//                 <p className="text-sm text-green-700">
//                   Your bank account has been verified. Payouts will be sent to this account.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Bank Details Form */}
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Account Information</CardTitle>
//             <CardDescription>
//               Enter your bank account details for receiving payouts
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="accountHolderName">Account Holder Name *</Label>
//               <Input
//                 id="accountHolderName"
//                 {...register('accountHolderName')}
//                 placeholder="As per bank records"
//                 className={errors.accountHolderName ? 'border-red-500' : ''}
//               />
//               {errors.accountHolderName && (
//                 <p className="text-xs text-red-500 mt-1">{errors.accountHolderName.message}</p>
//               )}
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="accountNumber">Account Number *</Label>
//                 <div className="relative mt-1">
//                   <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="accountNumber"
//                     type={showAccountNumber ? 'text' : 'password'}
//                     {...register('accountNumber')}
//                     placeholder="Enter account number"
//                     className={`pl-9 ${errors.accountNumber ? 'border-red-500' : ''}`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowAccountNumber(!showAccountNumber)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                   >
//                     {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//                 {errors.accountNumber && (
//                   <p className="text-xs text-red-500 mt-1">{errors.accountNumber.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
//                 <div className="relative mt-1">
//                   <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="confirmAccountNumber"
//                     type={showConfirmAccountNumber ? 'text' : 'password'}
//                     {...register('confirmAccountNumber')}
//                     placeholder="Confirm account number"
//                     className={`pl-9 ${errors.confirmAccountNumber ? 'border-red-500' : ''}`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                   >
//                     {showConfirmAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//                 {errors.confirmAccountNumber && (
//                   <p className="text-xs text-red-500 mt-1">{errors.confirmAccountNumber.message}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="ifscCode">IFSC Code *</Label>
//                 <div className="relative mt-1">
//                   <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="ifscCode"
//                     {...register('ifscCode')}
//                     placeholder="SBIN0001234"
//                     className={`pl-9 uppercase ${errors.ifscCode ? 'border-red-500' : ''}`}
//                     onChange={(e) => {
//                       const value = e.target.value.toUpperCase()
//                       setValue('ifscCode', value)
//                       verifyIFSC(value)
//                     }}
//                   />
//                   {isVerifyingIFSC && (
//                     <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
//                   )}
//                 </div>
//                 {errors.ifscCode && (
//                   <p className="text-xs text-red-500 mt-1">{errors.ifscCode.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="accountType">Account Type *</Label>
//                 <select
//                   id="accountType"
//                   {...register('accountType')}
//                   className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                 >
//                   <option value="savings">Savings Account</option>
//                   <option value="current">Current Account</option>
//                 </select>
//                 {errors.accountType && (
//                   <p className="text-xs text-red-500 mt-1">{errors.accountType.message}</p>
//                 )}
//               </div>
//             </div>

//             {ifscDetails && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//                 <p className="text-sm font-medium text-green-800">Bank Verified</p>
//                 <p className="text-xs text-green-700">{ifscDetails.BANK} - {ifscDetails.BRANCH}</p>
//               </div>
//             )}

//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="bankName">Bank Name</Label>
//                 <Input
//                   id="bankName"
//                   {...register('bankName')}
//                   placeholder="Auto-filled from IFSC"
//                   readOnly
//                   className="bg-muted"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="branchName">Branch Name</Label>
//                 <Input
//                   id="branchName"
//                   {...register('branchName')}
//                   placeholder="Auto-filled from IFSC"
//                   readOnly
//                   className="bg-muted"
//                 />
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="upiId">UPI ID (Optional)</Label>
//               <Input
//                 id="upiId"
//                 {...register('upiId')}
//                 placeholder="username@okhdfcbank"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 Add your UPI ID for faster payouts
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Security Note */}
//         <Card className="bg-blue-50 border-blue-200">
//           <CardContent className="p-4">
//             <div className="flex items-start gap-3">
//               <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
//               <div>
//                 <p className="font-medium text-blue-800">Secure & Encrypted</p>
//                 <p className="text-sm text-blue-700">
//                   Your bank details are encrypted and securely stored. We never share your complete account information with third parties.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Submit Button */}
//         <div className="flex justify-end">
//           <Button type="submit" disabled={isSaving} className="gap-2">
//             {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
//             Save Bank Details
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }



'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  CreditCard,
  Building2,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
  Lock,
  BadgeCheck,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Banknote,
  Wallet,
  RefreshCw,
  Info,
  ChevronRight,
  Sparkles,
  Clock,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const bankDetailsSchema = z
  .object({
    accountHolderName: z.string().min(3, 'Account holder name is required'),
    accountNumber: z
      .string()
      .min(9, 'Account number must be at least 9 digits')
      .max(18, 'Account number too long')
      .regex(/^\d+$/, 'Account number must contain only digits'),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
    bankName: z.string().min(2, 'Bank name is required'),
    branchName: z.string().optional(),
    accountType: z.enum(['savings', 'current']),
    upiId: z.string().optional(),
  })
  .refine((d) => d.accountNumber === d.confirmAccountNumber, {
    message: "Account numbers don't match",
    path: ['confirmAccountNumber'],
  })

type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>

// ── Helpers ────────────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-xs text-red-500 mt-1.5"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </motion.p>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </Label>
  )
}

// Masked account display: shows last 4 digits only
function MaskedAccountBadge({ number }: { number?: string }) {
  if (!number) return null
  const masked = '••••' + number.slice(-4)
  return (
    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium text-xs px-3 py-1 gap-1.5">
      <CheckCircle className="h-3 w-3" />
      Saved: {masked}
    </Badge>
  )
}

// Security trust badges (static)
const TRUST_ITEMS = [
  {
    icon: Fingerprint,
    title: '256-bit AES Encryption',
    desc: 'Bank-grade encryption protects all data at rest and in transit.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: ShieldCheck,
    title: 'RBI Compliant Storage',
    desc: 'Data stored per Reserve Bank of India data localisation norms.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: KeyRound,
    title: 'Zero Knowledge Access',
    desc: 'Your full account number is never visible to our support team.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Lock,
    title: 'Tokenized Payouts',
    desc: 'Payouts use secure tokens — raw banking credentials are never transmitted.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

const PAYOUT_TIMELINE = [
  { label: 'Order Completed', time: 'Day 0', active: true },
  { label: 'Settlement Initiated', time: 'Day 1', active: true },
  { label: 'Bank Processing', time: 'Day 1–2', active: false },
  { label: 'Amount Credited', time: 'Day 2–3', active: false },
]

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function BankDetailsPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false)
  const [ifscDetails, setIfscDetails] = useState<any>(null)
  const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false)
  const [ifscError, setIfscError] = useState(false)
  const hasFetched = useRef(false)
  const ifscDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      accountType: 'savings',
      upiId: '',
    },
  })

  const accountType = watch('accountType')

  // ── Fixed: single API call once session is ready ───────────────────────────
  const fetchProfile = useCallback(
    async (token: string) => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.success) {
          const data = response.data.data.profile
          setProfile(data)
          setValue('accountHolderName', data.bankDetails?.accountHolderName || '')
          setValue('ifscCode', data.bankDetails?.ifscCode || '')
          setValue('bankName', data.bankDetails?.bankName || '')
          setValue('branchName', data.bankDetails?.branchName || '')
          setValue('accountType', data.bankDetails?.accountType || 'savings')
          setValue('upiId', data.bankDetails?.upiId || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load bank details')
      } finally {
        setIsLoading(false)
      }
    },
    [setValue]
  )

  useEffect(() => {
    if (status !== 'authenticated') return
    const token = session?.user?.accessToken
    if (!token) return
    if (hasFetched.current) return
    hasFetched.current = true
    fetchProfile(token)
  }, [status, session?.user?.accessToken, fetchProfile])

  // ── IFSC verification with debounce ───────────────────────────────────────
  const verifyIFSC = useCallback(async (code: string) => {
    if (!code || code.length !== 11) {
      setIfscDetails(null)
      setIfscError(false)
      return
    }
    if (ifscDebounce.current) clearTimeout(ifscDebounce.current)
    ifscDebounce.current = setTimeout(async () => {
      setIsVerifyingIFSC(true)
      setIfscError(false)
      try {
        const response = await axios.get(`https://ifsc.razorpay.com/${code.toUpperCase()}`)
        if (response.data) {
          setIfscDetails(response.data)
          setValue('bankName', response.data.BANK || '')
          setValue('branchName', response.data.BRANCH || '')
          toast.success('IFSC verified — bank details auto-filled')
        }
      } catch {
        setIfscDetails(null)
        setIfscError(true)
        toast.error('Invalid IFSC code')
      } finally {
        setIsVerifyingIFSC(false)
      }
    }, 600)
  }, [setValue])

  const onSubmit = async (data: BankDetailsFormValues) => {
    setIsSaving(true)
    try {
      const payload = {
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        bankName: data.bankName,
        branchName: data.branchName,
        accountType: data.accountType,
        upiId: data.upiId,
      }
      const response = await axios.put(`${BASE_URL}/api/v1/vendor/bank-details`, payload, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      })
      if (response.data.success) {
        toast.success('Bank details saved securely')
        hasFetched.current = false
        fetchProfile(session!.user!.accessToken as string)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update bank details')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#2874f0]/20 border-t-[#2874f0] animate-spin" />
          <Banknote className="absolute inset-0 m-auto h-5 w-5 text-[#2874f0]" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Loading bank details securely…</p>
      </div>
    )
  }

  const isVerified = profile?.bankDetails?.verified

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e6c] via-[#2874f0] to-[#0f52c4] text-white p-6 shadow-xl shadow-[#2874f0]/25">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
              <Banknote className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">Bank Account Details</h1>
                {isVerified && (
                  <span className="flex items-center gap-1 bg-green-400/20 border border-green-300/30 text-green-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-blue-200 text-sm mt-0.5">Manage your payout account · Settlements in 2–3 business days</p>
              {profile?.bankDetails?.accountNumber && (
                <div className="mt-2">
                  <MaskedAccountBadge number={profile.bankDetails.accountNumber} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-blue-100 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-green-300" />
            SSL Secured
          </div>
        </div>
      </div>

      {/* ── Verification Banner ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isVerified ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="bg-emerald-100 rounded-lg p-1.5 shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Bank Account Successfully Verified</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Your account is active and payouts will be credited within 2–3 business days after settlement.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="bg-amber-100 rounded-lg p-1.5 shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Bank Verification Pending</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Save your bank details below. Our team will verify your account within 24 hours before enabling payouts.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Account Information */}
        <Card className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
                <CreditCard className="h-4 w-4 text-[#2874f0]" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-700">Account Information</CardTitle>
                <CardDescription className="text-xs">Enter details exactly as registered with your bank</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">

            {/* Account Holder Name */}
            <div>
              <FieldLabel required>Account Holder Name</FieldLabel>
              <Input
                {...register('accountHolderName')}
                placeholder="Full name as per bank records"
                className={`mt-1 uppercase placeholder:normal-case ${errors.accountHolderName ? 'border-red-400 focus-visible:ring-red-200' : ''}`}
              />
              <FieldError message={errors.accountHolderName?.message} />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Must match the name on your bank passbook exactly
              </p>
            </div>

            {/* Account Number + Confirm */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Account Number</FieldLabel>
                <div className="relative mt-1">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showAccountNumber ? 'text' : 'password'}
                    {...register('accountNumber')}
                    placeholder="Enter account number"
                    className={`pl-9 pr-10 font-mono ${errors.accountNumber ? 'border-red-400' : ''}`}
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.accountNumber?.message} />
              </div>

              <div>
                <FieldLabel required>Confirm Account Number</FieldLabel>
                <div className="relative mt-1">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showConfirmAccountNumber ? 'text' : 'password'}
                    {...register('confirmAccountNumber')}
                    placeholder="Re-enter account number"
                    className={`pl-9 pr-10 font-mono ${errors.confirmAccountNumber ? 'border-red-400' : ''}`}
                    inputMode="numeric"
                    onPaste={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmAccountNumber((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.confirmAccountNumber?.message} />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Paste disabled for security
                </p>
              </div>
            </div>

            {/* IFSC + Account Type */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>IFSC Code</FieldLabel>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    {...register('ifscCode')}
                    placeholder="e.g. SBIN0001234"
                    className={`pl-9 pr-10 uppercase font-mono tracking-widest ${errors.ifscCode ? 'border-red-400' : ifscDetails ? 'border-emerald-400 focus-visible:ring-emerald-200' : ''}`}
                    maxLength={11}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      setValue('ifscCode', val)
                      verifyIFSC(val)
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isVerifyingIFSC && <Loader2 className="h-4 w-4 animate-spin text-[#2874f0]" />}
                    {!isVerifyingIFSC && ifscDetails && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                    {!isVerifyingIFSC && ifscError && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                <FieldError message={errors.ifscCode?.message} />
                {!errors.ifscCode && (
                  <p className="text-[11px] text-slate-400 mt-1.5">Bank &amp; branch auto-fill on valid IFSC</p>
                )}
              </div>

              <div>
                <FieldLabel required>Account Type</FieldLabel>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(['savings', 'current'] as const).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center justify-center gap-2 border-2 rounded-xl py-2.5 px-3 cursor-pointer transition-all text-sm font-semibold capitalize
                        ${accountType === type
                          ? 'border-[#2874f0] bg-[#2874f0]/5 text-[#2874f0]'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      <input
                        type="radio"
                        value={type}
                        className="sr-only"
                        {...register('accountType')}
                      />
                      {type === 'savings' ? <Wallet className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* IFSC Verified Result */}
            <AnimatePresence>
              {ifscDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
                    <div className="bg-emerald-100 rounded-lg p-1.5 shrink-0">
                      <BadgeCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        {ifscDetails.BANK}
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Branch: {ifscDetails.BRANCH} · {ifscDetails.CITY}, {ifscDetails.STATE}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bank & Branch (read-only) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Bank Name</FieldLabel>
                <Input
                  {...register('bankName')}
                  placeholder="Auto-filled from IFSC"
                  readOnly
                  className="mt-1 bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <FieldLabel>Branch Name</FieldLabel>
                <Input
                  {...register('branchName')}
                  placeholder="Auto-filled from IFSC"
                  readOnly
                  className="mt-1 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* UPI */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FieldLabel>UPI ID</FieldLabel>
                <Badge className="bg-[#fb641b]/10 text-[#fb641b] border-[#fb641b]/20 text-[10px] font-semibold px-2 py-0">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Faster Payouts
                </Badge>
              </div>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  {...register('upiId')}
                  placeholder="username@okhdfcbank"
                  className="mt-1 pl-9"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Optional · UPI payouts settle instantly vs 2–3 days for NEFT
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Payout Timeline ──────────────────────────────────────────────── */}
        <Card className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
                <Clock className="h-4 w-4 text-[#2874f0]" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-700">Payout Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between gap-1 relative">
              {/* connecting line */}
              <div className="absolute left-0 right-0 top-[18px] h-0.5 bg-slate-100 mx-6" />
              {PAYOUT_TIMELINE.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                      ${step.active
                        ? 'bg-[#2874f0] border-[#2874f0] text-white'
                        : 'bg-white border-slate-200 text-slate-300'
                      }`}
                  >
                    {step.active ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-[11px] font-semibold ${step.active ? 'text-[#2874f0]' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Settlements processed Mon–Sat, excluding bank holidays
            </p>
          </CardContent>
        </Card>

        {/* ── Security Trust Grid ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-[#2874f0]" />
            <h3 className="text-sm font-semibold text-slate-700">Your Data is Protected</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`${item.bg} rounded-lg p-2 shrink-0`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Compliance Note ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="bg-white/10 rounded-lg p-2 shrink-0">
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">Industry-Standard Compliance</p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                We comply with <strong className="text-white">PCI-DSS Level 1</strong>, India's{' '}
                <strong className="text-white">IT Act 2000</strong>, and RBI's payment aggregator
                guidelines. Your banking information is never stored in plain text and is protected by
                multi-layer access controls and real-time fraud monitoring.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['PCI-DSS L1', 'RBI Compliant', 'IT Act 2000', 'ISO 27001', 'SOC 2 Type II'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold bg-white/10 border border-white/20 px-2 py-0.5 rounded-full text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Footer ────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-100 -mx-4 px-4 py-4 flex items-center justify-between rounded-b-2xl shadow-lg">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
            256-bit encrypted · Never shared
          </p>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#2874f0] hover:bg-[#1a55c4] text-white font-semibold gap-2 px-8 rounded-xl shadow-md shadow-[#2874f0]/30"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Securely…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Bank Details
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}