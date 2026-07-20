// import { RegisterForm } from '@/components/forms/RegisterForm'

// export default function RegisterPage() {
//   return (
//     <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
//       <div className="space-y-4">
//         <h1 className="text-3xl font-semibold tracking-tight">
//           Create your RentEase account
//         </h1>
//         <p className="text-muted-foreground">
//           Rent furniture and appliances on monthly plans. Get verified access and
//           seamless checkout—built for a smooth experience.
//         </p>

//         <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
//           <h2 className="text-sm font-medium">Why RentEase?</h2>
//           <ul className="mt-3 space-y-2 text-sm">
//             <li className="flex gap-2">
//               <span aria-hidden>🛡️</span> Secure login & protected sessions
//             </li>
//             <li className="flex gap-2">
//               <span aria-hidden>📦</span> Track rentals and returns easily
//             </li>
//             <li className="flex gap-2">
//               <span aria-hidden>💳</span> Payment history and receipts
//             </li>
//           </ul>
//         </div>
//       </div>

//       <div>
//         <RegisterForm />
//       </div>
//     </section>
//   )
// }



import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, ShieldCheck, Sofa, Star, Truck } from 'lucide-react'

import { RegisterForm } from '@/components/forms/RegisterForm'

const benefits = [
  { Icon: ShieldCheck, title: 'Protected by design', description: 'Secure sessions and transparent account controls.' },
  { Icon: BadgeCheck, title: 'Flexible monthly plans', description: 'Choose furniture and appliances that fit your stay.' },
  { Icon: Truck, title: 'Doorstep delivery', description: 'Free delivery, installation, and easy pickup on returns.' },
]

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background photo — replace /public/images/auth/register-hero.jpg with a real interior shot */}
      <Image
        src="/images/auth/register-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-90"
      />
      {/* Legibility + brand-color wash over the photo */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,.35),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(37,99,235,.25),transparent_40%)]"
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_26rem] lg:gap-16 lg:px-8">
        {/* Left: brand story over the photo */}
        <section className="mx-auto w-full max-w-xl lg:mx-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg font-bold tracking-tight text-white outline-none ring-offset-4 transition hover:text-blue-200 focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40"
            >
              <Sofa className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-xl">RentEase</span>
          </Link>

          <div className="mt-12">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-white">Rated 4.6 by 10,000+ renters</span>
            </div>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Create an account and settle in with ease.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200">
              Discover quality furniture and appliances on flexible monthly plans — without the
              stress of buying, moving, or reselling.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1" aria-label="RentEase benefits">
            {benefits.map(({ Icon, title, description }) => (
              <li
                key={title}
                className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-md"
              >
                <span
                  aria-hidden
                  className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-blue-100"
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <span>
                  <strong className="block text-sm text-white">{title}</strong>
                  <span className="mt-0.5 block text-sm leading-5 text-slate-300">{description}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-slate-300">
            Already a member?{' '}
            <Link
              href="/login"
              className="font-semibold text-white underline decoration-blue-300 underline-offset-4 transition hover:text-blue-200"
            >
              Sign in to your account
            </Link>
          </p>
        </section>

        {/* Right: signup card */}
        <section className="mx-auto w-full max-w-md lg:mx-0">
          <RegisterForm />
        </section>
      </div>
    </main>
  )
}