'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Activity, Package, CreditCard, Star, ArrowRight } from 'lucide-react'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`

interface ActivityItem {
  _id: string
  activityType: 'rental' | 'payment' | 'review'
  date: string
  rentalNumber?: string
  status?: string
  amount?: number
  rating?: number
  product?: { basicInfo?: { name?: string; slug?: string } }
  rental?: { rentalNumber?: string }
}

const CONFIG = {
  rental: { icon: Package, tint: 'bg-blue-50 text-blue-600', label: 'Rental' },
  payment: { icon: CreditCard, tint: 'bg-emerald-50 text-emerald-600', label: 'Payment' },
  review: { icon: Star, tint: 'bg-amber-50 text-amber-600', label: 'Review' },
} as const

function describe(a: ActivityItem): string {
  if (a.activityType === 'rental') return `Rented ${a.product?.basicInfo?.name || 'a product'}`
  if (a.activityType === 'payment') return `Paid ${fmt(a.amount || 0)}${a.rental?.rentalNumber ? ` · #${a.rental.rentalNumber}` : ''}`
  return `Reviewed ${a.product?.basicInfo?.name || 'a product'}${a.rating ? ` · ${a.rating}★` : ''}`
}

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function RecentActivity() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.accessToken) { setLoaded(true); return }
    let active = true
    axios
      .get(`${BASE_URL}/api/v1/users/activity?limit=5`, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      })
      .then(res => {
        if (!active) return
        if (res.data?.success) setItems(res.data.data.activities || [])
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true))
    return () => { active = false }
  }, [status, session])

  if (!loaded || status !== 'authenticated' || items.length === 0) return null

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-foreground">Your recent activity</h2>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:gap-2 transition-all">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {items.map((a, i) => {
            const cfg = CONFIG[a.activityType] ?? CONFIG.rental
            const Icon = cfg.icon
            const slug = a.product?.basicInfo?.slug
            const Wrapper: any = slug ? Link : 'div'
            const wrapperProps = slug ? { href: `/products/${slug}` } : {}
            return (
              <motion.div
                key={`${a.activityType}-${a._id}-${i}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Wrapper {...wrapperProps} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-muted/40 transition-colors">
                  <span className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.tint}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{describe(a)}</p>
                    <p className="text-xs text-muted-foreground">{cfg.label} · {timeAgo(a.date)}</p>
                  </div>
                  {a.status && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0 capitalize">
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </Wrapper>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
