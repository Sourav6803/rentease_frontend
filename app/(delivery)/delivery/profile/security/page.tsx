// app/(delivery)/delivery/profile/security/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Section } from '@/components/delivery/profile/Section';
import { useToast } from '@/hooks/useToast';
import { deliveryApi } from '@/lib/api/delivery';
import { Shield, KeyRound, Smartphone, LifeBuoy, Loader2, Mail } from 'lucide-react';

export default function SecurityPage() {
  const { profile } = useDeliveryPartner();
  const toast = useToast();
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const sendReset = async () => {
    if (!profile) return;
    setSending(true);
    try {
      await deliveryApi.forgotPassword(profile.user.email);
      toast.success(`Password reset link sent to ${profile.user.email}`);
    } catch {
      toast.info('If that email exists, a reset link is on its way.');
    } finally {
      setSending(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Section title="Password" description="Manage how you sign in" icon={KeyRound}>
        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
            <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Email</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{profile.user.email}</div>
          </div>
        </div>

        <button
          onClick={sendReset}
          disabled={sending}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold shadow-sm shadow-orange-500/30 disabled:opacity-60 transition-all"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          Send password reset link
        </button>
      </Section>

      <Section title="Two-factor authentication" icon={Smartphone}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Extra account security</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Require a one-time code on unrecognized devices.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            Coming soon
          </span>
        </div>
      </Section>

      <Section title="Need help?" icon={LifeBuoy}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Partner support</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              24/7 dedicated helpline for delivery partners.
            </p>
          </div>
          <button
            onClick={() => router.push('/delivery/support')}
            className="shrink-0 px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 text-sm font-bold hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
          >
            Get help
          </button>
        </div>
      </Section>
    </div>
  );
}
