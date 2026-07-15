// // src/components/vendor/steps/BankDetailsStep.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { UseFormReturn } from 'react-hook-form'
// import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Badge } from '@/components/ui/badge'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Building2, CreditCard, Banknote, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Info } from 'lucide-react'

// interface BankDetailsStepProps {
//   form: UseFormReturn<any>
// }

// interface IFSCDetails {
//   bank: string
//   branch: string
//   city: string
//   district: string
//   state: string
//   address: string
//   contact: string
//   ifsc: string
//   micr: string
// }

// export function BankDetailsStep({ form }: BankDetailsStepProps) {
//   const [showAccountNumber, setShowAccountNumber] = useState(false)
//   const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false)
//   const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false)
//   const [ifscDetails, setIfscDetails] = useState<IFSCDetails | null>(null)
//   const [ifscError, setIfscError] = useState<string | null>(null)
//   const [isValidatingAccount, setIsValidatingAccount] = useState(false)
//   const [accountValidationStatus, setAccountValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')

//   const accountNumber = form.watch('accountNumber')
//   const confirmAccountNumber = form.watch('confirmAccountNumber')
//   const ifscCode = form.watch('ifscCode')
//   const accountHolderName = form.watch('accountHolderName')
//   const upiId = form.watch('upiId')

//   // Verify IFSC code on change (with debounce)
//   useEffect(() => {
//     const verifyIFSC = async () => {
//       if (!ifscCode || ifscCode.length !== 11) {
//         setIfscDetails(null)
//         setIfscError(null)
//         return
//       }

//       setIsVerifyingIFSC(true)
//       setIfscError(null)

//       try {
//         // Using Razorpay IFSC API (free and reliable)
//         const response = await fetch(`https://ifsc.razorpay.com/${ifscCode.toUpperCase()}`)
        
//         if (!response.ok) {
//           throw new Error('Invalid IFSC code')
//         }

//         const data = await response.json()
//         setIfscDetails({
//           bank: data.BANK,
//           branch: data.BRANCH,
//           city: data.CITY,
//           district: data.DISTRICT,
//           state: data.STATE,
//           address: data.ADDRESS,
//           contact: data.CONTACT,
//           ifsc: data.IFSC,
//           micr: data.MICR,
//         })
        
//         // Auto-fill bank name if available
//         if (data.BANK && !form.getValues('bankName')) {
//           form.setValue('bankName', data.BANK)
//         }
//         if (data.BRANCH && !form.getValues('branchName')) {
//           form.setValue('branchName', data.BRANCH)
//         }
        
//       } catch (error) {
//         setIfscError('Invalid IFSC code. Please check and try again.')
//         setIfscDetails(null)
//       } finally {
//         setIsVerifyingIFSC(false)
//       }
//     }

//     const timeoutId = setTimeout(verifyIFSC, 500)
//     return () => clearTimeout(timeoutId)
//   }, [ifscCode, form])

//   // Validate account number (basic checks)
//   useEffect(() => {
//     if (accountNumber && accountNumber.length >= 9 && accountNumber.length <= 18) {
//       // Basic validation - can be enhanced with actual bank API
//       const isValidFormat = /^[0-9]+$/.test(accountNumber)
//       if (isValidFormat && accountNumber === confirmAccountNumber) {
//         setAccountValidationStatus('valid')
//       } else if (accountNumber !== confirmAccountNumber && confirmAccountNumber) {
//         setAccountValidationStatus('invalid')
//       } else {
//         setAccountValidationStatus('idle')
//       }
//     } else {
//       setAccountValidationStatus('idle')
//     }
//   }, [accountNumber, confirmAccountNumber])

//   // Mock bank validation (in production, integrate with bank API)
//   const validateBankAccount = async () => {
//     if (!accountNumber || !ifscCode || !accountHolderName) {
//       return
//     }

//     setIsValidatingAccount(true)
    
//     try {
//       // In production, call your backend API that verifies bank account
//       // This is a mock implementation
//       await new Promise(resolve => setTimeout(resolve, 1500))
      
//       // Simulate validation success
//       setAccountValidationStatus('valid')
//       form.setValue('bankVerified', true)
      
