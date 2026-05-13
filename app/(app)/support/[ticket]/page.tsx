import Link from 'next/link';
import { ChevronLeft, Send, Paperclip } from 'lucide-react';

const MSGS = [
  { mine:true,  who:'You',          text:'I can\'t access the live class link for cohort 12, today 7 PM. Clicking the join button does nothing.', at:'12 May · 14:22' },
  { mine:false, who:'Sahil (support)', text:'Hi Anjali, thanks for reaching out. We\'re investigating — issue confirmed on Safari. As a workaround, please open the link in Chrome. We\'ll patch this within 30 min.', at:'12 May · 14:31' },
  { mine:false, who:'Sahil (support)', text:'Update: fixed and deployed. Could you confirm it works now?', at:'12 May · 14:58' },
];

export default function TicketPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/support" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700"><ChevronLeft className="h-3.5 w-3.5" /> Tickets</Link>

      <div className="mt-3 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-200">
          <div className="text-[11px] font-mono text-slate-400">T-4823 · Opened 12 May</div>
          <h1 className="mt-0.5 heading text-xl text-slate-900">Cannot access live class link</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-rose-50 text-rose-600 px-2.5 py-0.5 text-[10.5px] font-bold">Open · High priority</span>
          </div>
        </header>

        <div className="p-5 space-y-4">
          {MSGS.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.mine ? 'justify-end' : 'justify-start'}`}>
              {!m.mine && <div className="h-8 w-8 rounded-full bg-success/15 text-success text-[11px] font-bold flex items-center justify-center shrink-0">S</div>}
              <div className={`max-w-md ${m.mine ? 'text-right' : ''}`}>
                <div className="text-[11px] text-slate-500 mb-0.5">{m.who} · {m.at}</div>
                <div className={`inline-block rounded-md px-3.5 py-2 text-sm text-left ${m.mine ? 'bg-brand-500 text-white shadow-btn' : 'bg-slate-100 text-slate-800'}`}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-3 flex items-center gap-2">
          <button className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-500 flex items-center justify-center"><Paperclip className="h-4 w-4" /></button>
          <input className="flex-1 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Reply…" />
          <button className="h-10 w-10 rounded-full bg-brand-500 text-white shadow-btn flex items-center justify-center"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
