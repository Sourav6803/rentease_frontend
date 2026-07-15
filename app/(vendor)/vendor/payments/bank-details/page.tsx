// app/vendor/payments/bank-details/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Building2, CreditCard, Shield, CheckCircle, AlertCircle,
  Save, Edit, X, Eye, EyeOff, Banknote, Lock, Phone, Mail
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

interface BankDetails {
  accountHolderName: string
  accountNumber: string
  confirmAccountNumber: string
  bankName: string
  ifscCode: string
  branchName: string
  accountType: 'savings' | 'current'
  upiId?: string
  isVerified: boolean
}

interface VendorBankInfo {
  bankDetails: {
    accountHolderName: string
    accountNumber: string
    bankName: string
    ifscCode: string
    branchName: string
    accountType: string
    upiId?: string
    verified: boolean
    verifiedAt?: string
  }
}

export default function BankDetailsPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: '',
    accountType: 'current',
    upiId: '',
    isVerified: false
  })
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchBankDetails()
    }
  }, [status])
  
  const fetchBankDetails = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/profile/me`, { headers })
      const data = await res.json()
      
      if (data.success && data.data.bankDetails) {
        setBankDetails({
          accountHolderName: data.data.bankDetails.accountHolderName || '',
          accountNumber: data.data.bankDetails.accountNumber || '',
          confirmAccountNumber: data.data.bankDetails.accountNumber || '',
          bankName: data.data.bankDetails.bankName || '',
          ifscCode: data.data.bankDetails.ifscCode || '',
          branchName: data.data.bankDetails.branchName || '',
          accountType: data.data.bankDetails.accountType || 'current',
          upiId: data.data.bankDetails.upiId || '',
          isVerified: data.data.bankDetails.verified || false
        })
      }
    } catch (error) {
      toast.error('Failed to load bank details')
    } finally {
      setIsLoading(false)
    }
  }
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!bankDetails.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required'
    }
    if (!bankDetails.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required'
    } else if (!/^\d{9,18}$/.test(bankDetails.accountNumber)) {
      newErrors.accountNumber = 'Enter a valid account number (9-18 digits)'
    }
    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match'
    }
    if (!bankDetails.bankName.trim()) {
      newErrors.bankName = 'Bank name is required'
    }
    if (!bankDetails.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required'
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Enter a valid IFSC code'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSaving(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/bank-details`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          accountHolderName: bankDetails.accountHolderName,
          accountNumber: bankDetails.accountNumber,
          bankName: bankDetails.bankName,
          ifscCode: bankDetails.ifscCode.toUpperCase(),
          branchName: bankDetails.branchName,
          accountType: bankDetails.accountType,
          upiId: bankDetails.upiId
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Bank details updated successfully')
        setIsEditing(false)
        fetchBankDetails()
      } else {
        toast.error(data.message || 'Failed to update bank details')
      }
    } catch (error) {
      toast.error('Failed to update bank details')
    } finally {
      setIsSaving(false)
    }
  }
  
  const maskAccountNumber = (number: string) => {
    if (!number) return ''
    return `XXXXXX${number.slice(-4)}`
  }
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading bank details...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Verification Banner */}
      {!bankDetails.isVerified && bankDetails.accountNumber && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Bank Account Not Verified</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Your bank account details are pending verification. Payouts will be processed once verified.
                This usually takes 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Bank Account Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your payout bank details</p>
          </div>
          {!isEditing && bankDetails.accountNumber && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#2874f0] hover:bg-[#ebf3fb] rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 ${
                    errors.accountHolderName ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="As per bank account"
                />
                {errors.accountHolderName && (
                  <p className="text-xs text-red-500 mt-1">{errors.accountHolderName}</p>
                )}
              </>
            ) : (
              <p className="text-slate-800 py-2.5">{bankDetails.accountHolderName || 'Not provided'}</p>
            )}
          </div>
          
          {/* Account Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Account Number <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <input
                    type={showAccountNumber ? 'text' : 'password'}
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 pr-10 ${
                      errors.accountNumber ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="Enter account number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showAccountNumber ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              ) : (
                <p className="text-slate-800 py-2.5 font-mono">
                  {maskAccountNumber(bankDetails.accountNumber)}
                </p>
              )}
              {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
            </div>
            
            {isEditing && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={bankDetails.confirmAccountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 ${
                    errors.confirmAccountNumber ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="Confirm account number"
                />
                {errors.confirmAccountNumber && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmAccountNumber}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Bank Name & IFSC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Bank Name <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 ${
                      errors.bankName ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="e.g., State Bank of India"
                  />
                  {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
                </>
              ) : (
                <p className="text-slate-800 py-2.5">{bankDetails.bankName || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 uppercase ${
                      errors.ifscCode ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="e.g., SBIN0001234"
                  />
                  {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
                </>
              ) : (
                <p className="text-slate-800 py-2.5 font-mono uppercase">{bankDetails.ifscCode || 'Not provided'}</p>
              )}
            </div>
          </div>
          
          {/* Branch Name & Account Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Branch Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={bankDetails.branchName}
                  onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                  placeholder="Branch location"
                />
              ) : (
                <p className="text-slate-800 py-2.5">{bankDetails.branchName || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Account Type
              </label>
              {isEditing ? (
                <select
                  value={bankDetails.accountType}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value as 'savings' | 'current' })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                >
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                </select>
              ) : (
                <p className="text-slate-800 py-2.5 capitalize">{bankDetails.accountType || 'Not selected'}</p>
              )}
            </div>
          </div>
          
          {/* UPI ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              UPI ID <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bankDetails.upiId}
                onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                placeholder="e.g., yourname@okhdfcbank"
              />
            ) : (
              <p className="text-slate-800 py-2.5">{bankDetails.upiId || 'Not provided'}</p>
            )}
          </div>
          
          {/* Security Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800">Secure & Encrypted</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Your bank details are encrypted and securely stored. We never share your complete account
                  information with third parties.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  fetchBankDetails()
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
      
      {/* Payout Schedule Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Banknote className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Payout Schedule</h3>
            <p className="text-xs text-slate-500">When you'll receive your payments</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Payout Frequency</p>
            <p className="font-medium text-slate-800">Weekly (Every Friday)</p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Minimum Payout</p>
            <p className="font-medium text-slate-800">₹1,000</p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Processing Time</p>
            <p className="font-medium text-slate-800">3-5 business days</p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Settlement Currency</p>
            <p className="font-medium text-slate-800">Indian Rupee (INR)</p>
          </div>
        </div>
      </div>
      
      {/* Verified Badge */}
      {bankDetails.isVerified && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Bank Account Verified</p>
              <p className="text-xs text-green-700">
                Your bank account has been verified. Payouts will be processed to this account.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}