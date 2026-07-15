'use client';

/**
 * frontend/components/delivery/settings/ChangePasswordDialog.tsx
 *
 * Self-contained "Change password" row + dialog for the Security section.
 * Rendered with no props as the first child inside the Security
 * <SettingsSection>, so it matches the visual rhythm of <SettingsRow />
 * (icon circle · label · chevron) and supplies its own trigger + dialog.
 *
 * POST /api/v1/settings/change-password
 *   { currentPassword, newPassword }  →  newPassword min 8 chars
 *   401 on wrong current password
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, ChevronRight, Loader2, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { settingsApi } from '@/lib/api/setting';

/* ------------------------------------------------------------------------ */
/*                            Password strength meter                       */
/* ------------------------------------------------------------------------ */

type Strength = 'empty' | 'weak' | 'fair' | 'strong';

function getStrength(password: string): Strength {
  if (!password) return 'empty';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
}

const STRENGTH_STYLES: Record<Strength, { label: string; bars: number; className: string }> = {
  empty: { label: '', bars: 0, className: '' },
  weak: { label: 'Weak', bars: 1, className: 'bg-red-500' },
  fair: { label: 'Fair', bars: 2, className: 'bg-amber-500' },
  strong: { label: 'Strong', bars: 3, className: 'bg-emerald-500' },
};

function StrengthMeter({ password }: { password: string }) {
  const strength = getStrength(password);
  if (strength === 'empty') return null;
  const { label, bars, className } = STRENGTH_STYLES[strength];
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i < bars ? className : 'bg-stone-200 dark:bg-stone-700'}`}
          />
        ))}
      </div>
      <span
        className={`text-[11px] font-medium ${
          strength === 'weak'
            ? 'text-red-500'
            : strength === 'fair'
            ? 'text-amber-500'
            : 'text-emerald-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                            Password field w/ toggle                      */
/* ------------------------------------------------------------------------ */

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Label htmlFor={id} className="text-xs text-stone-500 dark:text-stone-400">
        {label}
      </Label>
      <div className="relative mt-1">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="rounded-xl pr-9"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                                Main component                            */
/* ------------------------------------------------------------------------ */

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lengthOk = newPassword.length >= 8;
  const matchOk = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && lengthOk && matchOk && !saving;

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!lengthOk) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (!matchOk) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    try {
      await settingsApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      handleOpenChange(false);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Current password is incorrect.');
        toast.error('Current password is incorrect');
      } else {
        const message = err?.response?.data?.message ?? "Couldn't change password — try again";
        setError(message);
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger row — matches <SettingsRow /> visual rhythm */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 px-1 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white">
            <KeyRound className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">Change password</span>
            <span className="block text-xs text-stone-400 dark:text-stone-500">Update your account password</span>
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-stone-300 dark:text-stone-600" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Choose a new password with at least 8 characters.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <PasswordField
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <div>
              <PasswordField
                id="new-password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <StrengthMeter password={newPassword} />
            </div>
            <div>
              <PasswordField
                id="confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && (
                <p
                  className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${
                    matchOk ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {matchOk ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {matchOk ? 'Passwords match' : "Passwords don't match"}
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
            >
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Change password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}