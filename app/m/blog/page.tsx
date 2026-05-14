import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { BLOG_POSTS } from '@/lib/homeContent';

const CATS = ['All','Career','AI / ML','Data Science','Full Stack','Cyber'];

export default function MobileBlogPage() {
  return (
    <div>
      <MobilePageHeader title="Blogs" subtitle="Career playbooks &amp; deep reads" />

      <div className="pl-3 pr-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CATS.map((c, i) => (
            <button
              key={c}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold border ${i === 0 ? 'bg-brand-500 text-white border-brand-500 shadow-btn' : 'bg-white text-slate-700 border-slate-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-3 px-3 space-y-3 pb-4">
        {BLOG_POSTS.map((p) => (
          <li key={p.id}>
            <Link href={`/m/blog/${p.slug}`} className="block rounded-md bg-white border border-slate-200 overflow-hidden shadow-card active:scale-[0.98] transition-all">
              <div className={`relative aspect-[16/9] bg-gradient-to-br ${p.cover}`}>
                <div className="absolute top-2 left-2 bg-white/95 text-[9.5px] font-bold text-brand-700 uppercase tracking-wider rounded-full px-2 py-0.5">{p.category}</div>
              </div>
              <div className="p-3">
                <h3 className="heading text-[14px] font-bold text-slate-900 line-clamp-2">{p.title}</h3>
                <p className="mt-1 text-[11.5px] text-slate-600 line-clamp-2 min-h-[28px]">{p.excerpt}</p>
                <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.readMin} min</span>
                  </div>
                  <span className="text-brand-700 font-semibold inline-flex items-center gap-0.5">Read <ArrowRight className="h-3 w-3" /></span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
