'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Code2,
  ListChecks,
  Webhook,
  Rocket,
  Copy,
  Check,
} from 'lucide-react'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StorefrontEventExample } from '@/types/admin-intelligence.types'

interface ImplementationGuideProps {
  className?: string
}

const TRACKED_EVENTS = [
  { type: 'page_view', desc: 'Any storefront or product page render' },
  { type: 'product_view', desc: 'Product detail page opened' },
  { type: 'search', desc: 'Search query submitted with results count' },
  { type: 'add_to_cart', desc: 'Item added to rental cart' },
  { type: 'wishlist_add', desc: 'Item saved to wishlist' },
  { type: 'checkout_start', desc: 'Checkout flow initiated' },
  { type: 'rental_start', desc: 'Rental order successfully placed' },
]

const SNIPPET = `import { track } from '@/lib/analytics'

export function useProductView(productId: string) {
  return useCallback(() => {
    track({
      eventType: 'product_view',
      productId,
      sessionId: getSessionId(),
      metadata: { source: 'recommendation' },
    })
  }, [productId])
}`

const PAYLOAD = `{
  "eventType": "product_view",
  "userId": "usr_8f2a…",
  "productId": "prd_1k9c…",
  "sessionId": "sess_44b1…",
  "timestamp": "2026-07-11T09:24:11.000Z",
  "device": "mobile",
  "browser": "chrome",
  "location": "Bengaluru, IN",
  "trafficSource": "organic",
  "metadata": { "source": "recommendation" }
}`

function CodeBlock({ code, onCopy }: { code: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    try {
      navigator.clipboard.writeText(code)
      setCopied(true)
      onCopy()
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* noop */
    }
  }
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <Button
        variant="ghost"
        size="sm"
        onClick={copy}
        className="absolute right-2 top-2 h-7 gap-1.5 px-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <ScrollArea className="max-h-72">
        <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-slate-200">{code}</pre>
      </ScrollArea>
    </div>
  )
}

export function ImplementationGuide({ className }: ImplementationGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Behaviour tracking — implementation guide</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Wire up the storefront event stream to populate every panel on this page.
          </p>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 bg-slate-100/80 p-1">
          <TabsTrigger value="events" className="gap-1.5 text-xs data-[state=active]:bg-white">
            <ListChecks className="h-3.5 w-3.5" />
            Events
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5 text-xs data-[state=active]:bg-white">
            <Code2 className="h-3.5 w-3.5" />
            Hook
          </TabsTrigger>
          <TabsTrigger value="payload" className="gap-1.5 text-xs data-[state=active]:bg-white">
            <Webhook className="h-3.5 w-3.5" />
            Payload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TRACKED_EVENTS.map((e) => (
              <div
                key={e.type}
                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white/70 p-3"
              >
                <Badge
                  variant="outline"
                  className="mt-0.5 shrink-0 border-violet-200 bg-violet-50 text-[10px] font-bold uppercase text-violet-700"
                >
                  {e.type.replace(/_/g, ' ')}
                </Badge>
                <p className="text-xs text-slate-500">{e.desc}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <CodeBlock code={SNIPPET} onCopy={() => undefined} />
        </TabsContent>

        <TabsContent value="payload" className="mt-4">
          <CodeBlock code={PAYLOAD} onCopy={() => undefined} />
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/70 p-3 text-xs text-slate-500">
        <Rocket className="h-4 w-4 text-indigo-500" />
        Once events fire, refresh this page — the KPIs, charts and event stream populate automatically.
      </div>
    </motion.div>
  )
}

export default ImplementationGuide
