// app/(delivery)/delivery/profile/vehicle/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Section } from '@/components/delivery/profile/Section';
import { SaveBar } from '@/components/delivery/profile/SaveBar';
import { useToast } from '@/hooks/useToast';
import { deliveryApi, type VehicleType, type ZoneType } from '@/lib/api/delivery';
import { Truck, MapPin, Package, Shield, Info } from 'lucide-react';

const VEHICLES: VehicleType[] = ['bike', 'scooter', 'car', 'van', 'truck', 'mini-truck'];
const ZONES: ZoneType[] = ['north', 'south', 'east', 'west', 'central', 'all'];

export default function VehiclePage() {
  const { profile, updateProfile } = useDeliveryPartner();
  const toast = useToast();

  const [vType, setVType] = useState<VehicleType>('bike');
  const [vNumber, setVNumber] = useState('');
  const [vModel, setVModel] = useState('');
  const [zone, setZone] = useState<ZoneType>('north');
  const [maxConcurrent, setMaxConcurrent] = useState('5');
  const [saving, setSaving] = useState(false);

  // Snapshot of last saved values for dirty detection
  const [saved, setSaved] = useState({
    vType: 'bike', vNumber: '', vModel: '', zone: 'north' as ZoneType, maxConcurrent: '5',
  });

  useEffect(() => {
    if (!profile) return;
    const snap = {
      vType: profile.vehicle.type,
      vNumber: profile.vehicle.number,
      vModel: profile.vehicle.model ?? '',
      zone: profile.zone,
      maxConcurrent: String(profile.maxConcurrentDeliveries),
    };
    setVType(snap.vType);
    setVNumber(snap.vNumber);
    setVModel(snap.vModel);
    setZone(snap.zone);
    setMaxConcurrent(snap.maxConcurrent);
    setSaved(snap);
  }, [profile]);

  const dirty =
    vType !== saved.vType ||
    vNumber !== saved.vNumber ||
    vModel !== saved.vModel ||
    zone !== saved.zone ||
    maxConcurrent !== saved.maxConcurrent;

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        vehicle: { type: vType, number: vNumber, model: vModel },
        zone,
        maxConcurrentDeliveries: Number(maxConcurrent),
      });
      setSaved({ vType, vNumber, vModel, zone, maxConcurrent });
      toast.success('Vehicle & zone saved ✓');
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => {
    setVType(saved.vType);
    setVNumber(saved.vNumber);
    setVModel(saved.vModel);
    setZone(saved.zone);
    setMaxConcurrent(saved.maxConcurrent);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Section
        title="Vehicle"
        description="The vehicle you use for deliveries"
        icon={Truck}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Type">
            <select
              value={vType}
              onChange={(e) => setVType(e.target.value as VehicleType)}
              className="select"
            >
              {VEHICLES.map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Number plate" hint="e.g. MH 12 AB 1234">
            <input
              value={vNumber}
              onChange={(e) => setVNumber(e.target.value.toUpperCase())}
              className="input"
              placeholder="MH 12 AB 1234"
            />
          </Field>
          <Field label="Model (optional)">
            <input
              value={vModel}
              onChange={(e) => setVModel(e.target.value)}
              className="input"
              placeholder="Honda Activa 6G"
            />
          </Field>
        </div>
      </Section>

      <Section title="Service Zone" description="Where you accept deliveries" icon={MapPin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as ZoneType)}
              className="select"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z.charAt(0).toUpperCase() + z.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Max concurrent deliveries" hint="Cap on parallel jobs you'll receive">
            <input
              type="number"
              min={1}
              max={20}
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </Section>

      {/* Trust & safety info card */}
      <div className="rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-sm text-blue-900 dark:text-blue-200 space-y-1">
          <p className="font-semibold">Trust & safety</p>
          <ul className="text-xs space-y-0.5 text-blue-800/80 dark:text-blue-300/80">
            <li>• OTP verification on every delivery protects both you and the customer.</li>
            <li>• Customer rating system ensures transparent feedback.</li>
            <li>• Photo proof at delivery creates accountability for all parties.</li>
          </ul>
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={onDiscard} saveLabel="Save vehicle" />

      <style jsx>{`
        .input, .select {
          height: 44px;
          width: 100%;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgb(229 231 235);
          background: rgb(249 250 251);
          color: rgb(17 24 39);
          font-size: 14px;
          outline: none;
          transition: all 150ms ease;
        }
        :global(.dark) .input, :global(.dark) .select {
          border-color: rgb(39 39 42);
          background: rgb(24 24 27 / 0.5);
          color: white;
        }
        .input:focus, .select:focus {
          border-color: rgb(251 146 60);
          box-shadow: 0 0 0 3px rgb(251 146 60 / 0.15);
          background: white;
        }
        :global(.dark) .input:focus, :global(.dark) .select:focus {
          background: rgb(24 24 27);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}
