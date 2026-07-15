'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import {
  CheckCircle, Package, Truck, Calendar, MapPin,
  ArrowRight, Download, Share2, Home, Clock,
  ShieldCheck, Star, ChevronRight, Sparkles,
} from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderDetails {
  rentalId: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; months: number; amount: number }>
  address: string
  deliverySlot: string
  totalAmount: number
  securityDeposit: number
  estimatedDelivery: string
  status: string
}

// ── Confetti Particle ─────────────────────────────────────────────────────────

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#2874f0', '#fb641b', '#388e3c', '#f5c518', '#e91e8c', '#00bcd4']
    const particles: {
      x: number; y: number; vx: number; vy: number
      color: string; size: number; rotation: number; vr: number; shape: number
    }[] = []

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 8,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 6,
        shape: Math.floor(Math.random() * 3),
      })
    }

    let frame = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.vr
        p.vy += 0.05 // gravity

        if (p.y > canvas.height + 20) {
          particles.splice(i, 1)
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height + 0.3)

        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5)
        } else if (p.shape === 1) {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(0, -p.size / 2)
          ctx.lineTo(p.size / 2, p.size / 2)
          ctx.lineTo(-p.size / 2, p.size / 2)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      })

      frame++
      if (particles.length > 0 && frame < 300) {
        animId = requestAnimationFrame(draw)
      }
    }

    // Slight delay before burst
    const t = setTimeout(() => { animId = requestAnimationFrame(draw) }, 300)

    return () => {
      clearTimeout(t)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

// ── Step Tracker ──────────────────────────────────────────────────────────────

function OrderTimeline({ estimatedDelivery }: { estimatedDelivery: string }) {
  const steps = [
    { icon: CheckCircle, label: 'Order Confirmed', sub: 'Just now', done: true, active: false },
    { icon: Package, label: 'Being Prepared', sub: 'Within 2 hours', done: false, active: true },
    { icon: Truck, label: 'Out for Delivery', sub: estimatedDelivery || 'Scheduled', done: false, active: false },
    { icon: Home, label: 'Delivered', sub: 'At your door', done: false, active: false },
  ]

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[#e0e0e0] z-0" />
      <div className="absolute left-5 top-5 w-0.5 bg-[#388e3c] z-0" style={{ height: '15%' }} />

      <div className="space-y-0">
        {steps.map((s, i) => {
          const Ic = s.icon
          return (
            <div key={i} className="relative flex items-start gap-4 pb-6 last:pb-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                s.done
                  ? 'bg-[#388e3c] border-[#388e3c]'
                  : s.active
                  ? 'bg-white border-[#2874f0] shadow-md shadow-blue-100'
                  : 'bg-white border-[#e0e0e0]'
              }`}>
                <Ic className={`w-4 h-4 ${s.done ? 'text-white' : s.active ? 'text-[#2874f0]' : 'text-[#ccc]'}`} />
              </div>
              <div className="pt-1.5">
                <p className={`text-sm font-bold ${s.done ? 'text-[#388e3c]' : s.active ? 'text-[#2874f0]' : 'text-[#bbb]'}`}>
                  {s.label}
                </p>
                <p className={`text-xs mt-0.5 ${s.done || s.active ? 'text-[#888]' : 'text-[#ccc]'}`}>{s.sub}</p>
              </div>
              {s.active && (
                <div className="ml-auto pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2874f0] bg-[#f0f5ff] px-2.5 py-1 rounded-full border border-[#c5d8ff]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2874f0] animate-pulse" />
                    IN PROGRESS
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Animated Check ────────────────────────────────────────────────────────────

function AnimatedSuccess() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      <div className="absolute w-32 h-32 rounded-full bg-[#388e3c]/10 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute w-24 h-24 rounded-full bg-[#388e3c]/15 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />

      {/* Main circle */}
      <div
        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#43a047] to-[#2e7d32] flex items-center justify-center shadow-2xl shadow-green-200"
        style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
      >
        <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Info Row ──────────────────────────────────────────────────────────────────

function InfoRow({ icon: Ic, label, value, highlight }: {
  icon: React.ElementType; label: string; value: string; highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f5f5f5] last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${highlight ? 'bg-[#fff3e0]' : 'bg-[#f5f5f5]'}`}>
        <Ic className={`w-4 h-4 ${highlight ? 'text-[#f57c00]' : 'text-[#888]'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#999] font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-[#f57c00]' : 'text-[#333]'}`}>{value}</p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animStep, setAnimStep] = useState(0)

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!orderId) {
      router.replace('/dashboard/orders')
      return
    }
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/checkout/success?orderId=${orderId}`)}`)
      return
    }

    const token = session?.user?.accessToken
    if (!token) return

    loadOrderDetails(token)
  }, [orderId, status, session?.user?.accessToken, router])

  // Staggered entrance animations
  useEffect(() => {
    if (!loading) {
      setShowConfetti(true)
      const timers = [
        setTimeout(() => setAnimStep(1), 100),
        setTimeout(() => setAnimStep(2), 400),
        setTimeout(() => setAnimStep(3), 650),
        setTimeout(() => setAnimStep(4), 850),
        setTimeout(() => setShowConfetti(false), 4000),
      ]
      return () => timers.forEach(clearTimeout)
    }
  }, [loading])

  const loadOrderDetails = async (token: string) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/v1/rentals/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        const rental = res.data.data.rental

        // Derive a human-readable delivery slot
        const rawSlot = rental.deliverySlot || ''
        let deliveryLabel = 'As scheduled'
        if (rawSlot.includes('|')) {
          const [dateStr, time] = rawSlot.split('|')
          const d = new Date(dateStr)
          deliveryLabel = `${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${time}`
        }

        setOrder({
          rentalId: rental._id,
          orderNumber: rental.orderNumber || rental._id.slice(-8).toUpperCase(),
          items: (rental.items || []).map((it: {
            product?: { basicInfo?: { name?: string } }
            quantity?: number
            rentalMonths?: number
            totals?: { lineTotal?: number }
          }) => ({
            name: it.product?.basicInfo?.name || 'Item',
            quantity: it.quantity || 1,
            months: it.rentalMonths || 1,
            amount: it.totals?.lineTotal || 0,
          })),
          address: [
            rental.deliveryAddress?.addressLine1,
            rental.deliveryAddress?.city,
            rental.deliveryAddress?.pincode,
          ].filter(Boolean).join(', '),
          deliverySlot: deliveryLabel,
          totalAmount: rental.rentalDetails?.totalAmount || rental.totalAmount || 0,
          securityDeposit: rental.rentalDetails?.securityDeposit || 0,
          estimatedDelivery: deliveryLabel,
          status: rental.status || 'confirmed',
        })
      }
    } catch (err) {
      console.error('[Success] Failed to load order:', err)
      // Still show success even if order details fail — payment was confirmed
      setOrder({
        rentalId: orderId!,
        orderNumber: orderId!.slice(-8).toUpperCase(),
        items: [],
        address: 'Your saved address',
        deliverySlot: 'As scheduled',
        totalAmount: 0,
        securityDeposit: 0,
        estimatedDelivery: 'As per selected slot',
        status: 'confirmed',
      })
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => n > 0
    ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : '—'

  // ── Loading screen ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#e0e0e0]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#2874f0] animate-spin" />
          </div>
          <p className="font-bold text-[#333] text-lg">Confirming your order…</p>
          <p className="text-sm text-[#888] mt-1">Just a moment, we're loading your receipt</p>
        </div>
      </div>
    )
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  return (
    <>
      {showConfetti && <ConfettiCanvas />}

      <div className="min-h-screen bg-[#f1f3f6] font-sans">
        {/* Top brand bar */}
        <div className="bg-white border-b border-[#e0e0e0] px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-[#2874f0] font-black text-2xl tracking-tight">RentEase</span>
            <div className="flex items-center gap-1.5 text-xs text-[#388e3c] font-bold">
              <ShieldCheck className="w-4 h-4" />
              Secured by Razorpay
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

          {/* ── Hero card ─────────────────────────────────────────────────── */}
          <div
            className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden transition-all duration-500"
            style={{ opacity: animStep >= 1 ? 1 : 0, transform: animStep >= 1 ? 'translateY(0)' : 'translateY(20px)' }}
          >
            {/* Green header band */}
            <div className="bg-gradient-to-r from-[#2e7d32] to-[#43a047] px-6 py-8 text-center relative overflow-hidden">
              {/* Subtle pattern */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="relative z-10">
                <AnimatedSuccess />
                <h1 className="mt-5 text-2xl font-black text-white tracking-tight">
                  Order Placed Successfully!
                </h1>
                <p className="text-green-100 text-sm mt-1.5 font-medium">
                  We've received your payment and confirmed your rental
                </p>

                {order?.orderNumber && (
                  <div className="inline-flex items-center gap-2 mt-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5">
                    <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">Order ID</span>
                    <span className="text-white font-black text-sm tracking-wider">#{order.orderNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 divide-x divide-[#f0f0f0] border-b border-[#f0f0f0]">
              {[
                { label: 'Amount Paid', value: fmt(order?.totalAmount || 0), color: 'text-[#333]' },
                { label: 'Security Deposit', value: fmt(order?.securityDeposit || 0), color: 'text-[#f57c00]' },
                { label: 'Status', value: 'Confirmed ✓', color: 'text-[#388e3c]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-4 py-4 text-center">
                  <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest mb-1">{label}</p>
                  <p className={`text-sm font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Delivery info */}
            <div className="px-6 py-5">
              <InfoRow icon={MapPin} label="Delivery Address" value={order?.address || '—'} />
              <InfoRow icon={Clock} label="Delivery Slot" value={order?.deliverySlot || '—'} highlight />
              <InfoRow icon={Truck} label="Estimated Delivery" value={order?.estimatedDelivery || '—'} />
            </div>
          </div>

          {/* ── Items list ────────────────────────────────────────────────── */}
          {order && order.items.length > 0 && (
            <div
              className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden transition-all duration-500"
              style={{ opacity: animStep >= 2 ? 1 : 0, transform: animStep >= 2 ? 'translateY(0)' : 'translateY(20px)' }}
            >
              <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2874f0]" />
                <h2 className="font-black text-[#333] text-sm uppercase tracking-wide">
                  Your Rental Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-[#f8f8f8]">
                {order.items.map((item, i) => (
                  <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#f0f5ff] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-[#2874f0]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#333]">{item.name}</p>
                        <p className="text-xs text-[#888] mt-0.5">
                          Qty {item.quantity} · {item.months} month{item.months > 1 ? 's' : ''} rental
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-[#333] shrink-0">{fmt(item.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Order timeline ────────────────────────────────────────────── */}
          <div
            className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden transition-all duration-500"
            style={{ opacity: animStep >= 3 ? 1 : 0, transform: animStep >= 3 ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#2874f0]" />
              <h2 className="font-black text-[#333] text-sm uppercase tracking-wide">Delivery Progress</h2>
            </div>
            <div className="px-5 py-5">
              <OrderTimeline estimatedDelivery={order?.estimatedDelivery || ''} />
            </div>
          </div>

          {/* ── Info banner ───────────────────────────────────────────────── */}
          <div
            className="bg-[#fff8e1] border border-[#ffe082] rounded-lg px-5 py-4 flex gap-3 items-start transition-all duration-500"
            style={{ opacity: animStep >= 3 ? 1 : 0 }}
          >
            <Star className="w-5 h-5 text-[#f9a825] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#795548]">Security Deposit is 100% Refundable</p>
              <p className="text-xs text-[#8d6e63] mt-0.5">
                Your deposit of {fmt(order?.securityDeposit || 0)} will be fully refunded when you return the items in good condition at the end of your rental period.
              </p>
            </div>
          </div>

          {/* ── CTAs ──────────────────────────────────────────────────────── */}
          <div
            className="space-y-3 transition-all duration-500"
            style={{ opacity: animStep >= 4 ? 1 : 0, transform: animStep >= 4 ? 'translateY(0)' : 'translateY(12px)' }}
          >
            <button
              onClick={() => router.push(`/dashboard/orders/${orderId}`)}
              className="w-full bg-[#2874f0] hover:bg-[#1a5fd0] text-white font-black text-sm py-4 rounded-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] shadow-lg shadow-blue-100"
            >
              <Package className="w-5 h-5" />
              VIEW ORDER DETAILS
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/products')}
                className="py-3.5 rounded-lg border-2 border-[#e0e0e0] text-sm font-bold text-[#555] hover:border-[#2874f0] hover:text-[#2874f0] hover:bg-[#f0f5ff] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                RENT MORE
              </button>
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="py-3.5 rounded-lg border-2 border-[#e0e0e0] text-sm font-bold text-[#555] hover:border-[#2874f0] hover:text-[#2874f0] hover:bg-[#f0f5ff] transition-all flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                ALL ORDERS
              </button>
            </div>
          </div>

          {/* ── Trust footer ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-6 py-2 text-xs text-[#aaa]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#388e3c]" />
              Payment secured
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2874f0]" />
              Easy returns
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#f9a825]" />
              Quality assured
            </span>
          </div>

        </div>
      </div>
    </>
  )
}