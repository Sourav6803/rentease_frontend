// src/app/admin/settings/admins/components/CreateAdminModal.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Eye, EyeOff, Shield, UserCog, Briefcase, Users, BarChart3, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const createAdminSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['super_admin', 'admin', 'operations_manager', 'support_manager', 'finance_manager']),
  department: z.string().min(2, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  employeeId: z.string().min(2, 'Employee ID is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type CreateAdminForm = z.infer<typeof createAdminSchema>

interface CreateAdminModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin', icon: Shield, description: 'Full system access' },
  { value: 'admin', label: 'Admin', icon: UserCog, description: 'Standard admin access' },
  { value: 'operations_manager', label: 'Operations Manager', icon: Briefcase, description: 'Manage operations' },
  { value: 'support_manager', label: 'Support Manager', icon: Users, description: 'Manage support team' },
  { value: 'finance_manager', label: 'Finance Manager', icon: BarChart3, description: 'Manage finances' },
]

export function CreateAdminModal({ open, onClose, onSuccess }: CreateAdminModalProps) {
  const { data: session } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      role: 'admin'
    }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: CreateAdminForm) => {
    setIsSubmitting(true)
    try {
      const payload = {
        email: data.email,
        phone: data.phone,
        password: data.password,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          department: data.department,
          designation: data.designation,
          employeeId: data.employeeId
        },
        role: data.role
      }

      const response = await axios.post(`${BASE_URL}/api/v1/admin/admins`, payload, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })

      if (response.data.success) {
        toast.success('Admin created successfully')
        reset()
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      console.error('Error creating admin:', error)
      toast.error(error.response?.data?.message || 'Failed to create admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const selectedRoleConfig = roleOptions.find(r => r.value === selectedRole)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Add New Administrator
          </DialogTitle>
          <DialogDescription>
            Create a new admin account with specific role and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Employment Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input id="employeeId" {...register('employeeId')} placeholder="EMP001" />
                {errors.employeeId && (
                  <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input id="department" {...register('department')} placeholder="IT, HR, Operations..." />
                {errors.department && (
                  <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input id="designation" {...register('designation')} placeholder="Manager, Executive..." />
                {errors.designation && (
                  <p className="text-xs text-red-500 mt-1">{errors.designation.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select onValueChange={(v) => setValue('role', v as any)} defaultValue="admin">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => {
                      const Icon = role.icon
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">- {role.description}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Description */}
          {selectedRoleConfig && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <selectedRoleConfig.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedRoleConfig.label} Permissions</span>
              </div>
              <p className="text-xs text-muted-foreground">{selectedRoleConfig.description}</p>
            </div>
          )}

          {/* Password */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Security</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Create Admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}