

// 'use client'

// import { Toaster } from 'sonner'

// export function ToastProvider() {
//   return (
//     <Toaster
//       position="top-right"
//       richColors
//       closeButton
//       toastOptions={{
//         duration: 4000,
//         className: 'border',
//         style: {
//           background: '#1bde31', // dark gray (Tailwind gray-800)
//           color: '#ffffff',
//           border: '1px solid #374151',
//         },
//       }}
//     />
//   )
// }


'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      gap={8}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            'group flex items-start gap-3 rounded-lg border shadow-lg px-4 py-3 text-sm font-medium transition-all',
          title: 'font-semibold text-[0.875rem] leading-snug',
          description: 'text-[0.8125rem] leading-relaxed opacity-80 mt-0.5',
          actionButton:
            'mt-2 inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          cancelButton:
            'mt-2 inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity',
          closeButton:
            'absolute top-2 right-2 opacity-40 hover:opacity-100 transition-opacity rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2',
          icon: 'mt-0.5 shrink-0',
        },
        style: {
          // Neutral dark base — works across light and dark UIs
          '--normal-bg': '#18181b',           // zinc-900
          '--normal-border': '#27272a',       // zinc-800
          '--normal-text': '#fafafa',         // zinc-50

          '--success-bg': '#052e16',          // green-950
          '--success-border': '#166534',      // green-800
          '--success-text': '#dcfce7',        // green-100

          '--error-bg': '#450a0a',            // red-950
          '--error-border': '#991b1b',        // red-800
          '--error-text': '#fee2e2',          // red-100

          '--warning-bg': '#431407',          // orange-950
          '--warning-border': '#9a3412',      // orange-800
          '--warning-text': '#ffedd5',        // orange-100

          '--info-bg': '#172554',             // blue-950
          '--info-border': '#1e40af',         // blue-800
          '--info-text': '#dbeafe',           // blue-100

          // Shared layout tokens
          '--border-radius': '0.5rem',
          '--font-size': '0.875rem',
          '--mobile-offset-bottom': '16px',
        } as React.CSSProperties,
      }}
    />
  )
}