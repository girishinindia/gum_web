import Link from 'next/link';
import { X, Tag, ShieldCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';

const ITEMS = [
  { id:1, name:'Data Science with Python', cover:'from-brand-700 to-brand-500', price:29999, original:49999 },
  { id:2, name:'Generative AI Builder',    cover:'from-violet-700 to-rose-500', price:22999, original:null },
];

export default function CartPage() {
  const subtotal = ITEMS.reduce((s, i) => s + i.price, 0);
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="heading text-3xl text-slate-900">Your cart</h1>
      <p className="mt-1 text-sm text-slate-500">{ITEMS.length} items</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          {ITEMS.map((i) => (
            <div key={i.id} className="rounded-md bg-white border border-slate-200 shadow-card p-4 flex items-center gap-4">
              <div className={`h-16 w-24 rounded-md bg-gradient-to-br ${i.cover} shrink-0`} />
              <div className="flex-1 min-w-0">
                <h3 className="heading text-base text-slate-900 truncate">{i.name}</h3>
                <div className="mt-1 text-[12px] text-slate-500">Lifetime access · 12 lessons in Hindi</div>
              </div>
              <div className="text-right shrink-0">
                <div className="heading text-base text-slate-900">₹{i.price.toLocaleString('en-IN')}</div>
                {i.original && <div className="text-[11px] text-slate-400 line-through">₹{i.original.toLocaleString('en-IN')}</div>}
              </div>
              <button aria-label="Remove" className="h-8 w-8 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
          ))}

          {/* Coupon */}
          <div className="rounded-md bg-white border border-slate-200 shadow-card p-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-brand-600" />
            <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Have a coupon code?" />
            <Button variant="outline" size="sm" className="rounded-full">Apply</Button>
          </div>
        </div>

        {/* Summary */}
        <aside className="rounded-md bg-white border border-slate-200 shadow-cardHover p-5 lg:sticky lg:top-24 self-start">
          <h2 className="heading text-lg text-slate-900">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Discount</dt><dd className="font-semibold text-success">– ₹0</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">GST (18%)</dt><dd className="font-semibold">₹{Math.round(subtotal*0.18).toLocaleString('en-IN')}</dd></div>
            <div className="flex justify-between pt-3 border-t border-slate-100 text-base"><dt className="font-semibold text-slate-900">Total</dt><dd className="heading text-slate-900">₹{Math.round(subtotal*1.18).toLocaleString('en-IN')}</dd></div>
          </dl>
          <ButtonLink href="/checkout" variant="primary" className="mt-5 w-full rounded-full">Proceed to checkout</ButtonLink>
          <div className="mt-4 flex items-start gap-2 text-[11.5px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Secure payments — PCI compliant via Razorpay.</div>
        </aside>
      </div>

      <div className="mt-8 text-center">
        <Link href="/courses" className="text-sm text-brand-700 font-semibold hover:underline">← Continue browsing courses</Link>
      </div>
    </div>
  );
}
