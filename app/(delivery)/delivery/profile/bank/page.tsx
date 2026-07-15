// app/(delivery)/delivery/profile/bank/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Section } from '@/components/delivery/profile/Section';
import { SaveBar } from '@/components/delivery/profile/SaveBar';
import { useToast } from '@/hooks/useToast';
import {
  CreditCard, IndianRupee, Eye, EyeOff, Copy, Check,
  Building2, Shield, Clock, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BankPage() {
  const { profile, updateProfile, stats } = useDeliveryPartner();
  const toast = useToast();

  const [holder, setHolder] = useState('');
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [upi, setUpi] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [saved, setSaved] = useState({ holder: '', account: '', ifsc: '', bankName: '', upi: '' });

  useEffect(() => {
    if (!profile) return;
    const snap = {
      holder: profile.bankDetails.accountHolderName,
      account: profile.bankDetails.accountNumber,
      ifsc: profile.bankDetails.ifscCode,
      bankName: profile.bankDetails.bankName,
      upi: profile.bankDetails.upiId ?? '',
    };
    setHolder(snap.holder); setAccount(snap.account); setIfsc(snap.ifsc);
    setBankName(snap.bankName); setUpi(snap.upi); setSaved(snap);
  }, [profile]);

  const dirty = holder !== saved.holder || account !== saved.account ||
    ifsc !== saved.ifsc || bankName !== saved.bankName || upi !== saved.upi;

  const copy = (key: string, v: string) => {
    navigator.clipboard.writeText(v);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const onSave = async () => {
    if (!holder || !account || !ifsc || !bankName) {
      toast.warning('Please fill all required fields');
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) {
      toast.warning('Invalid IFSC code format');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        bankDetails: {
          accountHolderName: holder,
          accountNumber: account,
          ifscCode: ifsc.toUpperCase(),
          bankName,
          upiId: upi || undefined,
        },
      });
      setSaved({ holder, account, ifsc: ifsc.toUpperCase(), bankName, upi });
      toast.success('Bank details saved ✓');
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => {
    setHolder(saved.holder); setAccount(saved.account); setIfsc(saved.ifsc);
    setBankName(saved.bankName); setUpi(saved.upi);
  };

  if (!profile) return null;

  const masked = account ? `••••••${account.slice(-4)}` : '';

  return (
    <div className="space-y-6">
      {/* Hero earnings card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 text-white shadow-lg shadow-gray-900/10">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            This week's earnings
          </div>
          <div className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight tabular-nums">
            ₹{stats?.thisWeekEarnings?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            Next payout: Tuesday, 6 PM IST
          </div>
        </div>
      </div>

      {/* Bank form */}
      <Section title="Bank account" description="Where we send your payouts" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Account holder *</label>
            <input value={holder} onChange={(e) => setHolder(e.target.value)} className="input" placeholder="As on bank records" />
          </div>
          <div>
            <label className="label">Bank name *</label>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="input" placeholder="HDFC Bank" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Account number *</label>
            <div className="relative">
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value.replace(/\D/g, ''))}
                type={show ? 'text' : 'password'}
                className="input pr-12 font-mono"
                placeholder="9–18 digit account number"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">IFSC code *</label>
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              className="input font-mono"
              placeholder="HDFC0001234"
              maxLength={11}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: XXXX0XXXXXX</p>
          </div>
          <div>
            <label className="label">UPI ID (optional)</label>
            <input value={upi} onChange={(e) => setUpi(e.target.value)} className="input" placeholder="name@bank" />
          </div>
        </div>
      </Section>

      {/* Payout schedule */}
      <Section title="Payout schedule" icon={CreditCard}>
        <div className="space-y-3">
          {[
            { day: 'Tuesday', time: '6:00 PM IST', primary: true },
            { day: 'Friday', time: '6:00 PM IST', primary: true },
            { day: 'On-demand', time: 'Instant (charges apply)', primary: false },
          ].map((p) => (
            <div key={p.day} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.day}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{p.time}</div>
                </div>
              </div>
              {p.primary && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <p>UPI transfers are instant; bank transfers may take 1–2 business days.</p>
            <p>Minimum payout threshold: ₹100</p>
          </div>
        </div>
      </Section>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={onDiscard} saveLabel="Save bank details" />

      <style jsx>{`
        .label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgb(55 65 81); margin-bottom: 6px; }
        :global(.dark) .label { color: rgb(209 213 219); }
        .input { height: 44px; width: 100%; padding: 0 14px; border-radius: 12px; border: 1px solid rgb(229 231 235); background: rgb(249 250 251); color: rgb(17 24 39); font-size: 14px; outline: none; }
        :global(.dark) .input { border-color: rgb(39 39 42); background: rgb(24 24 27 / 0.5); color: white; }
        .input:focus { border-color: rgb(251 146 60); box-shadow: 0 0 0 3px rgb(251 146 60 / 0.15); background: white; }
        :global(.dark) .input:focus { background: rgb(24 24 27); }
      `}</style>
    </div>
  );
}
