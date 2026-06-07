import Link from 'next/link';
import { Search, MessageSquare } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';

const ROOMS = [
  { id:'cohort-12',  name:'Cohort 12 · General',          last:'Karthik: anyone tried the hf datasets?',    when:'2m', unread:5, type:'group' },
  { id:'anjali',     name:'Anjali (mentor)',              last:'Sure, let me share the eval notebook.',     when:'1h', unread:0, type:'dm' },
  { id:'rag-club',   name:'#rag-builders',                last:'Pinned: weekly office hours every Tue 9pm', when:'3h', unread:0, type:'group' },
  { id:'support',    name:'Grow Up More Support',         last:'Your refund has been processed.',           when:'1d', unread:0, type:'system' },
];

export default function ChatListPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <Eyebrow>Chat</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Conversations</h1>

      <div className="mt-6 grid lg:grid-cols-[320px_1fr] gap-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        {/* Left list */}
        <aside className="border-r border-slate-200">
          <div className="p-3 border-b border-slate-200">
            <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Search messages" />
            </div>
          </div>
          <ul>
            {ROOMS.map((r, i) => (
              <li key={r.id}>
                <Link href={`/chat/${r.id}`} className={`flex items-center gap-3 p-3 hover:bg-brand-50/30 transition-colors ${i === 0 ? 'bg-brand-50/40' : ''} ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[12px] font-bold flex items-center justify-center shrink-0">{r.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                      <div className="text-[10.5px] text-slate-400 shrink-0">{r.when}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] text-slate-500 truncate">{r.last}</div>
                      {r.unread > 0 && <span className="bg-brand-500 text-white rounded-full text-[10px] font-bold px-1.5 min-w-[18px] text-center">{r.unread}</span>}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right placeholder */}
        <div className="hidden lg:flex items-center justify-center min-h-[500px] p-10 text-center">
          <div>
            <div className="mx-auto h-16 w-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center"><MessageSquare className="h-7 w-7" /></div>
            <h2 className="mt-4 heading text-lg text-slate-900">Pick a conversation</h2>
            <p className="mt-1 text-sm text-slate-500">Select a thread from the left to start messaging.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