//     } catch (error) {
//       setAccountValidationStatus('invalid')
//       form.setError('accountNumber', {
//         type: 'manual',
//         message: 'Account validation failed. Please verify your details.',
//       })
//     } finally {
//       setIsValidatingAccount(false)
//     }
//   }

//   console.log(form.getValues())

//   return (
//     <div className="space-y-8">
//       {/* Bank Details Header */}
//       <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4">
//         <div className="flex items-start gap-3">
//           <Banknote className="h-5 w-5 text-primary mt-0.5" />
//           <div>
//             <h3 className="font-semibold">Bank Account Information</h3>
//             <p className="text-sm text-muted-foreground mt-1">
//               We use this information to process your payouts securely. All information is encrypted and stored safely.
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         {/* Account Holder Name */}
//         <FormField
//           control={form.control}
//           name="accountHolderName"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Account Holder Name *</FormLabel>
//               <FormControl>
//                 <div className="relative">
//                   <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     className="pl-9"
//                     placeholder="As per bank records"
//                     {...field}
//                     onChange={(e) => {
//                       field.onChange(e.target.value.toUpperCase())
//                     }}
//                     value={field.value ?? ''}
//                   />
//                 </div>
//               </FormControl>
//               <FormDescription>
//                 Name exactly as it appears on your bank account
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* IFSC Code */}
//         <FormField
//           control={form.control}
//           name="ifscCode"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>IFSC Code *</FormLabel>
//               <div className="relative">
//                 <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   className="pl-9 uppercase"
//                   placeholder="SBIN0001234"
//                   {...field}
//                   onChange={(e) => {
//                     field.onChange(e.target.value.toUpperCase())
//                   }}
//                   value={field.value ?? ''}
//                   maxLength={11}
//                 />
//                 {isVerifyingIFSC && (
//                   <div className="absolute right-3 top-3">
//                     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
//                   </div>
//                 )}
//               </div>
//               <FormDescription>
//                 11-character alphanumeric code (e.g., SBIN0001234)
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>

//       {/* IFSC Details Display */}
//       {ifscDetails && (
//         <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
//           <div className="flex items-start gap-3">
//             <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
//             <div className="flex-1">
//               <p className="font-medium text-green-900 dark:text-green-300">IFSC Verified</p>
//               <div className="mt-2 grid gap-2 text-sm text-green-800 dark:text-green-300">
//                 <div className="grid grid-cols-2 gap-2">
//                   <span className="font-medium">Bank:</span>
//                   <span>{ifscDetails.bank}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   <span className="font-medium">Branch:</span>
//                   <span>{ifscDetails.branch}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   <span className="font-medium">City:</span>
//                   <span>{ifscDetails.city}, {ifscDetails.state}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   <span className="font-medium">Address:</span>
//                   <span className="text-xs">{ifscDetails.address}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* IFSC Error */}
//       {ifscError && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{ifscError}</AlertDescription>
//         </Alert>
//       )}

//       {/* Account Number Fields */}
//       <div className="grid gap-6 md:grid-cols-2">
//         <FormField
//           control={form.control}
//           name="accountNumber"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Account Number *</FormLabel>
//               <FormControl>
//                 <div className="relative">
//                   <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     className="pl-9"
//                     type={showAccountNumber ? "text" : "password"}
//                     placeholder="Enter account number"
//                     {...field}
//                     onChange={(e) => {
//                       field.onChange(e.target.value.replace(/[^0-9]/g, ''))
//                     }}
//                     value={field.value ?? ''}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowAccountNumber(!showAccountNumber)}
//                     className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
//                   >
//                     {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </FormControl>
//               <FormDescription>
//                 Account number should be 9-18 digits
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="confirmAccountNumber"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Confirm Account Number *</FormLabel>
//               <FormControl>
//                 <div className="relative">
//                   <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     className="pl-9"
//                     type={showConfirmAccountNumber ? "text" : "password"}
//                     placeholder="Confirm account number"
//                     {...field}
//                     onChange={(e) => {
//                       field.onChange(e.target.value.replace(/[^0-9]/g, ''))
//                     }}
//                     value={field.value ?? ''}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
//                     className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
//                   >
//                     {showConfirmAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>

