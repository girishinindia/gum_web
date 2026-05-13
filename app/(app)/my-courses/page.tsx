import Link from 'next/link';
import { PlayCircle, Clock, Award, MoreVertical } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

const TABS = ['In Progress','Completed','Archived'];
const COURSES = [
  { id:1, name:'Data Science with Python', module:'Statistics for ML', cover:'from-brand-700 to-brand-500', percent:62, hours:'12h left', last:'2h ago' },
  { id:2, name:'MERN Full-Stack',          module:'Auth & deployment', cover:'from-emerald-700 to-brand-500', percent:38, hours:'40h left', last:'yesterday' },
  { id:3, name:'Generative AI Builder',    module:'RAG in production', cover:'from-violet-700 to-rose-500', percent:81, hours:'4h left',  last:'3 days ago' },
];

export default function MyCoursesPage() {
  return (
    <div className="max-w-7xl">
      <Eyebrow>My Learning</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Your courses</h1>

      <div className="mt-6 flex items-center gap-2 border-b border-slate-200">
        {TABS.map((t, i) => (
          <button key={t} className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
            i === 0 ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-brand-700',
          )}>
            {t} <span className="ml-1.5 text-[11px] text-slate-400">{i === 0 ? 3 : i === 1 ? 2 : 0}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {COURSES.map((c) => (
          <div key={c.id} className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden flex flex-col sm:flex-row hover:shadow-cardHover transition-all">
            <Link href={`/learn/${c.id}/1/1`} className={cn('relative sm:w-64 aspect-video sm:aspect-auto sm:flex-shrink-0 bg-gradient-to-br', c.cover, 'flex items-center justify-center')}>
              <PlayCircle className="h-12 w-12 text-white/90" />
            </Link>
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold">{c.module}</div>
                  <h3 className="mt-1 heading text-lg text-slate-900">{c.name}</h3>
                </div>
                <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"><MoreVertical className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-[12px] text-slate-500">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.hours}</span>
                <span>Last accessed {c.last}</span>
              </div>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-accent rounded-full" style={{ width: c.percent + '%' }} />
              </div>
              <div className="mt-2 text-[11.5px] text-slate-500 flex justify-between">
                <span>{c.percent}% complete</span>
                {c.percent === 100 && <span className="text-success font-semibold inline-flex items-center gap-1"><Award className="h-3 w-3" /> Get certificate</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
