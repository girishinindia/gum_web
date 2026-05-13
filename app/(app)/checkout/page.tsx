import { CreditCard, Smartphone, Building2, Wallet, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STEPS = ['Cart','Details','Payment','Receipt'];

export default function CheckoutPage() {
  return (
    <div className="max-w-6xl">
      {/* Stepper */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-bold ${i <= 2 ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</div>
            <span className={`text-[12px] font-semibold ${i <= 2 ? 'text-brand-700' : 'text-slate-500'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-10 h-px ${i < 2 ? 'bg-brand-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <h1 className="mt-6 heading text-3xl text-slate-900">Payment</h1>

      <div className="mt-5 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          {/* Billing */}
          <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
            <h2 className="heading text-base text-slate-900">Billing details</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <input className="px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="Full name" defaultValue="Anjali Sharma" />
              <input className="px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="Email" defaultValue="anjali@example.com" />
              <input className="px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="Mobile" defaultValue="+91 98000 00000" />
              <input className="px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="GST number (optional)" />
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
            <h2 className="heading text-base text-slate-900">Payment method</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { Icon: Smartphone, label:'UPI',          active:true  },
                { Icon: CreditCard, label:'Card',         active:false },
                { Icon: Building2,  label:'Netbanking',   active:false },
                { Icon: Wallet,     label:'Wallet / EMI', active:false },
              ].map((p) => (
                <button key={p.label} className={`rounded-md border p-4 text-left flex flex-col gap-2 transition-all ${p.active ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'}`}>
                  <p.Icon className={`h-5 w-5 ${p.active ? 'text-brand-700' : 'text-slate-500'}`} />
                  <div className="text-sm font-semibold text-slate-800">{p.label}</div>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">UPI ID</label>
              <input className="w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="yourname@upi" />
            </div>
          </div>

          <Button variant="primary" className="w-full rounded-full">Pay ₹61,378</Button>
          <div className="flex items-center justify-center gap-2 text-[11.5px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Encrypted &amp; PCI-DSS compliant payment</div>
        </div>

        <aside className="rounded-md bg-white border border-slate-200 shadow-cardHover p-5 lg:sticky lg:top-24 self-start">
          <h2 className="heading text-base text-slate-900">Your order</h2>
          <ul className="mt-3 space-y-3 text-[13px]">
            <li className="flex justify-between"><span className="text-slate-700">Data Science with Python</span><span className="font-semibold">₹29,999</span></li>
            <li className="flex justify-between"><span className="text-slate-700">Generative AI Builder</span><span className="font-semibold">₹22,999</span></li>
            <li className="flex justify-between text-success"><span>Discount</span><span>– ₹0</span></li>
            <li className="flex justify-between text-slate-600"><span>GST (18%)</span><span>₹9,540</span></li>
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between heading">
            <span className="text-slate-900">Total</span>
            <span className="text-slate-900">₹62,538</span>
          </div>
          <div className="mt-5 flex items-start gap-2 text-[11.5px] text-slate-600 bg-success/10 text-success rounded-sm px-3 py-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Lifetime access · 7-day refund · Verified certificate</div>
        </aside>
      </div>
    </div>
  );
}
