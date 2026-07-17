

// src/components/vendor/steps/ContactDetailsStep.tsx (Updated)
'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactDetailsStepProps {
  form: UseFormReturn<any>
}

export function ContactDetailsStep({ form }: ContactDetailsStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const password = form.watch('password')
  const confirmPassword = form.watch('confirmPassword')

  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'No password', color: 'bg-gray-200' }
    
    let score = 0
    if (pass.length >= 8) score++
    if (pass.match(/[A-Z]/)) score++
    if (pass.match(/[0-9]/)) score++
    if (pass.match(/[^A-Za-z0-9]/)) score++
    
    if (score === 1) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score === 2) return { score, label: 'Fair', color: 'bg-orange-500' }
    if (score === 3) return { score, label: 'Good', color: 'bg-yellow-500' }
    if (score >= 4) return { score, label: 'Strong', color: 'bg-green-500' }
    return { score, label: 'Weak', color: 'bg-red-500' }
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name *</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="John" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name *</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Doe" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="vendor@example.com" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                We'll send verification email to this address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="9876543210" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                10-digit mobile number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className={cn("pl-9 pr-10", password && passwordStrength.score < 3 && "border-yellow-500")}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className={cn("pl-9 pr-10", confirmPassword && !passwordsMatch && "border-red-500")}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Password Strength Indicator */}
      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Password Strength:</span>
            <span className={cn(
              "text-sm font-medium",
              passwordStrength.score === 1 && "text-red-500",
              passwordStrength.score === 2 && "text-orange-500",
              passwordStrength.score === 3 && "text-yellow-500",
              passwordStrength.score >= 4 && "text-green-500"
            )}>
              {passwordStrength.label}
            </span>
          </div>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  i < passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            <li className={cn(password.length >= 8 ? "text-green-500" : "")}>
              ✓ At least 8 characters
            </li>
            <li className={cn(password.match(/[A-Z]/) ? "text-green-500" : "")}>
              ✓ At least one uppercase letter
            </li>
            <li className={cn(password.match(/[0-9]/) ? "text-green-500" : "")}>
              ✓ At least one number
            </li>
            <li className={cn(password.match(/[^A-Za-z0-9]/) ? "text-green-500" : "")}>
              ✓ At least one special character
            </li>
          </ul>
        </div>
      )}

      {/* Password Match Alert */}
      {confirmPassword && (
        <Alert className={cn(
          passwordsMatch ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        )}>
          {passwordsMatch ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✓ Passwords match
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                ✗ Passwords do not match
              </AlertDescription>
            </>
          )}
        </Alert>
      )}
    </div>
  )
}