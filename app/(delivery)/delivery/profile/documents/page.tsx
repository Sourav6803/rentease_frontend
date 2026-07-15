// app/(delivery)/delivery/profile/documents/page.tsx
'use client';

import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Section } from '@/components/delivery/profile/Section';
import { ProgressRing } from '@/components/delivery/profile/ProgressRing';
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Upload, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DOC_LABELS: Record<string, string> = {
  license: "Driver's License",
  aadhar: 'Aadhaar Card',
  pan: 'PAN Card',
  vehicle_rc: 'Vehicle RC',
  insurance: 'Vehicle Insurance',
  photo: 'Photo ID',
};

const DOC_DESCRIPTIONS: Record<string, string> = {
  license: 'Required for operating a motor vehicle',
  aadhar: 'Government-issued identity verification',
  pan: 'For tax and payment processing',
  vehicle_rc: 'Registration certificate of your vehicle',
  insurance: 'Active vehicle insurance policy',
  photo: 'Recent passport-style photograph',
};

export default function DocumentsPage() {
  const { profile } = useDeliveryPartner();
  if (!profile) return null;

  const total = profile.documents.length;
  const verified = profile.documents.filter((d) => d.verified).length;
  const pct = total ? (verified / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Verification status */}
      <Section
        title="Verification status"
        description="KYC documents reviewed by compliance"
        icon={Shield}
      >
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ProgressRing value={verified} max={total} />
          <div className="flex-1 space-y-3 w-full">
            <DocStat icon={CheckCircle2} color="emerald" label="Verified" value={verified} />
            <DocStat icon={Clock} color="amber" label="Pending review" value={total - verified} />
            <DocStat icon={AlertTriangle} color="rose" label="Action needed" value={0} />
          </div>
        </div>

        {verified === total ? (
          <div className="mt-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              All documents verified — you're ready to accept all delivery types.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-200">
              <p className="font-medium">{total - verified} document(s) pending verification</p>
              <p className="text-xs mt-0.5 text-amber-800/80 dark:text-amber-300/80">
                Reviews typically complete within 24–48 hours.
              </p>
            </div>
          </div>
        )}
      </Section>

      {/* Document list */}
      <Section title="Submitted documents" icon={FileText}>
        <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-6 -mb-5">
          {profile.documents.map((doc, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  doc.verified
                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                    : 'bg-amber-50 dark:bg-amber-950/30'
                )}
              >
                <FileText
                  className={cn(
                    'w-5 h-5',
                    doc.verified
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                  {DOC_LABELS[doc.type] ?? doc.type}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {DOC_DESCRIPTIONS[doc.type]}
                </div>
                {doc.number && (
                  <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-0.5">
                    {doc.number}
                  </div>
                )}
              </div>
              {doc.expiryDate && (
                <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                  Exp {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                </div>
              )}
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0',
                  doc.verified
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                )}
              >
                {doc.verified ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {doc.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Upload helper */}
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center mb-3">
          <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">Need to upload a document?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Document uploads are handled via the RentEase Partner mobile app.
        </p>
      </div>
    </div>
  );
}

function DocStat({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ElementType;
  color: 'emerald' | 'amber' | 'rose';
  label: string;
  value: number;
}) {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
      <div className="text-base font-bold tabular-nums text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