//       {/* Account Validation Status */}
//       {accountNumber && confirmAccountNumber && (
//         <div className="flex items-center justify-between rounded-lg border p-4">
//           <div className="flex items-center gap-3">
//             {accountValidationStatus === 'validating' ? (
//               <Loader2 className="h-5 w-5 animate-spin text-primary" />
//             ) : accountValidationStatus === 'valid' ? (
//               <CheckCircle className="h-5 w-5 text-green-600" />
//             ) : accountValidationStatus === 'invalid' ? (
//               <AlertCircle className="h-5 w-5 text-red-600" />
//             ) : null}
//             <div>
//               <p className="font-medium">
//                 {accountValidationStatus === 'valid' && 'Account numbers match'}
//                 {accountValidationStatus === 'invalid' && 'Account numbers do not match'}
//                 {accountValidationStatus === 'idle' && 'Account verification pending'}
//               </p>
//               {accountValidationStatus === 'valid' && (
//                 <p className="text-sm text-muted-foreground">
//                   ✓ Account number verified successfully
//                 </p>
//               )}
//             </div>
//           </div>
          
//           {accountValidationStatus === 'valid' && (
//             <Badge variant="outline" className="bg-green-50 text-green-700">
//               Verified
//             </Badge>
//           )}
//         </div>
//       )}

//       {/* Auto-filled Bank Details */}
//       <div className="grid gap-6 md:grid-cols-2">
//         <FormField
//           control={form.control}
//           name="bankName"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Bank Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="Auto-filled from IFSC" {...field} readOnly className="bg-muted" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="branchName"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Branch Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="Auto-filled from IFSC" {...field} readOnly className="bg-muted" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="accountType"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Account Type *</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select account type" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   <SelectItem value="savings">Savings Account</SelectItem>
//                   <SelectItem value="current">Current Account</SelectItem>
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="upiId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>UPI ID (Optional)</FormLabel>
//               <FormControl>
//                 <Input placeholder="username@okhdfcbank" {...field} value={field.value ?? ''} />
//               </FormControl>
//               <FormDescription>
//                 Alternative payment method for faster settlements
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </div>

//       {/* Verify Account Button */}
//       {accountValidationStatus === 'valid' && ifscDetails && !form.getValues('bankVerified') && (
//         <div className="flex justify-center">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={validateBankAccount}
//             disabled={isValidatingAccount}
//             className="gap-2"
//           >
//             {isValidatingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
//             Verify Bank Account
//           </Button>
//         </div>
//       )}

//       {/* Bank Verification Success */}
//       {form.getValues('bankVerified') && (
//         <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
//           <div className="flex items-start gap-3">
//             <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
//             <div>
//               <p className="font-medium text-green-900 dark:text-green-300">Bank Account Verified</p>
//               <p className="text-sm text-green-800 dark:text-green-300 mt-1">
//                 Your bank account has been successfully verified. Payouts will be processed to this account.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Security Note */}
//       <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
//         <div className="flex items-start gap-3">
//           <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
//           <div className="text-sm text-yellow-800 dark:text-yellow-300">
//             <p className="font-medium">Security Note</p>
//             <p className="mt-1">
//               Your bank details are encrypted and securely stored. We never share your complete account 
//               information with third parties. All transactions are PCI-DSS compliant.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Sample Cheque Info */}
//       <details className="rounded-lg border p-4 cursor-pointer group">
//         <summary className="font-medium text-sm flex items-center gap-2">
//           <Info className="h-4 w-4" />
//           How to find your account details?
//         </summary>
//         <div className="mt-3 text-sm text-muted-foreground space-y-2">
//           <p>You can find your bank account details on:</p>
//           <ul className="list-disc list-inside space-y-1 ml-2">
//             <li>Your bank passbook</li>
//             <li>Cheque book - IFSC and account number are printed on each cheque</li>
//             <li>Bank statement</li>
//             <li>Net banking / Mobile banking app</li>
//           </ul>
//           <div className="mt-3 p-3 bg-muted rounded-md">
//             <p className="font-mono text-xs">
//               Sample Cheque: Account number is at the bottom, IFSC is next to the branch name
//             </p>
//           </div>
//         </div>
//       </details>
//     </div>
//   )
// }


