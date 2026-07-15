

// 'use client'

// import { Shield, Truck, RotateCcw, Headphones, Clock, CreditCard, type LucideIcon } from 'lucide-react'

// // ─── Service definitions with per-item gradient identity ──────────────────────
// interface Service {
//   icon: LucideIcon
//   title: string
//   description: string
//   gradFrom: string
//   gradTo: string
//   iconColor: string
//   glow: string
// }

// const services: Service[] = [
//   {
//     icon: Truck,
//     title: 'Free Delivery',
//     description: 'On orders above ₹5,000',
//     gradFrom: '#dbeafe',
//     gradTo: '#eff6ff',
//     iconColor: '#1d4ed8',
//     glow: 'rgba(59,130,246,0.35)',
//   },
//   {
//     icon: Shield,
//     title: 'Secure Payments',
//     description: '100% encrypted transactions',
//     gradFrom: '#dcfce7',
//     gradTo: '#f0fdf4',
//     iconColor: '#15803d',
//     glow: 'rgba(34,197,94,0.35)',
//   },
//   {
//     icon: RotateCcw,
//     title: 'Easy Returns',
//     description: '7-day hassle-free returns',
//     gradFrom: '#ffedd5',
//     gradTo: '#fff7ed',
//     iconColor: '#c2410c',
//     glow: 'rgba(249,115,22,0.35)',
//   },
//   {
//     icon: Headphones,
//     title: '24/7 Support',
//     description: 'Always here to help',
//     gradFrom: '#f3e8ff',
//     gradTo: '#fdf4ff',
//     iconColor: '#7e22ce',
//     glow: 'rgba(168,85,247,0.35)',
//   },
//   {
//     icon: Clock,
//     title: 'Same-Day Delivery',
//     description: 'Available in select cities',
//     gradFrom: '#fef3c7',
//     gradTo: '#fffbeb',
//     iconColor: '#b45309',
//     glow: 'rgba(245,158,11,0.35)',
//   },
//   {
//     icon: CreditCard,
//     title: 'Flexible Plans',
//     description: '3–12 months rental options',
//     gradFrom: '#ccfbf1',
//     gradTo: '#f0fdfa',
//     iconColor: '#0f766e',
//     glow: 'rgba(20,184,166,0.35)',
//   },
// ]

// export function ServiceStrip() {
//   return (
//     <>
//       <style>{`
//         .ss-strip {
//           width: 100%;
//           position: relative;
//           background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
//           border-top: 1px solid #eef1f6;
//           border-bottom: 1px solid #eef1f6;
//         }

//         /* Thin gradient hairline signature at the very top of the strip */
//         .ss-strip::before {
//           content: '';
//           position: absolute;
//           top: -1px; left: 0; right: 0;
//           height: 2px;
//           background: linear-gradient(90deg, #3b82f6, #22c55e, #f97316, #a855f7, #f59e0b, #14b8a6);
//           opacity: 0.9;
//         }

//         .ss-inner {
//           max-width: 1280px;
//           margin: 0 auto;
//           padding: 4px 16px;
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 8px;
//         }
//         @media (min-width: 640px)  { .ss-inner { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
//         @media (min-width: 1024px) { .ss-inner { grid-template-columns: repeat(6, 1fr); gap: 12px; padding: 8px 16px; } }

//         .ss-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 16px 14px;
//           position: relative;
//           border-radius: 14px;
//           border: 1px solid transparent;
//           transition: transform 0.22s cubic-bezier(.4,0,.2,1), border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
//           cursor: default;
//           background: transparent;
//         }

//         .ss-item:hover,
//         .ss-item:focus-within {
//           transform: translateY(-3px);
//           background: #ffffff;
//           border-color: #eef1f6;
//           box-shadow: 0 10px 24px -12px var(--ss-glow), 0 2px 6px -2px rgba(15, 23, 42, 0.06);
//         }

//         /* Icon wrapper — soft gradient badge with ring */
//         .ss-icon-wrap {
//           width: 42px; height: 42px;
//           border-radius: 12px;
//           display: flex; align-items: center; justify-content: center;
//           flex-shrink: 0;
//           background: linear-gradient(145deg, var(--ss-grad-from), var(--ss-grad-to));
//           box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
//           transition: transform 0.28s cubic-bezier(.4,0,.2,1), box-shadow 0.28s ease;
//         }
//         .ss-item:hover .ss-icon-wrap {
//           transform: scale(1.1) rotate(-6deg);
//           box-shadow: 0 6px 14px -4px var(--ss-glow), inset 0 0 0 1px rgba(15, 23, 42, 0.04);
//         }

