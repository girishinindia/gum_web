import { Bell, Award, MessageSquare, CreditCard, Radio, CheckCircle2, Calendar, type LucideIcon } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { cn } from '@/lib/cn';

interface Noti { Icon: LucideIcon; label: string; when: string; unread: boolean; accent: string; }

const NOTI: Noti[] = [
  { Icon: Radio,        label: 'Live class starting in 1 hour — "GenAI RAG patterns"', when: 'Just now',  unread: true,  accent: 'bg-rose-50 text-rose-600' },
  { Icon: Award,        label: 'Module 3 quiz passed with 92% — well done!',           when: '2h ago',    unread: true,  accent: 'bg-success/15 text-success' },
  { Icon: MessageSquare,label: 'Karthik replied to your discussion: "RAG eval metric"',when: '5h ago',    unread: true,  accent: 'bg-brand-50 text-brand-700' },
  { Icon: CreditCard,   label: 'Payment of ₹62,538 received — order #GUM-2026-A1B2',   when: 'Yesterday', unread: false, accent: 'bg-emerald-50 text-emerald-700' },
  { Icon: Calendar,     label: 'Reminder: Assignment due tomorrow at 11:59 PM',         when: '2d ago',    unread: false, accent: 'bg-amber-50 text-amber-700' },
  { Icon: CheckCircle2, label: 'Certificate issued: Data Science with Python',         when: '5d ago',    unread: false, accent: 'bg-violet-50 text-violet-700' },
];

const TABS = ['All', 'Unread', 'Mentions', 'System'];

export default function MobileNotificationsPage() {
  return (
    <div>
      <MobilePageHeader title="Notifications" />

      {/* Tab strip */}
      <div className="px-3">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold border',
                i === 0 ? 'bg-brand-500 text-white border-brand-500 shadow-btn' : 'bg-white text-slate-700 border-slate-200',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-3 px-3 space-y-2 pb-4">
        {NOTI.map((n, i) => (
          <li key={i} className={cn(
            'flex items-start gap-2.5 p-3 rounded-md bg-white border border-slate-200 shadow-card',
            n.unread && 'border-brand-200 bg-brand-50/30',
          )}>
            <div className={cn('h-9 w-9 rounded-md flex items-center justify-center shrink-0', n.accent)}>
              <n.Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] text-slate-800 leading-snug">{n.label}</div>
              <div className="text-[10.5px] text-slate-500 mt-0.5">{n.when}</div>
            </div>
            {n.unread && <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
