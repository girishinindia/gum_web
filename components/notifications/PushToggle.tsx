'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { pushSupported, pushPermission, isPushSubscribed, enablePush, disablePush } from '@/lib/push';

/** Browser web-push opt-in switch. Self-contained; safe on any page. */
export function PushToggle({ className }: { className?: string }) {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setSupported(pushSupported());
    isPushSubscribed().then(setSubscribed).catch(() => {});
  }, []);

  async function toggle() {
    setBusy(true);
    setMsg(null);
    if (subscribed) {
      await disablePush();
      setSubscribed(false);
      setMsg('Browser push disabled.');
    } else {
      const r = await enablePush();
      if (r === 'subscribed') { setSubscribed(true); setMsg('Browser push enabled on this device.'); }
      else if (r === 'denied') setMsg('Permission is blocked — enable notifications in your browser settings.');
      else if (r === 'unsupported') setMsg('This browser does not support push.');
      else if (r.startsWith('error:')) setMsg(r.slice(6)); // BUG-05 fix: show the real reason
      else setMsg('Could not enable push. Please try again.');
    }
    setBusy(false);
  }

  if (!supported) {
    return <div className="text-[12px] text-slate-500">Push notifications aren&apos;t supported on this browser.</div>;
  }

  const blocked = pushPermission() === 'denied';

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn('h-9 w-9 rounded-md flex items-center justify-center shrink-0', subscribed ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500')}>
          {subscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Browser push notifications</div>
          <div className="text-[12px] text-slate-500 leading-snug">
            {msg ?? (subscribed ? 'On — alerts arrive even when the tab is closed.' : 'Get alerts even when this tab is closed.')}
          </div>
          {blocked && !subscribed && (
            <div className="text-[11px] text-amber-600 mt-0.5">Notifications are blocked in your browser settings.</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy || (blocked && !subscribed)}
        aria-pressed={subscribed}
        className={cn('relative w-12 h-7 rounded-full transition-colors shrink-0', subscribed ? 'bg-brand-500' : 'bg-slate-300', (busy || (blocked && !subscribed)) && 'opacity-60')}
      >
        <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all flex items-center justify-center', subscribed ? 'left-6' : 'left-1')}>
          {busy && <Loader2 className="h-3 w-3 animate-spin text-slate-500" />}
        </span>
      </button>
    </div>
  );
}
