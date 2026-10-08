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
    title: 'Bi-Weekly Payouts',
    description: 'Money settles to your bank account every 14 days',
  },
  {
    icon: Headset,
    title: 'Account Manager',
    description: 'A real person who knows your business by name',
  },
]

export function ValuePropositionGrid() {
  return (
    <section
      aria-label="Why sell on RentEase"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    >
      {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lg hover:shadow-brand/10"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft transition-colors group-hover:bg-brand">
            <Icon className="h-5 w-5 text-brand transition-colors group-hover:text-white" strokeWidth={2.25} />
          </div>
          <div className="text-sm font-bold text-foreground">{title}</div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{description}</p>
        </div>
      ))}
    </section>
  )
}
