import Link from 'next/link';
import { MessagesSquare, ArrowUp, MessageCircle, Hash } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

/**
 * Mobile discussion / community forum — seed data placeholder.
 */
const TOPICS = [
  { id: 1, title: 'How do I prep for the data-science capstone review?', tag: 'Data Science',    author: 'Rohan M.',   replies: 24, votes: 87, when: '2h ago' },
  { id: 2, title: 'Tips for cracking React system design rounds',         tag: 'MERN',            author: 'Sneha K.',   replies: 18, votes: 64, when: '5h ago' },
  { id: 3, title: 'Best LLM for RAG over Indic languages?',               tag: 'AI / ML',         author: 'Pooja N.',   replies: 31, votes: 112, when: '1d ago' },
  { id: 4, title: 'AWS cert order — SAA → SAP or SAA → DVA?',             tag: 'Cloud',           author: 'Karthik V.', replies: 12, votes: 41, when: '1d ago' },
  { id: 5, title: 'CTF tools every beginner should know',                 tag: 'Cyber Security',  author: 'Vikram S.',  replies: 22, votes: 76, when: '2d ago' },
];

const CHANNELS = [
  { name: 'Data Science', count: 1240 },
  { name: 'AI / ML',      count: 980 },
  { name: 'MERN',         count: 870 },
  { name: 'Cloud',        count: 612 },
  { name: 'Cyber',        count: 445 },
];

export default function MobileDiscussionPage() {
  return (
    <div>
      <MobilePageHeader title="Discussion" />

      {/* Channel chips */}
      <div className="px-3 pt-3">
        <div className="flex gap-2 overflow-x-auto -mx-3 pl-3 pr-5 scrollbar-none">
          {CHANNELS.map((c) => (
            <button
              key={c.name}
              type="button"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all"
            >
              <Hash className="h-3 w-3 text-brand-600" /> {c.name}
              <span className="text-[10px] text-slate-400">· {c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="px-3 pt-3 pb-4 space-y-2">
        {TOPICS.map((t) => (
          <Link
            key={t.id}
            href="/m/discussion"
            className="block rounded-md bg-white border border-slate-200 p-3.5 shadow-card active:scale-[0.99] transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 shrink-0 rounded-md bg-brand-50 text-brand-700 px-2 py-1.5">
                <ArrowUp className="h-3 w-3" />
                <span className="text-[11px] font-bold">{t.votes}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[9.5px] font-semibold mb-1">
                  <Hash className="h-2.5 w-2.5" /> {t.tag}
                </div>
                <h3 className="heading text-[13px] font-semibold text-slate-900 line-clamp-2">{t.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
                  <span>by {t.author} · {t.when}</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MessageCircle className="h-2.5 w-2.5" /> {t.replies}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        <div className="mt-4 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white p-4 text-center shadow-cardHover">
          <MessagesSquare className="h-5 w-5 mx-auto" />
          <div className="heading mt-1.5 text-[14px]">Join the conversation</div>
          <p className="text-[11px] opacity-90 mt-0.5">Sign in to post questions and answer your peers.</p>
          <Link
            href="/login"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white text-brand-700 px-3.5 py-1.5 text-[11.5px] font-bold active:scale-95 transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
