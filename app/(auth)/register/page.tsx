import { RegisterForm } from '@/components/forms/RegisterForm'

export default function RegisterPage() {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your RentEase account
        </h1>
        <p className="text-muted-foreground">
          Rent furniture and appliances on monthly plans. Get verified access and
          seamless checkout—built for a smooth experience.
        </p>

        <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
          <h2 className="text-sm font-medium">Why RentEase?</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2">
              <span aria-hidden>🛡️</span> Secure login & protected sessions
            </li>
            <li className="flex gap-2">
              <span aria-hidden>📦</span> Track rentals and returns easily
            </li>
            <li className="flex gap-2">
              <span aria-hidden>💳</span> Payment history and receipts
            </li>
          </ul>
        </div>
      </div>

      <div>
        <RegisterForm />
      </div>
    </section>
  )
}

