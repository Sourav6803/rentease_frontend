// src/app/vendor/settings/components/ProfileTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  Award,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  Shield,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import axios from 'axios'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const profileSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessDescription: z.string().max(500, 'Description must be less than 500 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  secondaryPhone: z.string().optional(),
  supportEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  serviceableCities: z.array(z.object({
    city: z.string(),
    state: z.string(),
    isActive: z.boolean()
  })).optional(),
  serviceablePincodes: z.array(z.string()).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileTabProps {
  profile: any
  onUpdate: () => void
}

export function ProfileTab({ profile, onUpdate }: ProfileTabProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newCity, setNewCity] = useState({ city: '', state: '' })
  const [newPincode, setNewPincode] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: profile?.business?.name || '',
      businessDescription: profile?.business?.description || '',
      website: profile?.business?.website || '',
      secondaryPhone: profile?.contact?.secondaryPhone || '',
      supportEmail: profile?.contact?.supportEmail || '',
      supportPhone: profile?.contact?.supportPhone || '',
      city: profile?.addresses?.registeredOffice?.city || '',
      state: profile?.addresses?.registeredOffice?.state || '',
      pincode: profile?.addresses?.registeredOffice?.pincode || '',
      serviceableCities: profile?.addresses?.serviceableCities || [],
      serviceablePincodes: profile?.addresses?.serviceablePincodes || [],
    }
  })

  const serviceableCities = watch('serviceableCities') || []
  const serviceablePincodes = watch('serviceablePincodes') || []

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    try {
      const payload = {
        business: {
          name: data.businessName,
          description: data.businessDescription,
          website: data.website,
        },
        contact: {
          secondaryPhone: data.secondaryPhone,
          supportEmail: data.supportEmail,
          supportPhone: data.supportPhone,
        },
        addresses: {
          serviceableCities: data.serviceableCities,
          serviceablePincodes: data.serviceablePincodes,
        }
      }

      const response = await axios.put(`${BASE_URL}/api/v1/vendor/profile`, payload, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`
        }
      })

      if (response.data.success) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const addServiceableCity = () => {
    if (newCity.city && newCity.state) {
      const updatedCities = [...serviceableCities, { ...newCity, isActive: true }]
      setValue('serviceableCities', updatedCities)
      setNewCity({ city: '', state: '' })
    }
  }

  const removeServiceableCity = (index: number) => {
    const updatedCities = serviceableCities.filter((_, i) => i !== index)
    setValue('serviceableCities', updatedCities)
  }

  const addServiceablePincode = () => {
    if (newPincode && /^\d{6}$/.test(newPincode)) {
      const updatedPincodes = [...serviceablePincodes, newPincode]
      setValue('serviceablePincodes', updatedPincodes)
      setNewPincode('')
    }
  }

  const removeServiceablePincode = (pincode: string) => {
    const updatedPincodes = serviceablePincodes.filter(p => p !== pincode)
    setValue('serviceablePincodes', updatedPincodes)
  }

  const statsCards = [
    { label: 'Total Products', value: profile?.products?.total || 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Rentals', value: profile?.performance?.metrics?.totalRentals || 0, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Total Revenue', value: `₹${(profile?.performance?.metrics?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Response Rate', value: `${profile?.performance?.metrics?.responseRate || 0}%`, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Business Profile</h2>
          <p className="text-sm text-muted-foreground">
            Manage your business information and service areas
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`${stat.bg} rounded-xl p-4 border`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <Badge variant="secondary" className="text-xs">All Time</Badge>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Profile Display Mode */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Business Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Business Name</Label>
                  <p className="font-medium">{profile?.business?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Business Type</Label>
                  <p className="font-medium capitalize">{profile?.business?.businessType?.replace('_', ' ') || 'N/A'}</p>
                </div>
                {profile?.business?.gstin && (
                  <div>
                    <Label className="text-muted-foreground text-xs">GSTIN</Label>
                    <p className="font-mono text-sm">{profile.business.gstin}</p>
                  </div>
                )}
                {profile?.business?.panNumber && (
                  <div>
                    <Label className="text-muted-foreground text-xs">PAN Number</Label>
                    <p className="font-mono text-sm">{profile.business.panNumber}</p>
                  </div>
                )}
                {profile?.business?.website && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Website</Label>
                    <a href={profile.business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      {profile.business.website}
                    </a>
                  </div>
                )}
                {profile?.business?.description && (
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground text-xs">Description</Label>
                    <p className="text-sm">{profile.business.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Primary Phone</Label>
                  <p className="font-medium">{profile?.contact?.primaryPhone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Secondary Phone</Label>
                  <p className="font-medium">{profile?.contact?.secondaryPhone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Primary Email</Label>
                  <p className="font-medium">{profile?.contact?.primaryEmail || profile?.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Support Email</Label>
                  <p className="font-medium">{profile?.contact?.supportEmail || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Support Phone</Label>
                  <p className="font-medium">{profile?.contact?.supportPhone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Address</Label>
                  <p className="text-sm">{profile?.addresses?.registeredOffice?.addressLine1 || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">City</Label>
                  <p className="font-medium">{profile?.addresses?.registeredOffice?.city || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">State</Label>
                  <p className="font-medium">{profile?.addresses?.registeredOffice?.state || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Pincode</Label>
                  <p className="font-medium">{profile?.addresses?.registeredOffice?.pincode || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground text-xs mb-2 block">Serviceable Cities</Label>
                <div className="flex flex-wrap gap-2">
                  {profile?.addresses?.serviceableCities?.map((city: any, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {city.city}, {city.state}
                    </Badge>
                  ))}
                  {(!profile?.addresses?.serviceableCities || profile.addresses.serviceableCities.length === 0) && (
                    <p className="text-sm text-muted-foreground">No cities added</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs mb-2 block">Serviceable Pincodes</Label>
                <div className="flex flex-wrap gap-2">
                  {profile?.addresses?.serviceablePincodes?.map((pincode: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {pincode}
                    </Badge>
                  ))}
                  {(!profile?.addresses?.serviceablePincodes || profile.addresses.serviceablePincodes.length === 0) && (
                    <p className="text-sm text-muted-foreground">No pincodes added</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Subscription Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-bold capitalize">{profile?.subscription?.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">
                    {profile?.subscription?.validUntil 
                      ? format(new Date(profile.subscription.validUntil), 'dd MMM yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto Renew</p>
                  <p className="font-medium">{profile?.subscription?.autoRenew ? 'Yes' : 'No'}</p>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade Plan
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Max Products</p>
                  <p className="font-semibold">{profile?.subscription?.limits?.maxProducts === -1 ? 'Unlimited' : profile?.subscription?.limits?.maxProducts}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max Rentals/Month</p>
                  <p className="font-semibold">{profile?.subscription?.limits?.maxRentalsPerMonth === -1 ? 'Unlimited' : profile?.subscription?.limits?.maxRentalsPerMonth}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority Support</p>
                  <p className="font-semibold">{profile?.subscription?.limits?.prioritySupport ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Edit Mode Form
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Information</CardTitle>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  {...register('businessName')}
                  className={errors.businessName ? 'border-red-500' : ''}
                />
                {errors.businessName && (
                  <p className="text-xs text-red-500 mt-1">{errors.businessName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  {...register('businessDescription')}
                  rows={4}
                  placeholder="Tell customers about your business..."
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register('website')} placeholder="https://yourbusiness.com" />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                  <Input id="secondaryPhone" {...register('secondaryPhone')} placeholder="Alternate contact number" />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input id="supportEmail" {...register('supportEmail')} type="email" placeholder="support@yourbusiness.com" />
                </div>
                <div>
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input id="supportPhone" {...register('supportPhone')} placeholder="Customer support number" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Areas</CardTitle>
              <CardDescription>Where you provide your services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Serviceable Cities</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="City"
                    value={newCity.city}
                    onChange={(e) => setNewCity({ ...newCity, city: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="State"
                    value={newCity.state}
                    onChange={(e) => setNewCity({ ...newCity, state: e.target.value })}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addServiceableCity} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {serviceableCities.map((city, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {city.city}, {city.state}
                      <button type="button" onClick={() => removeServiceableCity(idx)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Serviceable Pincodes</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="6-digit pincode"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addServiceablePincode} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {serviceablePincodes.map((pincode, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {pincode}
                      <button type="button" onClick={() => removeServiceablePincode(pincode)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}