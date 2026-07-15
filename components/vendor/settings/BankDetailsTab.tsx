// src/app/vendor/settings/components/BankDetailsTab.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  CreditCard,
  Building2,
  Banknote,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(3, 'Account holder name is required'),
  accountNumber: z.string().min(9, 'Account number must be at least 9 digits').max(18),
  confirmAccountNumber: z.string(),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bankName: z.string().min(2, 'Bank name is required'),
  branchName: z.string().optional(),
  accountType: z.enum(['savings', 'current']),
  upiId: z.string().optional(),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ['confirmAccountNumber'],
})

type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>

interface BankDetailsTabProps {
  profile: any
  onUpdate: () => void
}

export function BankDetailsTab({ profile, onUpdate }: BankDetailsTabProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(!profile?.bankDetails?.verified)
  const [isLoading, setIsLoading] = useState(false)
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false)
  const [ifscDetails, setIfscDetails] = useState<any>(null)
  const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: profile?.bankDetails?.accountHolderName || '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: profile?.bankDetails?.ifscCode || '',
      bankName: profile?.bankDetails?.bankName || '',
      branchName: profile?.bankDetails?.branchName || '',
      accountType: profile?.bankDetails?.accountType || 'savings',
      upiId: profile?.bankDetails?.upiId || '',
    }
  })

  const ifscCode = watch('ifscCode')

  const verifyIFSC = async (code: string) => {
    if (!code || code.length !== 11) return
    
    setIsVerifyingIFSC(true)
    try {
      const response = await axios.get(`https://ifsc.razorpay.com/${code.toUpperCase()}`)
      if (response.data) {
        setIfscDetails(response.data)
        setValue('bankName', response.data.BANK)
        setValue('branchName', response.data.BRANCH)
        toast.success('IFSC code verified')
      }
    } catch (error) {
      console.error('IFSC verification failed:', error)
      toast.error('Invalid IFSC code')
      setIfscDetails(null)
    } finally {
      setIsVerifyingIFSC(false)
    }
  }

  const onSubmit = async (data: BankDetailsFormValues) => {
    setIsLoading(true)
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
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`
        }
      })

      if (response.data.success) {
        toast.success('Bank details updated successfully')
        setIsEditing(false)
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error updating bank details:', error)
      toast.error(error.response?.data?.message || 'Failed to update bank details')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Bank Account Details</h2>
          <p className="text-sm text-muted-foreground">
            Manage your payout account information
          </p>
        </div>
        {profile?.bankDetails?.verified && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            Edit Bank Details
          </Button>
        )}
      </div>

      {/* Verification Status */}
      {profile?.bankDetails?.verified && !isEditing && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Bank Account Verified</p>
                <p className="text-sm text-green-700">
                  Your bank account has been verified. Payouts will be sent to this account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Details Form */}
      {(isEditing || !profile?.bankDetails?.verified) && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>
                Enter your bank account details for receiving payouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  {...register('accountHolderName')}
                  placeholder="As per bank records"
                  className={errors.accountHolderName ? 'border-red-500' : ''}
                />
                {errors.accountHolderName && (
                  <p className="text-xs text-red-500 mt-1">{errors.accountHolderName.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="accountNumber"
                      type={showAccountNumber ? 'text' : 'password'}
                      {...register('accountNumber')}
                      placeholder="Enter account number"
                      className={`pl-9 ${errors.accountNumber ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.accountNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.accountNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmAccountNumber"
                      type={showConfirmAccountNumber ? 'text' : 'password'}
                      {...register('confirmAccountNumber')}
                      placeholder="Confirm account number"
                      className={`pl-9 ${errors.confirmAccountNumber ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmAccountNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmAccountNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ifscCode">IFSC Code *</Label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ifscCode"
                      {...register('ifscCode')}
                      placeholder="SBIN0001234"
                      className={`pl-9 uppercase ${errors.ifscCode ? 'border-red-500' : ''}`}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase()
                        setValue('ifscCode', value)
                        verifyIFSC(value)
                      }}
                    />
                    {isVerifyingIFSC && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {errors.ifscCode && (
                    <p className="text-xs text-red-500 mt-1">{errors.ifscCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountType">Account Type *</Label>
                  <select
                    id="accountType"
                    {...register('accountType')}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                  </select>
                  {errors.accountType && (
                    <p className="text-xs text-red-500 mt-1">{errors.accountType.message}</p>
                  )}
                </div>
              </div>

              {ifscDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Bank Verified</p>
                  <p className="text-xs text-green-700">{ifscDetails.BANK} - {ifscDetails.BRANCH}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    {...register('bankName')}
                    placeholder="Auto-filled from IFSC"
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    {...register('branchName')}
                    placeholder="Auto-filled from IFSC"
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="upiId">UPI ID (Optional)</Label>
                <Input
                  id="upiId"
                  {...register('upiId')}
                  placeholder="username@okhdfcbank"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add your UPI ID for faster payouts
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Secure & Encrypted</p>
                  <p className="text-sm text-blue-700">
                    Your bank details are encrypted and securely stored. We never share your complete account information with third parties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            {profile?.bankDetails?.verified && (
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Bank Details
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}