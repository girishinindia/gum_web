'use client';

import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCheck, X, Loader2, Inbox, LogIn } from 'lucide-react';
import { cn } from '@/lib/cn';
import { hasSession } from '@/lib/auth/session';
import {
  fetchMyNotifications, markNotificationRead, markAllNotificationsRead, dismissNotification,
  notificationVisual, notificationTime, type AppNotification,
} from '@/lib/notifications';
import { NotificationPreferencesPanel } from './NotificationPreferencesPanel';

type Tab = 'all' | 'unread' | 'payments' | 'learning' | 'settings';
const TABS: { key: Tab; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'unread',   label: 'Unread' },
  { key: 'payments', label: 'Payments' },
  { key: 'learning', label: 'Learning' },
  { key: 'settings', label: 'Settings' },
];

function inTab(type: string, tab: Tab): boolean {
  const t = (type || '').toLowerCase();
  if (tab === 'payments') return /payment|refund|payout|earning|order/.test(t);
  if (tab === 'learning') return /enroll|course|certificate|live|webinar|session|reminder|assignment|quiz/.test(t);
  return true;
}

/** Best-effort click target for a notification, based on its reference. */
function hrefFor(n: AppNotification): string | null {
  // BUG-24 fix (June 2026): the admin-set action_url is the PRIMARY target —
  // it was ignored entirely before.
  const action = (n as { action_url?: string | null }).action_url;
  if (action) return action;
  if (n.reference_type === 'order') return '/payments';
  if (n.reference_type === 'payout_request') return '/wallet';
  if (n.reference_type === 'idea') return '/my-ideas';
  const url = (n.metadata && typeof n.metadata === 'object' && (n.metadata as Record<string, unknown>).url) as string | undefined;
  return url || null;
}

export function NotificationsInbox({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => setLoggedIn(hasSession()), []);

  const load = useCallback(async (p: number, replace: boolean) => {
    setLoading(true);
    const res = await fetchMyNotifications({ page: p, limit: 20, unreadOnly: tab === 'unread' });
    setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
    setPage(res.page);
    setTotalPages(res.totalPages || 1);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    if (loggedIn && tab !== 'settings') load(1, true);
  }, [loggedIn, tab, load]);

  const visible = items.filter((n) => inTab(n.notification_type, tab));

  async function onOpen(n: AppNotification) {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      markNotificationRead(n.id);
    }
    const href = hrefFor(n);
    if (href) {
      // External action URLs open in a new tab; internal paths navigate in-app (BUG-24)
      if (/^https?:\/\//i.test(href)) window.open(href, '_blank', 'noopener');
      else router.push(href);
    }
  }

  async function onMarkAll() {
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    await markAllNotificationsRead();
  }

  async function onDismiss(e: MouseEvent, n: AppNotification) {
    e.preventDefault();
    e.stopPropagation();
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    await dismissNotification(n.id);
  }

  // ── Logged-out gate ──
  if (loggedIn === false) {
    return (
      <div className="rounded-md bg-white border border-slate-200 shadow-card p-10 text-center">
        <Inbox className="h-9 w-9 text-slate-300 mx-auto" />
        <div className="mt-3 text-sm text-slate-600">Sign in to see your notifications.</div>
        <Link href="/login" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-600">
          <LogIn className="h-4 w-4" /> Sign in
        </Link>
      </div>
    );
  }

  const cardItem = variant === 'mobile';

  return (
    <div>
      {/* Toolbar: tabs + mark-all */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'shrink-0 px-3.5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t.key ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-brand-700',
            )}
          >
            {t.label}
          </button>
        ))}
        {tab !== 'settings' && (
          <button onClick={onMarkAll} className="ml-auto shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline pr-1">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {tab === 'settings' ? (
        <div className="mt-4"><NotificationPreferencesPanel /></div>
      ) : loading && items.length === 0 ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : visible.length === 0 ? (
        <div className="rounded-md bg-white border border-slate-200 shadow-card p-10 text-center mt-4">
          <Inbox className="h-9 w-9 text-slate-300 mx-auto" />
          <div className="mt-3 text-sm text-slate-600">You&apos;re all caught up.</div>
        </div>
      ) : (
        <>
          <ul className={cn('mt-4', cardItem ? 'space-y-2' : 'rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100')}>
            {visible.map((n) => {
              const { Icon, accent } = notificationVisual(n.notification_type);
              return (
                <li
                  key={n.id}
                  onClick={() => onOpen(n)}
                  className={cn(
                    'group flex items-start gap-3 p-4 cursor-pointer transition-colors',
                    cardItem && 'rounded-md bg-white border border-slate-200 shadow-card',
                    !n.is_read && (cardItem ? 'border-brand-200 bg-brand-50/30' : 'bg-brand-50/20'),
                    !cardItem && 'hover:bg-slate-50/70',
                  )}
                >
                  <div className={cn('h-9 w-9 rounded-md flex items-center justify-center shrink-0', accent)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-sm text-slate-900 leading-snug', !n.is_read && 'font-semibold')}>{n.title}</div>
                    {n.message && <div className="text-[12.5px] text-slate-600 leading-snug mt-0.5">{n.message}</div>}
                    <div className="text-[11px] text-slate-400 mt-1">{notificationTime(n.created_at)}</div>
                  </div>
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-brand-500 mt-2 shrink-0" />}
                  <button
                    onClick={(e) => onDismiss(e, n)}
                    aria-label="Dismiss"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>

          {tab !== 'unread' && page < totalPages && (
            <div className="mt-4 text-center">
              <button
                onClick={() => load(page + 1, false)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
