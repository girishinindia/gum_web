import { Bell, Award, MessageSquare, CreditCard, Radio, CheckCircle2, Calendar } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

const NOTI = [
  { Icon:Radio,        label:'Live class starting in 1 hour — "GenAI RAG patterns"', when:'Just now',   unread:true,  accent:'bg-rose-50 text-rose-600' },
  { Icon:Award,        label:'Module 3 quiz passed with 92% — well done!',             when:'2h ago',     unread:true,  accent:'bg-success/15 text-success' },
  { Icon:MessageSquare,label:'Karthik replied to your discussion: "RAG eval metric"',  when:'5h ago',     unread:true,  accent:'bg-brand-50 text-brand-700' },
  { Icon:CreditCard,   label:'Payment of ₹62,538 received — order #GUM-2026-A1B2',     when:'Yesterday',  unread:false, accent:'bg-emerald-50 text-emerald-700' },
  { Icon:Calendar,     label:'Reminder: Assignment due tomorrow at 11:59 PM',           when:'2 days ago', unread:false, accent:'bg-amber-50 text-amber-700' },
  { Icon:CheckCircle2, label:'Certificate issued: Data Science with Python',           when:'5 days ago', unread:false, accent:'bg-violet-50 text-violet-700' },
];

const TABS = ['All','Unread','Mentions','Payments','System'];

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Eyebrow>Notifications</Eyebrow>
      <div className="mt-3 flex items-center justify-between gap-3">
        <h1 className="heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Inbox</h1>
        <button className="text-[12px] font-semibold text-brand-700 hover:underline">Mark all read</button>
      </div>

      <div className="mt-6 flex items-center gap-1.5 border-b border-slate-200">
        {TABS.map((t, i) => (
          <button key={t} className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
            i === 0 ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-brand-700',
          )}>{t}</button>
        ))}
      </div>

      <ul className="mt-4 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100">
        {NOTI.map((n, i) => (
          <li key={i} className={cn('p-4 flex items-start gap-3', n.unread && 'bg-brand-50/20')}>
            <div className={cn('h-9 w-9 rounded-md flex items-center justify-center shrink-0', n.accent)}><n.Icon className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-800">{n.label}</div>
              <div className="text-[11.5px] text-slate-500 mt-0.5">{n.when}</div>
            </div>
            {n.unread && <span className="h-2 w-2 rounded-full bg-brand-500 mt-2 shrink-0" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
