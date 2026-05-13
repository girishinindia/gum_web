import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

const TICKETS = [
  { id:'T-4823', subject:'Cannot access live class link',     priority:'High',   status:'Open',        when:'12 May · 14:22', unread:true },
  { id:'T-4720', subject:'Refund for cancelled cohort',         priority:'Med',    status:'In progress', when:'10 May · 18:09', unread:false },
  { id:'T-4612', subject:'Certificate spelling correction',     priority:'Low',    status:'Resolved',    when:'02 May · 11:00', unread:false },
];

const STATUS_PALETTE: Record<string, string> = {
  'Open':         'bg-rose-50 text-rose-600',
  'In progress':  'bg-amber-50 text-amber-700',
  'Resolved':     'bg-success/15 text-success',
};

export default function SupportPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Eyebrow>Support</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Your tickets</h1>
        </div>
        <Button variant="primary" className="rounded-full"><Plus className="h-4 w-4" /> New ticket</Button>
      </div>

      <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100">
        {TICKETS.map((t) => (
          <Link key={t.id} href={`/support/${t.id}`} className="flex items-center gap-4 p-4 hover:bg-brand-50/30 transition-colors">
            <div className="text-[11px] font-mono text-slate-400 w-16 shrink-0">{t.id}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{t.subject}</div>
              <div className="text-[11.5px] text-slate-500 mt-0.5">{t.when}</div>
            </div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{t.priority}</span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-[10.5px] font-bold', STATUS_PALETTE[t.status])}>{t.status}</span>
            {t.unread && <span className="h-2 w-2 rounded-full bg-brand-500" />}
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
