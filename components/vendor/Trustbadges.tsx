// src/components/vendor/TrustBadges.tsx
import { Lock, ShieldCheck, FileKey } from 'lucide-react'

const BADGES = [
  { icon: Lock, label: 'SSL Secured' },
  { icon: ShieldCheck, label: 'PCI-DSS Compliant' },
  { icon: FileKey, label: 'Encrypted Storage' },
]

export function TrustBadges() {
  return (
    <div
      aria-label="Security and compliance"
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl border border-border bg-muted/40 px-4 py-3"
    >
      {BADGES.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-brand" strokeWidth={2.25} />
          {label}
        </div>
      ))}
    </div>
  )
}
