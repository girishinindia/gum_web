import { Plus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

const PAYOUTS = [
  { id:'PO-2026-009', requested:'05 May 2026', amount:450000, status:'paid',      utr:'HDFC123456789', when:'07 May 2026' },
  { id:'PO-2026-008', requested:'02 Apr 2026', amount:380000, status:'paid',      utr:'HDFC123456321', when:'04 Apr 2026' },
  { id:'PO-2026-007', requested:'01 Mar 2026', amount:295000, status:'paid',      utr:'HDFC123455999', when:'03 Mar 2026' },
  { id:'PO-2026-010', requested:'13 May 2026', amount:325000, status:'pending',   utr:'—',             when:'—' },
];

const STATUS: Record<string, { label:string; Icon:any; cls:string }> = {
  paid:    { label:'Paid',    Icon:CheckCircle2, cls:'bg-success/15 text-success' },
  pending: { label:'Pending', Icon:Clock,        cls:'bg-amber-50 text-amber-700' },
  failed:  { label:'Failed',  Icon:XCircle,      cls:'bg-rose-50 text-rose-600' },
};

export default function PayoutsPage() {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Eyebrow>Payouts</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Withdrawals</h1>
        </div>
        <Button variant="primary" className="rounded-full"><Plus className="h-4 w-4" /> Request payout</Button>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {[
          { label:'Available balance', value:'₹3,25,000' },
          { label:'Withholding',       value:'₹85,000' },
          { label:'Next auto-payout',  value:'15 May' },
        ].map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
            <div className="mt-1 heading text-2xl text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left px-5 py-3">Payout</th>
              <th className="text-left px-5 py-3">Requested</th>
              <th className="text-right px-5 py-3">Amount</th>
              <th className="text-left px-5 py-3">UTR</th>
              <th className="text-left px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PAYOUTS.map((p) => {
              const s = STATUS[p.status];
              return (
                <tr key={p.id} className="hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-mono text-[12px] text-slate-700">{p.id}</td>
                  <td className="px-5 py-3 text-slate-700">{p.requested}</td>
                  <td className="px-5 py-3 text-right heading text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 font-mono text-[12px] text-slate-500">{p.utr}</td>
                  <td className="px-5 py-3"><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold', s.cls)}><s.Icon className="h-3 w-3" /> {s.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
