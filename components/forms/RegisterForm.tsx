'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/useToast'
import { authApi } from '@/lib/api/auth'

type RegisterRole = 'user' | 'vendor'

export function RegisterForm() {
  const router = useRouter()
  const toast = useToast()

  const [role, setRole] = useState<RegisterRole>('user')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const passwordOk = useMemo(() => password.trim().length >= 6, [password])
  const phoneOk = useMemo(() => /^[6-9]\d{9}$/.test(phone.trim()), [phone])
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
  const namesOk = useMemo(
    () => firstName.trim().length >= 2 && lastName.trim().length >= 2,
    [firstName, lastName]
  )

  const canSubmit = useMemo(() => {
    if (!emailOk || !phoneOk || !passwordOk || !namesOk) return false
    if (password !== confirmPassword) return false
    if (role === 'vendor') return businessName.trim().length >= 2
    return true
  }, [emailOk, phoneOk, passwordOk, namesOk, password, confirmPassword, role, businessName])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    if (!canSubmit) return

    try {
      setIsSubmitting(true)

      await authApi.register({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        businessName: role === 'vendor' ? businessName.trim() : undefined,
      })

      toast.success('Account created! Please verify your email.')
      router.push('/login')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to register'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/70 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Join RentEase to rent furniture & appliances with flexible monthly plans.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4 grid grid-cols-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`rounded-md px-3 py-2 text-sm ${
              role === 'user' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`rounded-md px-3 py-2 text-sm ${
              role === 'vendor' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Vendor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="e.g. Rahul"
              value={firstName}
              onChange={(ev) => setFirstName(ev.target.value)}
              autoComplete="given-name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="e.g. Sharma"
              value={lastName}
              onChange={(ev) => setLastName(ev.target.value)}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">+91</span>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value.replace(/\D/g, '').slice(0, 10))}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          {role === 'vendor' ? (
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                placeholder="Store name"
                value={businessName}
                onChange={(ev) => setBusinessName(ev.target.value)}
                autoComplete="organization"
                required
              />
            </div>
          ) : null}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use a unique password to keep your account safe.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {isSubmitting ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

