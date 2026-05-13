import { CheckCircle2, Download, Mail, FileText } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';

export default function OrderReceiptPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden">
        <div className="bg-gradient-to-r from-success via-success to-emerald-600 text-white p-6 flex items-center gap-4">
          <CheckCircle2 className="h-10 w-10 shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-90">Payment successful</div>
            <div className="heading text-2xl mt-0.5">Thanks, Anjali!</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] opacity-90">Order</div>
            <div className="font-mono font-bold">#GUM-2026-A1B2</div>
          </div>
        </div>

        <div className="p-7 space-y-5">
          <div>
            <h2 className="heading text-lg text-slate-900">Items</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              <li className="py-3 flex justify-between text-sm"><span className="text-slate-700">Data Science with Python</span><span className="font-semibold">₹29,999</span></li>
              <li className="py-3 flex justify-between text-sm"><span className="text-slate-700">Generative AI Builder</span><span className="font-semibold">₹22,999</span></li>
              <li className="py-3 flex justify-between text-[12.5px] text-slate-500"><span>GST (18%)</span><span>₹9,540</span></li>
            </ul>
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between heading text-lg"><span className="text-slate-900">Total paid</span><span className="text-gradient">₹62,538</span></div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100">
            <Button variant="outline" className="rounded-full"><Download className="h-4 w-4" /> Invoice PDF</Button>
            <Button variant="outline" className="rounded-full"><FileText className="h-4 w-4" /> Tax invoice</Button>
            <Button variant="outline" className="rounded-full"><Mail className="h-4 w-4" /> Email receipt</Button>
          </div>

          <div className="text-[12.5px] text-slate-500 pt-5 border-t border-slate-100">
            A receipt was also sent to <span className="text-slate-800 font-semibold">anjali@example.com</span>.
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <ButtonLink href="/my-courses" variant="primary" className="rounded-full">Go to my courses</ButtonLink>
      </div>
    </div>
  );
}
