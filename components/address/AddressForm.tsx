// components/address/AddressForm.tsx

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressFormData, AddressType } from '@/types/address'

interface AddressFormProps {
  initialData?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const initialFormData: AddressFormData = {
  type: 'home',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
  landmark: '',
  phone: '',
  name: '',
}

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save address',
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    ...initialFormData,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    await onSubmit(formData)
  }

  const handleChange = (field: keyof AddressFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-500">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: AddressType) => handleChange('type', value)}
        >
          <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="home">🏠 Home</SelectItem>
            <SelectItem value="work">💼 Work</SelectItem>
            <SelectItem value="other">📍 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-500">Full name</Label>
        <Input
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Recipient name"
          className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-500">
          Address line 1 <span className="text-rose-500 ml-0.5">*</span>
        </Label>
        <Input
          value={formData.addressLine1}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          placeholder="House / building"
          className={`bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400 ${
            errors.addressLine1 ? 'border-rose-500 focus:border-rose-500' : ''
          }`}
        />
        {errors.addressLine1 && (
          <p className="text-xs text-rose-500 mt-1">{errors.addressLine1}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-500">Address line 2</Label>
        <Input
          value={formData.addressLine2 || ''}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          placeholder="Street / area"
          className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-500">Landmark</Label>
        <Input
          value={formData.landmark || ''}
          onChange={(e) => handleChange('landmark', e.target.value)}
          placeholder="Nearby landmark"
          className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-500">
            City <span className="text-rose-500 ml-0.5">*</span>
          </Label>
          <Input
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
            className={`bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400 ${
              errors.city ? 'border-rose-500 focus:border-rose-500' : ''
            }`}
          />
          {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-500">
            State <span className="text-rose-500 ml-0.5">*</span>
          </Label>
          <Input
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State"
            className={`bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400 ${
              errors.state ? 'border-rose-500 focus:border-rose-500' : ''
            }`}
          />
          {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-500">
            Pincode <span className="text-rose-500 ml-0.5">*</span>
          </Label>
          <Input
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
            maxLength={6}
            placeholder="6-digit code"
            className={`font-mono bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400 ${
              errors.pincode ? 'border-rose-500 focus:border-rose-500' : ''
            }`}
          />
          {errors.pincode && <p className="text-xs text-rose-500 mt-1">{errors.pincode}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-500">Phone</Label>
          <Input
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Contact number"
            className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <p className="text-sm font-medium text-slate-900">Set as default</p>
          <p className="text-xs text-slate-500">Use this address by default</p>
        </div>
        <Switch
          checked={formData.isDefault || false}
          onCheckedChange={(checked) => handleChange('isDefault', checked)}
        />
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="rounded-xl text-slate-700 hover:bg-slate-50 flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-sm shadow-blue-500/25 flex-1"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </motion.form>
  )
}