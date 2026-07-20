// src/components/vendor/TrustBadges.tsx
import { Lock, ShieldCheck, FileKey } from 'lucide-react'

const BADGES = [
  { icon: Lock, label: 'SSL Secured' },
  { icon: ShieldCheck, label: 'PCI-DSS Compliant' },
  { icon: FileKey, label: 'Encrypted Data Storage' },
]

export function TrustBadges() {
  return (
    <div
      aria-label="Security and compliance"
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-lg border border-[#e5e8eb] bg-[#F1F3F6] px-4 py-3"
    >
      {BADGES.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-[#5f6874]">
          <Icon className="h-3.5 w-3.5 text-[#2874F0]" strokeWidth={2.25} />
          {label}
        </div>
      ))}
    </div>
  )
}