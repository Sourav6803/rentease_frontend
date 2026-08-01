// 'use client'

// import { motion } from 'framer-motion'
// import { Phone, Edit2, Trash2, CheckCheck } from 'lucide-react'

// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Address } from './types'

// const typeIcons: Record<Address['type'], string> = { home: '🏠', work: '💼', other: '📍' }

// // ─── AddressCard ──────────────────────────────────────────────────────────────
// // Presentational card for a single saved address. Purely driven by props — all
// // actions are delegated to the parent (AddressList). Design tokens from the
// // profile page are inlined as literal Tailwind classes so the card is
// // self-contained and reusable anywhere.
// export function AddressCard({
//   address,
//   onEdit,
//   onDelete,
//   onSetDefault,
// }: {
//   address: Address
//   onEdit: () => void
//   onDelete: () => void
//   onSetDefault: () => void
// }) {
//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       className={`relative p-5 rounded-2xl border transition-all duration-300 group
//         ${address.isDefault ? 'border-blue-200 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}
//     >
//       {address.isDefault && (
//         <div className="absolute top-4 right-4">
//           <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-bold uppercase tracking-wider">Default</Badge>
//         </div>
//       )}
//       <div className="flex items-start gap-3 mb-4">
//         <span className="text-xl">{typeIcons[address.type]}</span>
//         <div>
//           <div className="flex items-center gap-2">
//             <p className="text-sm font-bold text-slate-900 capitalize">{address.type}</p>
//             {address.name && <span className="text-slate-400">·</span>}
//             {address.name && <p className="text-sm text-slate-500">{address.name}</p>}
//           </div>
//         </div>
//       </div>
//       <div className="space-y-1 text-sm text-slate-500 mb-5">
//         <p className="font-medium text-slate-900">{address.addressLine1}</p>
//         {address.addressLine2 && <p>{address.addressLine2}</p>}
//         {address.landmark && <p className="text-xs">Near: {address.landmark}</p>}
//         <p>{address.city}, {address.state} – {address.pincode}</p>
//         {address.phone && <p className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />{address.phone}</p>}
//       </div>
//       <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
//         {!address.isDefault && (
//           <Button variant="ghost" size="sm" className="text-xs h-8 text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3" onClick={onSetDefault}>
//             <CheckCheck className="h-3 w-3 mr-1" />Set default
//           </Button>
//         )}
//         <div className="ml-auto flex items-center gap-1">
//           <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-500 hover:text-slate-900" onClick={onEdit} aria-label="Edit address">
//             <Edit2 className="h-3.5 w-3.5" />
//           </Button>
//           <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-50 text-slate-400 hover:text-rose-600" onClick={onDelete} aria-label="Delete address">
//             <Trash2 className="h-3.5 w-3.5" />
//           </Button>
//         </div>
//       </div>
//     </motion.div>
//   )
// }


// components/address/AddressCard.tsx

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2, CheckCheck, Phone, MapPin, Home, Briefcase, MapPin as MapPinIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Address } from '@/types/address'

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
  className?: string
}

const typeIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  home: { icon: <Home className="h-4 w-4" />, label: 'Home' },
  work: { icon: <Briefcase className="h-4 w-4" />, label: 'Work' },
  other: { icon: <MapPinIcon className="h-4 w-4" />, label: 'Other' },
}

const typeColors: Record<string, string> = {
  home: 'bg-blue-50 text-blue-700 border-blue-200',
  work: 'bg-purple-50 text-purple-700 border-purple-200',
  other: 'bg-slate-50 text-slate-700 border-slate-200',
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault, className = '' }: AddressCardProps) {
  const typeInfo = typeIcons[address.type] || typeIcons.other
  const typeColor = typeColors[address.type] || typeColors.other

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 group
        ${address.isDefault ? 'border-blue-200 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}
        ${className}`}
    >
      {address.isDefault && (
        <div className="absolute top-4 right-4">
          <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-bold uppercase tracking-wider">
            Default
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${typeColor} flex items-center justify-center`}>
          {typeInfo.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900 capitalize">{typeInfo.label}</p>
            {address.name && <span className="text-slate-400">·</span>}
            {address.name && <p className="text-sm text-slate-500">{address.name}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm text-slate-500 mb-5">
        <p className="font-medium text-slate-900">{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        {address.landmark && <p className="text-xs">Near: {address.landmark}</p>}
        <p>
          {address.city}, {address.state} – {address.pincode}
        </p>
        {address.phone && (
          <p className="text-xs flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {address.phone}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
        {!address.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3"
            onClick={() => onSetDefault(address._id)}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Set default
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            onClick={() => onEdit(address)}
            aria-label="Edit address"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-rose-50 text-slate-400 hover:text-rose-600"
            onClick={() => onDelete(address._id)}
            aria-label="Delete address"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
