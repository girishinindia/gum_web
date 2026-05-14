'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  title:     ReactNode;
  subtitle?: ReactNode;
  /** Fallback URL when there's no history to go back to. Defaults to /m. */
  fallback?: string;
  /**
   * Right-side action slot. Pass a fully-rendered button/link (with its own
   * Lucide icon) — we can't accept a `LucideIcon` component reference here
   * because this is a Client Component and function refs aren't serialisable
   * across the server/client boundary.
   */
  action?:   ReactNode;
}

/**
 * Detail-page header — back arrow + title + optional action slot.
 * Sits inside the page body, below the persistent <MobileTopBar>.
 */
export function MobilePageHeader({ title, subtitle, fallback = '/m', action }: Props) {
  const router = useRouter();
  function back() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
      <button
        type="button"
        onClick={back}
        aria-label="Back"
        className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="heading text-base font-bold text-slate-900 leading-tight truncate">{title}</div>
        {subtitle && <div className="text-[11.5px] text-slate-500 truncate">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Convenience pill that matches the visual of the original `action.Icon`
 * button. Use as the `action` prop value in pages that need a simple
 * non-interactive (or anchor) action chip.
 */
export function HeaderActionButton({ children, href, onClick, label }: { children: ReactNode; href?: string; onClick?: () => void; label: string }) {
  const cls = 'h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all';
  if (href) {
    return <a href={href} aria-label={label} className={cls}>{children}</a>;
  }
  return <button type="button" onClick={onClick} aria-label={label} className={cls}>{children}</button>;
}
