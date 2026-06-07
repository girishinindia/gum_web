import { Download, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

const TX = [
  { id:'GUM-2026-A1B2', date:'12 May 2026',  amount:62538, method:'UPI · ****@upi',         status:'paid',    items:'Data Science · GenAI' },
  { id:'GUM-2026-9X9',  date:'04 May 2026',  amount:29999, method:'Card · ****4242',         status:'paid',    items:'Cloud & DevOps' },
  { id:'GUM-2026-5K2',  date:'01 May 2026',  amount:9999,  method:'UPI · ****@upi',         status:'refunded', items:'Cancelled batch' },
  { id:'GUM-2026-2A1',  date:'28 Apr 2026',  amount:14999, method:'Netbanking · HDFC',       status:'pending',  items:'EMI · month 1/6' },
];

const STATUS: Record<string, { label: string; Icon: any; cls: string }> = {
  paid:     { label:'Paid',     Icon:CheckCircle2, cls:'bg-success/15 text-success' },
  pending:  { label:'Pending',  Icon:Clock,        cls:'bg-amber-50 text-amber-700' },
  refunded: { label:'Refunded', Icon:XCircle,      cls:'bg-slate-100 text-slate-600' },
};

export default function PaymentsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <Eyebrow>Payment history</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Payments</h1>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Lifetime spent',     value:'₹1,17,535' },
          { label:'Successful',          value:'12' },
          { label:'Pending EMIs',        value:'2' },
          { label:'Refunds received',    value:'₹9,999' },
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
              <th className="text-left px-5 py-3">Order</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-5 py-3">Items</th>
              <th className="text-left px-5 py-3">Method</th>
              <th className="text-right px-5 py-3">Amount</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TX.map((t) => {
              const s = STATUS[t.status];
              return (
                <tr key={t.id} className="hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-mono text-[12px] text-slate-700">{t.id}</td>
                  <td className="px-5 py-3 text-slate-700">{t.date}</td>
                  <td className="px-5 py-3 text-slate-700 truncate max-w-[200px]">{t.items}</td>
                  <td className="px-5 py-3 text-slate-500">{t.method}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3"><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold', s.cls)}><s.Icon className="h-3 w-3" /> {s.label}</span></td>
                  <td className="px-5 py-3 text-right">
                    <button className="h-8 w-8 rounded-full hover:bg-brand-50 text-slate-500 hover:text-brand-700 flex items-center justify-center"><Download className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
