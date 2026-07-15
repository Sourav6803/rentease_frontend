// components/delivery/profile/Section.tsx
'use client';

import { cn } from '@/lib/utils';

export function Section({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm shadow-gray-900/[0.02]',
        className
      )}
    >
      <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}
