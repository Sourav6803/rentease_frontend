'use client'

/**
 * app/(admin)/admin/payments/gateway/page.tsx
 *
 * The "Payment Gateway" item in the admin Payments nav group points here.
 *
 * A complete, working gateway/commission/payout/refund settings screen already
 * exists at `app/(admin)/admin/settings/payments-gateway/page.tsx` (1130 lines,
 * wired to GET/PUT /api/v1/admin/settings/payments*). Rather than duplicate that
 * much logic — which would immediately drift out of sync, since both routes would
 * then have to be fixed twice for every change — this route renders the same
 * component. One implementation, two entry points.
 *
 * If the settings screen is ever moved, this file is the only place that needs
 * updating.
 */
import PaymentGatewaySettingsPage from '@/app/(admin)/admin/settings/payments-gateway/page'

export default function AdminPaymentsGatewayRoute() {
  return <PaymentGatewaySettingsPage />
}