//         .ss-icon {
//           width: 19px; height: 19px;
//           stroke-width: 2.25;
//           color: var(--ss-icon-color);
//           flex-shrink: 0;
//         }

//         /* Text */
//         .ss-text { min-width: 0; }
//         .ss-title {
//           font-size: 12.5px;
//           font-weight: 700;
//           color: #0f172a;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           letter-spacing: 0.1px;
//           line-height: 1.35;
//           margin-bottom: 2px;
//         }
//         .ss-desc {
//           font-size: 11.5px;
//           color: #94a3b8;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           line-height: 1.35;
//           font-weight: 500;
//         }

//         /* Reduced motion */
//         @media (prefers-reduced-motion: reduce) {
//           .ss-item, .ss-icon-wrap { transition: none; }
//           .ss-item:hover { transform: none; }
//           .ss-item:hover .ss-icon-wrap { transform: none; }
//         }

//         /* Dark mode */
//         @media (prefers-color-scheme: dark) {
//           .ss-strip { background: linear-gradient(180deg, #0b1220 0%, #0f172a 100%); border-color: #1e293b; }
//           .ss-item:hover, .ss-item:focus-within { background: #131c2e; border-color: #1e293b; }
//           .ss-icon-wrap { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
//           .ss-title { color: #f1f5f9; }
//           .ss-desc  { color: #64748b; }
//         }
//       `}</style>

//       <div className="ss-strip" role="list" aria-label="Our services">
//         <div className="ss-inner">
//           {services.map((svc, idx) => {
//             const Icon = svc.icon
//             return (
//               <div
//                 key={svc.title}
//                 className="ss-item"
//                 tabIndex={0}
//                 style={{
//                   '--ss-grad-from': svc.gradFrom,
//                   '--ss-grad-to': svc.gradTo,
//                   '--ss-icon-color': svc.iconColor,
//                   '--ss-glow': svc.glow,
//                 } as React.CSSProperties}
//                 role="listitem"
//               >
//                 <div className="ss-icon-wrap" aria-hidden="true">
//                   <Icon className="ss-icon" />
//                 </div>
//                 <div className="ss-text">
//                   <p className="ss-title">{svc.title}</p>
//                   <p className="ss-desc">{svc.description}</p>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </>
//   )
// }


'use client'

import { Shield, Truck, RotateCcw, Headphones, Clock, CreditCard, type LucideIcon } from 'lucide-react'

// ─── Service definitions with per-item gradient identity ──────────────────────
interface Service {
  icon: LucideIcon
  title: string
  description: string
  gradFrom: string
  gradTo: string
  iconColor: string
  glow: string
}

const services: Service[] = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'On orders above ₹5,000',
    gradFrom: '#dbeafe',
    gradTo: '#eff6ff',
    iconColor: '#1d4ed8',
    glow: 'rgba(59,130,246,0.35)',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: '100% encrypted',
    gradFrom: '#dcfce7',
    gradTo: '#f0fdf4',
    iconColor: '#15803d',
    glow: 'rgba(34,197,94,0.35)',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '7-day hassle-free',
    gradFrom: '#ffedd5',
    gradTo: '#fff7ed',
    iconColor: '#c2410c',
    glow: 'rgba(249,115,22,0.35)',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Always here to help',
    gradFrom: '#f3e8ff',
    gradTo: '#fdf4ff',
    iconColor: '#7e22ce',
    glow: 'rgba(168,85,247,0.35)',
  },
  {
    icon: Clock,
    title: 'Same-Day Delivery',
    description: 'Available in select cities',
    gradFrom: '#fef3c7',
    gradTo: '#fffbeb',
    iconColor: '#b45309',
    glow: 'rgba(245,158,11,0.35)',
  },
  {
    icon: CreditCard,
    title: 'Flexible Plans',
    description: '3–12 months rental',
    gradFrom: '#ccfbf1',
    gradTo: '#f0fdfa',
    iconColor: '#0f766e',
    glow: 'rgba(20,184,166,0.35)',
  },
]

