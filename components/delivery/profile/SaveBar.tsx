// components/delivery/profile/SaveBar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  saveLabel = 'Save changes',
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel?: string;
}) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 lg:left-[calc(18rem+1rem)] z-30"
        >
          <div className="mx-auto max-w-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg shadow-gray-900/10 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-medium">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDiscard}
                disabled={saving}
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Discard
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className={cn(
                  'px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/30 transition-all flex items-center gap-1.5',
                  saving && 'opacity-70'
                )}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saveLabel}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