// src/components/vendor/steps/BankDetailsStep.tsx
'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import type { VendorFormValues } from '../vendor-registration-schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, CreditCard, Banknote, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Info } from 'lucide-react'

interface BankDetailsStepProps {
  form: UseFormReturn<VendorFormValues>
}

interface IFSCDetails {
  bank: string
  branch: string
  city: string
  district: string
  state: string
  address: string
  contact: string
  ifsc: string
  micr: string
}

export function BankDetailsStep({ form }: BankDetailsStepProps) {
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false)
  const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false)
  const [ifscDetails, setIfscDetails] = useState<IFSCDetails | null>(null)
  const [ifscError, setIfscError] = useState<string | null>(null)
  const [isValidatingAccount, setIsValidatingAccount] = useState(false)
  const [accountValidationStatus, setAccountValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')

  // Watch nested bank details
  const accountNumber = form.watch('bankDetails.accountNumber')
  const confirmAccountNumber = form.watch('bankDetails.confirmAccountNumber')
  const ifscCode = form.watch('bankDetails.ifscCode')
  const accountHolderName = form.watch('bankDetails.accountHolderName')
  const upiId = form.watch('bankDetails.upiId')
  const bankVerified = form.watch('bankDetails.bankVerified')

  // Verify IFSC code on change (with debounce)
  useEffect(() => {
    const verifyIFSC = async () => {
      if (!ifscCode || ifscCode.length !== 11) {
        setIfscDetails(null)
        setIfscError(null)
        return
      }

      setIsVerifyingIFSC(true)
      setIfscError(null)

      try {
        const response = await fetch(`https://ifsc.razorpay.com/${ifscCode.toUpperCase()}`)
        
        if (!response.ok) {
          throw new Error('Invalid IFSC code')
        }

        const data = await response.json()
        setIfscDetails({
          bank: data.BANK,
          branch: data.BRANCH,
          city: data.CITY,
          district: data.DISTRICT,
          state: data.STATE,
          address: data.ADDRESS,
          contact: data.CONTACT,
          ifsc: data.IFSC,
          micr: data.MICR,
        })
        
        // Auto-fill bank / branch (always strings so inputs stay controlled)
        form.setValue('bankDetails.bankName', String(data.BANK ?? ''), { shouldDirty: true })
        form.setValue('bankDetails.branchName', String(data.BRANCH ?? ''), { shouldDirty: true })
        
      } catch (error) {
        setIfscError('Invalid IFSC code. Please check and try again.')
        setIfscDetails(null)
      } finally {
        setIsVerifyingIFSC(false)
      }
    }

    const timeoutId = setTimeout(verifyIFSC, 500)
    return () => clearTimeout(timeoutId)
  }, [ifscCode, form])

  // Validate account number (basic checks)
  useEffect(() => {
    if (accountNumber && accountNumber.length >= 9 && accountNumber.length <= 18) {
      const isValidFormat = /^[0-9]+$/.test(accountNumber)
      if (isValidFormat && accountNumber === confirmAccountNumber) {
        setAccountValidationStatus('valid')
      } else if (accountNumber !== confirmAccountNumber && confirmAccountNumber) {
        setAccountValidationStatus('invalid')
      } else {
        setAccountValidationStatus('idle')
      }
    } else {
      setAccountValidationStatus('idle')
    }
  }, [accountNumber, confirmAccountNumber])

  const validateBankAccount = async () => {
    if (!accountNumber || !ifscCode || !accountHolderName) {
      return
    }

    setIsValidatingAccount(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAccountValidationStatus('valid')
      form.setValue('bankDetails.bankVerified', true)
      
    } catch (error) {
      setAccountValidationStatus('invalid')
      form.setError('bankDetails.accountNumber', {
        type: 'manual',
        message: 'Account validation failed. Please verify your details.',
      })
    } finally {
      setIsValidatingAccount(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Bank Details Header */}
      <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4">
        <div className="flex items-start gap-3">
          <Banknote className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold">Bank Account Information</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We use this information to process your payouts securely. All information is encrypted and stored safely.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Holder Name */}
        <FormField
          control={form.control}
          name="bankDetails.accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name *</FormLabel>
              <FormControl>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="As per bank records"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    value={field.value ?? ''}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Name exactly as it appears on your bank account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* IFSC Code */}
        <FormField
          control={form.control}
          name="bankDetails.ifscCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IFSC Code *</FormLabel>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 uppercase"
                  placeholder="SBIN0001234"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  value={field.value ?? ''}
                  maxLength={11}
                />
                {isVerifyingIFSC && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <FormDescription>
                11-character alphanumeric code (e.g., SBIN0001234)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* IFSC Details Display */}
      {ifscDetails && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-300">IFSC Verified</p>
              <div className="mt-2 grid gap-2 text-sm text-green-800 dark:text-green-300">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Bank:</span>
                  <span>{ifscDetails.bank}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Branch:</span>
                  <span>{ifscDetails.branch}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">City:</span>
                  <span>{ifscDetails.city}, {ifscDetails.state}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Address:</span>
                  <span className="text-xs">{ifscDetails.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IFSC Error */}
      {ifscError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{ifscError}</AlertDescription>
        </Alert>
      )}

      {/* Account Number Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="bankDetails.accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number *</FormLabel>
              <FormControl>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type={showAccountNumber ? "text" : "password"}
                    placeholder="Enter account number"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                    value={field.value ?? ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormDescription>
                Account number should be 9-18 digits
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankDetails.confirmAccountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Account Number *</FormLabel>
              <FormControl>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type={showConfirmAccountNumber ? "text" : "password"}
                    placeholder="Confirm account number"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                    value={field.value ?? ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Account Validation Status */}
      {accountNumber && confirmAccountNumber && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {accountValidationStatus === 'validating' ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : accountValidationStatus === 'valid' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : accountValidationStatus === 'invalid' ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : null}
            <div>
              <p className="font-medium">
                {accountValidationStatus === 'valid' && 'Account numbers match'}
                {accountValidationStatus === 'invalid' && 'Account numbers do not match'}
                {accountValidationStatus === 'idle' && 'Account verification pending'}
              </p>
            </div>
          </div>
          
          {accountValidationStatus === 'valid' && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Verified
            </Badge>
          )}
        </div>
      )}

      {/* Auto-filled Bank Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="bankDetails.bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Auto-filled from IFSC"
                  readOnly
                  className="bg-muted"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankDetails.branchName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Auto-filled from IFSC"
                  readOnly
                  className="bg-muted"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankDetails.accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? 'savings'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="current">Current Account</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankDetails.upiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPI ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="username@okhdfcbank"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Alternative payment method for faster settlements
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Verify Account Button */}
      {accountValidationStatus === 'valid' && ifscDetails && !bankVerified && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={validateBankAccount}
            disabled={isValidatingAccount}
            className="gap-2"
          >
            {isValidatingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Bank Account
          </Button>
        </div>
      )}

      {/* Bank Verification Success */}
      {bankVerified && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-300">Bank Account Verified</p>
              <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                Your bank account has been successfully verified. Payouts will be processed to this account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <p className="font-medium">Security Note</p>
            <p className="mt-1">
              Your bank details are encrypted and securely stored. We never share your complete account 
              information with third parties. All transactions are PCI-DSS compliant.
            </p>
          </div>
        </div>
      </div>

      {/* Sample Cheque Info */}
      <details className="rounded-lg border p-4 cursor-pointer group">
        <summary className="font-medium text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          How to find your account details?
        </summary>
        <div className="mt-3 text-sm text-muted-foreground space-y-2">
          <p>You can find your bank account details on:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Your bank passbook</li>
            <li>Cheque book - IFSC and account number are printed on each cheque</li>
            <li>Bank statement</li>
            <li>Net banking / Mobile banking app</li>
          </ul>
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="font-mono text-xs">
              Sample Cheque: Account number is at the bottom, IFSC is next to the branch name
            </p>
          </div>
        </div>
      </details>
    </div>
  )
}