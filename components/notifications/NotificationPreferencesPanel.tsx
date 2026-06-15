'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { fetchMyPreferences, updateMyPreference, type NotificationPreference } from '@/lib/notifications';
import { PushToggle } from './PushToggle';

/** The notification types we surface as user-tunable. (Defaults are all-on.) */
const PREF_TYPES: { type: string; label: string }[] = [
  { type: 'enrollment_confirmed', label: 'Enrollment confirmations' },
  { type: 'payment_received',     label: 'Payment receipts' },
  { type: 'refund_processed',     label: 'Refund updates' },
  { type: 'course_reminder',      label: 'Class & assignment reminders' },
  { type: 'instructor_earning',   label: 'Instructor earnings' },
  { type: 'payout_completed',     label: 'Payout updates' },
];

type ChannelKey = 'in_app_enabled' | 'email_enabled' | 'push_enabled' | 'sms_enabled';
const CHANNELS: { key: ChannelKey; label: string }[] = [
  { key: 'in_app_enabled', label: 'In-app' },
  { key: 'email_enabled',  label: 'Email' },
  { key: 'push_enabled',   label: 'Push' },
  { key: 'sms_enabled',    label: 'SMS' },
];

type PrefMap = Record<string, NotificationPreference>;

function defaults(type: string): NotificationPreference {
  return { notification_type: type, email_enabled: true, sms_enabled: false, in_app_enabled: true, push_enabled: true };
}

export function NotificationPreferencesPanel() {
  const [prefs, setPrefs] = useState<PrefMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPreferences().then((rows) => {
      const map: PrefMap = {};
      for (const r of rows) map[r.notification_type] = r;
      setPrefs(map);
      setLoading(false);
    });
  }, []);

  function isOn(type: string, key: ChannelKey): boolean {
    const row = prefs[type] ?? defaults(type);
    return (row[key] as boolean) !== false;
  }

  async function toggle(type: string, key: ChannelKey) {
    const cur = prefs[type] ?? defaults(type);
    const value = !((cur[key] as boolean) !== false);
    const next = { ...cur, [key]: value };
    setPrefs((p) => ({ ...p, [type]: next }));
    await updateMyPreference({ notification_type: type, [key]: value });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-white border border-slate-200 shadow-card p-4">
        <PushToggle />
      </div>

      <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-900">Choose what reaches you</div>

        <div className="flex items-center justify-end gap-2 px-4 py-2 text-[10.5px] uppercase tracking-wide text-slate-400">
          {CHANNELS.map((c) => <span key={c.key} className="w-12 text-center">{c.label}</span>)}
        </div>

        <ul className="divide-y divide-slate-100">
          {PREF_TYPES.map((pt) => (
            <li key={pt.type} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm text-slate-700 flex-1 min-w-0">{pt.label}</span>
              <span className="flex items-center gap-2 shrink-0">
                {CHANNELS.map((c) => {
                  const on = isOn(pt.type, c.key);
                  return (
                    <span key={c.key} className="w-12 flex justify-center">
                      <button
                        type="button"
                        onClick={() => toggle(pt.type, c.key)}
                        disabled={loading}
                        aria-label={`${pt.label} — ${c.label} ${on ? 'on' : 'off'}`}
                        aria-pressed={on}
                        className={cn('relative w-10 h-6 rounded-full transition-colors', on ? 'bg-brand-500' : 'bg-slate-300', loading && 'opacity-50')}
                      >
                        <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-5' : 'left-1')} />
                      </button>
                    </span>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2.5 text-[11px] text-slate-400 border-t border-slate-100">Changes save automatically.</div>
      </div>
    </div>
  );
}
