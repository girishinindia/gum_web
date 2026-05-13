import { Plus, ArrowDownLeft, ArrowUpRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

const TX = [
  { type:'credit', label:'Referral bonus',           amount:500,  date:'12 May 2026 · 10:42', meta:'Anjali R. signed up' },
  { type:'debit',  label:'Course purchase — Cloud',  amount:29999, date:'10 May 2026 · 18:09', meta:'Order #GUM-2026-9X9' },
  { type:'credit', label:'Refund — Cancelled batch', amount:9999, date:'04 May 2026 · 13:21', meta:'Order #GUM-2026-5K2' },
  { type:'credit', label:'Welcome credit',           amount:200,  date:'01 May 2026 · 09:00', meta:'New user gift' },
];

export default function WalletPage() {
  return (
    <div className="max-w-6xl">
      <Eyebrow>Wallet</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Your GUM Wallet</h1>

      {/* Balance card */}
      <div className="mt-6 rounded-md bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white p-6 shadow-cardHover relative overflow-hidden">
        <div aria-hidden className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="text-[11px] uppercase tracking-wider opacity-90">Available balance</div>
        <div className="mt-2 heading text-5xl">₹10,701</div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="white" className="rounded-full text-brand-700"><Plus className="h-4 w-4" /> Add money</Button>
          <Button variant="glass" className="rounded-full text-white border border-white/40"><Gift className="h-4 w-4" /> Refer &amp; earn</Button>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-8">
        <h2 className="heading text-lg text-slate-900">Recent transactions</h2>
        <div className="mt-4 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100">
          {TX.map((t, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className={cn(
                'h-10 w-10 rounded-md flex items-center justify-center shrink-0',
                t.type === 'credit' ? 'bg-success/15 text-success' : 'bg-rose-50 text-rose-600',
              )}>
                {t.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                <div className="text-[11.5px] text-slate-500">{t.meta} · {t.date}</div>
              </div>
              <div className={cn('font-semibold text-sm', t.type === 'credit' ? 'text-success' : 'text-slate-900')}>
                {t.type === 'credit' ? '+ ' : '– '}₹{t.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
