// src/components/vendor/ValuePropositionGrid.tsx
import { IndianRupee, Users, ShieldCheck, Headset, type LucideIcon } from 'lucide-react'

interface ValueProp {
  icon: LucideIcon
  title: string
  description: string
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: IndianRupee,
    title: '0% Listing Fee',
    description: 'List unlimited products with zero upfront cost',
  },
  {
    icon: Users,
    title: '10 Lakh+ Renters',
    description: 'Your listings reach a ready, verified audience',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Bi-Weekly Payouts',
    description: 'Money settles to your bank account, every 14 days',
  },
  {
    icon: Headset,
    title: 'Dedicated Account Manager',
    description: 'A real person who knows your business by name',
  },
]

export function ValuePropositionGrid() {
  return (
    <section aria-label="Why sell on RentEase" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="group rounded-lg border border-[#e5e8eb] bg-white p-4 transition-shadow hover:shadow-[0_2px_12px_rgba(40,116,240,0.12)]"
        >
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#2874F0]/10">
            <Icon className="h-4.5 w-4.5 text-[#2874F0]" strokeWidth={2.25} />
          </div>
          <div className="text-sm font-semibold text-[#212121]">{title}</div>
          <p className="mt-1 text-xs leading-snug text-[#5f6874]">{description}</p>
        </div>
      ))}
    </section>
  )
}