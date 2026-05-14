import Link from 'next/link';
import { Search, SlidersHorizontal, Star, BookOpen, ArrowRight } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const COURSES = [
  { id: 1, code: 'DS101', slug: 'data-science-foundations', name: 'Data Science Foundations',  price: 29999, original_price: 49999, rating_average: 4.8, total_lessons: 64, cover: 'from-brand-700 to-brand-500' },
  { id: 2, code: 'AI201', slug: 'ai-machine-learning',      name: 'AI & Machine Learning Pro', price: 39999, original_price: 69999, rating_average: 4.9, total_lessons: 86, cover: 'from-emerald-700 to-brand-500' },
  { id: 3, code: 'FS101', slug: 'mern-full-stack',          name: 'MERN Full-Stack Engineer',  price: 34999, original_price: 59999, rating_average: 4.7, total_lessons: 92, cover: 'from-violet-700 to-rose-500' },
  { id: 4, code: 'CS101', slug: 'cyber-security-101',       name: 'Cyber Security Fundamentals', price: 24999, rating_average: 4.6, total_lessons: 48, cover: 'from-rose-600 to-amber-500' },
  { id: 5, code: 'CL101', slug: 'cloud-devops-essentials',  name: 'Cloud & DevOps Essentials', price: 29999, original_price: 49999, rating_average: 4.8, total_lessons: 72, cover: 'from-brand-800 to-accent' },
  { id: 6, code: 'GA101', slug: 'generative-ai-builder',    name: 'Generative AI Builder',     price: 22999, rating_average: 4.9, total_lessons: 40, cover: 'from-amber-600 to-rose-500' },
];

export default function MobileCoursesPage() {
  return (
    <div>
      <MobilePageHeader
        title="Courses"
        subtitle="60+ industry-grade programs"
        action={
          <button
            type="button"
            aria-label="Filters"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        }
      />

      {/* Search bar */}
      <div className="px-3">
        <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search courses…" />
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-3 scrollbar-none">
        {['All','Free','Hindi','Beginner','Intermediate','< ₹30k','₹30k+'].map((c, i) => (
          <button
            key={c}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold border ${i === 0 ? 'bg-brand-500 text-white border-brand-500 shadow-btn' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Course list */}
      <ul className="mt-4 px-3 space-y-3 pb-2">
        {COURSES.map((c) => (
          <li key={c.id}>
            <Link
              href={`/m/courses/${c.slug}`}
              className="flex gap-3 p-3 rounded-md bg-white border border-slate-200 active:scale-[0.98] transition-all shadow-card"
            >
              <div className={`relative h-20 w-20 rounded-md bg-gradient-to-br ${c.cover} shrink-0 flex items-center justify-center text-white`}>
                <BookOpen className="h-6 w-6 opacity-90" />
                <div className="absolute top-1 right-1 bg-white/95 text-[8.5px] font-bold text-brand-700 rounded-full px-1.5 py-0.5">हिन्दी में</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono tracking-wider text-slate-400">{c.code}</div>
                <h3 className="heading text-[13.5px] text-slate-900 line-clamp-2 leading-tight mt-0.5">{c.name}</h3>
                <div className="mt-1 flex items-center gap-3 text-[10.5px] text-slate-500">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-slate-700"><Star className="h-3 w-3 fill-warn text-warn" /> {c.rating_average}</span>
                  <span>{c.total_lessons} lessons</span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="heading text-sm text-slate-900">₹{c.price.toLocaleString('en-IN')}</span>
                  {c.original_price && <span className="text-[10.5px] text-slate-400 line-through">₹{c.original_price.toLocaleString('en-IN')}</span>}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 self-center" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
