import Link from 'next/link';
import { ChevronLeft, Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react';

const MSGS = [
  { mine:false, who:'Karthik V.',  text:'anyone tried the hf datasets package for the capstone?',   at:'10:42' },
  { mine:false, who:'Karthik V.',  text:'docs are weirdly sparse, can\'t figure out streaming mode', at:'10:42' },
  { mine:true,  who:'Anjali',      text:'Yes — quick gotcha: pass `streaming=True` AND `split="train"` together, else it falls back to local cache.', at:'10:51' },
  { mine:false, who:'Sneha K.',    text:'oh that\'s exactly what was tripping me up 😅',             at:'10:52' },
  { mine:true,  who:'Anjali',      text:'Sharing a notebook with the eval loop in a sec.',            at:'10:53' },
];

export default function ChatRoomPage() {
  return (
    <div className="max-w-6xl">
      <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden h-[calc(100vh-9rem)] flex flex-col">
        {/* Header */}
        <header className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
          <Link href="/chat" className="lg:hidden h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"><ChevronLeft className="h-5 w-5" /></Link>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[12px] font-bold flex items-center justify-center">C</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900">Cohort 12 · General</div>
            <div className="text-[11px] text-success">● 14 online</div>
          </div>
          <button className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-600 hover:text-brand-700 flex items-center justify-center"><Phone className="h-4 w-4" /></button>
          <button className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-600 hover:text-brand-700 flex items-center justify-center"><Video className="h-4 w-4" /></button>
          <button className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-600 flex items-center justify-center"><MoreVertical className="h-4 w-4" /></button>
        </header>

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {MSGS.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.mine ? 'justify-end' : 'justify-start'}`}>
              {!m.mine && <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">{m.who[0]}</div>}
              <div className={`max-w-md ${m.mine ? 'text-right' : ''}`}>
                {!m.mine && <div className="text-[11px] text-slate-500 mb-0.5">{m.who}</div>}
                <div className={`inline-block rounded-md px-3.5 py-2 text-sm ${m.mine ? 'bg-brand-500 text-white shadow-btn' : 'bg-slate-100 text-slate-800'}`}>{m.text}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.at}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200 p-3 flex items-center gap-2">
          <button className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-500 hover:text-brand-700 flex items-center justify-center"><Paperclip className="h-4 w-4" /></button>
          <button className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-500 hover:text-brand-700 flex items-center justify-center"><Smile className="h-4 w-4" /></button>
          <input className="flex-1 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" placeholder="Type a message…" />
          <button className="h-10 w-10 rounded-full bg-brand-500 text-white shadow-btn flex items-center justify-center hover:shadow-btnHover"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
