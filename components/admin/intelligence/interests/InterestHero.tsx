'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain,
  Clock,
  ChevronsDown,
  Repeat,
  Heart,
  ZoomIn,
  PackageCheck,
  FileText,
  ArrowRight,
  SlidersHorizontal,
  Megaphone,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const RULES = [
  { icon: Clock, label: 'Stay on product page for 15+ seconds' },
  { icon: ChevronsDown, label: 'Scroll entire product page' },
  { icon: Repeat, label: 'View same product more than twice' },
  { icon: Heart, label: 'Add product to wishlist' },
  { icon: ZoomIn, label: 'Zoom product images' },
  { icon: FileText, label: 'Download brochure' },
  { icon: PackageCheck, label: 'Check product availability' },
]

interface InterestHeroProps {
  onOpenRules: () => void
  className?: string
}

export function InterestHero({ onOpenRules, className }: InterestHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-lg sm:p-8 ${className ?? ''}`}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-fuchsia-300/20 blur-2xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-32 w-32 rounded-full bg-sky-300/20 blur-2xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Brain className="h-3.5 w-3.5" />
            AI-Powered Intent Detection
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How Interest Detection Works</h2>
          <p className="mt-2 max-w-xl text-sm text-indigo-100">
            Products are automatically marked as{' '}
            <span className="font-semibold text-white">“Interested”</span> whenever customers perform
            meaningful engagement actions. These behavioral signals contribute toward an AI-powered{' '}
            <span className="font-semibold text-white">Interest Score</span> that triggers personalised
            marketing automation.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RULES.map((rule) => {
              const Icon = rule.icon
              return (
                <div key={rule.label} className="flex items-start gap-2 text-sm text-indigo-50">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-indigo-200" />
                    {rule.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="sm"
              className="gap-1.5 bg-white text-indigo-700 shadow hover:bg-indigo-50"
              onClick={onOpenRules}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              View Scoring Rules
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-white/30 bg-white/10 text-white hover:bg-white/20"
              asChild
            >
              <Link href="/admin/intelligence/marketing">
                Marketing Automation
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative hidden justify-center lg:flex">
          <div className="relative h-56 w-56">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-40 w-40 flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur">
                <Brain className="h-10 w-10 text-white" />
                <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-indigo-100">
                  Interest Engine
                </span>
                <div className="mt-3 flex items-center gap-1.5">
                  {[60, 80, 95, 72].map((v, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full bg-white/70"
                      style={{ height: `${(v / 100) * 48}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <FloatingBadge icon={Heart} label="Wishlist" className="left-0 top-6" color="bg-pink-500" />
            <FloatingBadge icon={ZoomIn} label="Zoom" className="right-0 top-10" color="bg-teal-500" />
            <FloatingBadge
              icon={Clock}
              label="15s"
              className="bottom-6 left-4"
              color="bg-indigo-500"
            />
            <FloatingBadge
              icon={Megaphone}
              label="Offer"
              className="bottom-2 right-4"
              color="bg-amber-500"
            />
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function FloatingBadge({
  icon: Icon,
  label,
  className,
  color,
}: {
  icon: React.ElementType
  label: string
  className: string
  color: string
}) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute flex items-center gap-1.5 rounded-full ${color} px-3 py-1.5 text-xs font-semibold text-white shadow-lg ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.div>
  )
}

export default InterestHero