export function ServiceStrip() {
  return (
    <>
      <style>{`
        .ss-strip {
          width: 100%;
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
          border-top: 1px solid #eef1f6;
          border-bottom: 1px solid #eef1f6;
        }

        /* Thin gradient hairline signature at the very top of the strip */
        .ss-strip::before {
          content: '';
          position: absolute;
          top: -1px; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #22c55e, #f97316, #a855f7, #f59e0b, #14b8a6);
          opacity: 0.9;
        }

        .ss-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 8px 12px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
        
        @media (min-width: 480px) { 
          .ss-inner { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 8px; 
            padding: 8px 16px;
          } 
        }
        
        @media (min-width: 640px) { 
          .ss-inner { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 10px; 
            padding: 10px 20px;
          } 
        }
        
        @media (min-width: 1024px) { 
          .ss-inner { 
            grid-template-columns: repeat(6, 1fr); 
            gap: 12px; 
            padding: 12px 24px;
          } 
        }

        .ss-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 10px;
          position: relative;
          border-radius: 12px;
          border: 1px solid transparent;
          transition: transform 0.22s cubic-bezier(.4,0,.2,1), border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
          cursor: default;
          background: transparent;
          min-height: 60px;
        }

        /* Mobile: stack vertically for very small screens */
        @media (max-width: 400px) {
          .ss-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 6px;
            padding: 10px 8px;
            min-height: 80px;
          }
          .ss-icon-wrap {
            width: 36px;
            height: 36px;
          }
          .ss-icon {
            width: 16px;
            height: 16px;
          }
          .ss-title {
            font-size: 10px;
            white-space: normal;
            line-height: 1.2;
          }
          .ss-desc {
            font-size: 9px;
            white-space: normal;
            line-height: 1.2;
          }
          .ss-text {
            text-align: center;
            width: 100%;
          }
        }

        .ss-item:hover,
        .ss-item:focus-within {
          transform: translateY(-2px);
          background: #ffffff;
          border-color: #eef1f6;
          box-shadow: 0 10px 24px -12px var(--ss-glow), 0 2px 6px -2px rgba(15, 23, 42, 0.06);
        }

        /* Icon wrapper — soft gradient badge with ring */
        .ss-icon-wrap {
          width: 40px; 
          height: 40px;
          border-radius: 10px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          flex-shrink: 0;
          background: linear-gradient(145deg, var(--ss-grad-from), var(--ss-grad-to));
          box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
          transition: transform 0.28s cubic-bezier(.4,0,.2,1), box-shadow 0.28s ease;
        }
        
        @media (min-width: 640px) {
          .ss-icon-wrap {
            width: 42px;
            height: 42px;
            border-radius: 12px;
          }
        }
        
        .ss-item:hover .ss-icon-wrap {
          transform: scale(1.08) rotate(-4deg);
          box-shadow: 0 6px 14px -4px var(--ss-glow), inset 0 0 0 1px rgba(15, 23, 42, 0.04);
        }

        .ss-icon {
          width: 18px; 
          height: 18px;
          stroke-width: 2.25;
          color: var(--ss-icon-color);
          flex-shrink: 0;
        }
        
        @media (min-width: 640px) {
          .ss-icon {
            width: 19px;
            height: 19px;
          }
        }

        /* Text */
        .ss-text { 
          min-width: 0; 
          flex: 1;
        }
        
        .ss-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.1px;
          line-height: 1.3;
          margin-bottom: 1px;
        }
        
        @media (min-width: 640px) {
          .ss-title {
            font-size: 12.5px;
          }
        }
        
        .ss-desc {
          font-size: 10.5px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
          font-weight: 500;
        }
        
        @media (min-width: 640px) {
          .ss-desc {
            font-size: 11.5px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ss-item, .ss-icon-wrap { transition: none; }
          .ss-item:hover { transform: none; }
          .ss-item:hover .ss-icon-wrap { transform: none; }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .ss-strip { background: linear-gradient(180deg, #0b1220 0%, #0f172a 100%); border-color: #1e293b; }
          .ss-item:hover, .ss-item:focus-within { background: #131c2e; border-color: #1e293b; }
          .ss-icon-wrap { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
          .ss-title { color: #f1f5f9; }
          .ss-desc  { color: #64748b; }
        }
      `}</style>

      <div className="ss-strip" role="list" aria-label="Our services">
        <div className="ss-inner">
          {services.map((svc, idx) => {
            const Icon = svc.icon
            return (
              <div
                key={svc.title}
                className="ss-item"
                tabIndex={0}
                style={{
                  '--ss-grad-from': svc.gradFrom,
                  '--ss-grad-to': svc.gradTo,
                  '--ss-icon-color': svc.iconColor,
                  '--ss-glow': svc.glow,
                } as React.CSSProperties}
                role="listitem"
              >
                <div className="ss-icon-wrap" aria-hidden="true">
                  <Icon className="ss-icon" />
                </div>
                <div className="ss-text">
                  <p className="ss-title">{svc.title}</p>
                  <p className="ss-desc">{svc.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}