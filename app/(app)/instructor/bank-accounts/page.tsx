import { Plus, ShieldCheck, AlertCircle, Building2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

const ACCOUNTS = [
  { id:1, label:'HDFC Bank · Primary',    masked:'XXXX XXXX 4581', ifsc:'HDFC0001234', verified:true,  primary:true  },
  { id:2, label:'ICICI Bank · Backup',     masked:'XXXX XXXX 7902', ifsc:'ICIC0009876', verified:true,  primary:false },
  { id:3, label:'Kotak Mahindra · New',    masked:'XXXX XXXX 1100', ifsc:'KKBK0123456', verified:false, primary:false },
];

export default function BankAccountsPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Eyebrow>Bank accounts</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Where we send your payouts</h1>
        </div>
        <Button variant="primary" className="rounded-full"><Plus className="h-4 w-4" /> Add account</Button>
      </div>

      <div className="mt-6 space-y-3">
        {ACCOUNTS.map((a) => (
          <div key={a.id} className="rounded-md bg-white border border-slate-200 shadow-card p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 flex items-center justify-center shrink-0"><Building2 className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="heading text-base text-slate-900 truncate">{a.label}</h3>
                {a.primary && <span className="text-[10px] uppercase tracking-wider font-bold bg-brand-50 text-brand-700 rounded-full px-2 py-0.5">Primary</span>}
              </div>
              <div className="mt-0.5 text-[12.5px] text-slate-500 font-mono">{a.masked} · {a.ifsc}</div>
            </div>
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold',
              a.verified ? 'bg-success/15 text-success' : 'bg-amber-50 text-amber-700',
            )}>
              {a.verified ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {a.verified ? 'Verified' : 'Pending verification'}
            </span>
            <button className="h-9 w-9 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"><MoreVertical className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-md bg-amber-50 border border-amber-200 p-4 text-[13px] text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        Verification can take 24–48 hours. We send a ₹1 test deposit and ask you to confirm the amount visible in your bank statement.
      </div>
    </div>
  );
}
