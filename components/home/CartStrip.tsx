'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`

/**
 * "Still in your cart" strip — nudges logged-in users back to items they added.
 * Renders nothing when the cart is empty or the user is a guest.
 */
export function CartStrip() {
  const { cart, itemCount } = useCart()

  if (!cart || itemCount < 1 || !cart.items?.length) return null

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)]" />
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="h-11 w-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-foreground">Still in your cart</p>
              <p className="text-xs text-muted-foreground">
                {itemCount} item{itemCount > 1 ? 's' : ''} · {fmt(cart.summary?.grandTotal || 0)}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex -space-x-3 flex-1 overflow-hidden">
            {cart.items.slice(0, 6).map((item) => {
              const img = item.product?.media?.images?.find(i => i.isPrimary)?.url || item.product?.media?.images?.[0]?.url
              return (
                <Link
                  key={item._id}
                  href={`/products/${item.product?.basicInfo?.slug || ''}`}
                  className="h-12 w-12 rounded-xl border-2 border-card bg-muted overflow-hidden shrink-0 hover:scale-110 transition-transform"
                  title={item.product?.basicInfo?.name}
                >
                  {img ? (
                    <img src={img} alt={item.product?.basicInfo?.name || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          <Link
            href="/cart"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-brand-foreground bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))] hover:opacity-90 transition-opacity"
          >
            Go to cart <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
