import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { CourseCard } from '@/components/ui/CourseCard';
import { Reveal } from '@/components/ui/Reveal';

const COURSES = [
  { id: 1, code: 'DS101', slug: 'data-science-foundations', name: 'Data Science Foundations',  short_description: 'Python, pandas, ML basics — end-to-end in Hindi & English.', price: 29999, original_price: 49999, rating_average: 4.8, total_lessons: 64, difficulty_level: 'beginner' },
  { id: 2, code: 'AI201', slug: 'ai-machine-learning',      name: 'AI & Machine Learning Pro', short_description: 'From regression to deep learning with real capstones.',     price: 39999, original_price: 69999, rating_average: 4.9, total_lessons: 86, difficulty_level: 'intermediate' },
  { id: 3, code: 'FS101', slug: 'mern-full-stack',          name: 'MERN Full-Stack Engineer',  short_description: 'React, Node, Mongo, AWS — production-grade apps.',          price: 34999, original_price: 59999, rating_average: 4.7, total_lessons: 92, difficulty_level: 'intermediate' },
  { id: 4, code: 'CS101', slug: 'cyber-security-101',       name: 'Cyber Security Fundamentals', short_description: 'Networks, web sec, ethical hacking labs.',                price: 24999, rating_average: 4.6, total_lessons: 48, difficulty_level: 'beginner' },
  { id: 5, code: 'CL101', slug: 'cloud-devops-essentials',  name: 'Cloud & DevOps Essentials', short_description: 'AWS, Docker, Kubernetes, CI/CD pipelines.',                 price: 29999, original_price: 49999, rating_average: 4.8, total_lessons: 72, difficulty_level: 'intermediate' },
  { id: 6, code: 'GA101', slug: 'generative-ai-builder',    name: 'Generative AI Builder',     short_description: 'LLMs, RAG, agents — build production GenAI apps.',          price: 22999, rating_average: 4.9, total_lessons: 40, difficulty_level: 'intermediate' },
  { id: 7, code: 'MB101', slug: 'flutter-mobile-dev',       name: 'Flutter Mobile Development', short_description: 'Build cross-platform iOS + Android apps.',                price: 19999, original_price: 34999, rating_average: 4.5, total_lessons: 56, difficulty_level: 'beginner' },
  { id: 8, code: 'PY101', slug: 'python-from-scratch',      name: 'Python from Scratch',       short_description: 'The most accessible intro to programming in Hindi.',        is_free: true,            rating_average: 4.7, total_lessons: 28, difficulty_level: 'beginner' },
  { id: 9, code: 'UX101', slug: 'ux-design-foundations',    name: 'UX / UI Design Foundations', short_description: 'Figma, design systems, user research, portfolio prep.',  price: 17999, rating_average: 4.6, total_lessons: 36, difficulty_level: 'beginner' },
];

const FILTER_GROUPS = [
  { label: 'Category',  options: ['Data Science','AI & ML','Full Stack','Cyber Security','Cloud & DevOps','Mobile','Design','Generative AI'] },
  { label: 'Level',     options: ['Beginner','Intermediate','Advanced','Expert','All Levels'] },
  { label: 'Language',  options: ['English','Hindi','Tamil','Telugu','Marathi','Bengali','Gujarati'] },
  { label: 'Price',     options: ['Free','Under ₹20k','₹20k–₹40k','₹40k+'] },
  { label: 'Duration',  options: ['Under 4 weeks','4–8 weeks','8–12 weeks','12+ weeks'] },
];

export default function CoursesPage() {
  return (
    <>
      <PageHero
        eyebrow="All Courses"
        title={<>Find the program that <span className="text-gradient">fits your career goal</span></>}
        subtitle="60+ industry-grade courses across 8 categories. Filter, compare, enroll."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Search + sort bar */}
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 glass rounded-full p-1.5 pl-4 flex items-center gap-2 shadow-glass">
                <Search className="h-4 w-4 text-slate-500" />
                <input type="text" placeholder="Search Python, AI, Full Stack…" className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 py-2" />
                <kbd className="hidden sm:inline-flex font-mono text-[10px] bg-white border border-slate-200 rounded-full px-2.5 py-1 text-slate-500">Ctrl K</kbd>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:border-brand-300 text-sm font-medium text-slate-700 shadow-card">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:border-brand-300 text-sm font-medium text-slate-700 shadow-card">
                Sort: Most Popular <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Filter rail */}
            <aside className="space-y-5">
              {FILTER_GROUPS.map((g) => (
                <Reveal key={g.label}>
                  <div className="rounded-md bg-white border border-slate-200 shadow-card p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">{g.label}</div>
                    <ul className="space-y-2">
                      {g.options.map((o) => (
                        <li key={o}>
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-brand-700">
                            <input type="checkbox" className="rounded accent-brand-500" />
                            {o}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </aside>

            {/* Grid */}
            <div>
              <div className="text-sm text-slate-500 mb-4">Showing <span className="font-semibold text-slate-800">{COURSES.length}</span> of 60+ courses</div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {COURSES.map((c, i) => (
                  <Reveal key={c.id} delay={(i % 3) * 0.05}><CourseCard course={c} index={i} /></Reveal>
                ))}
              </div>

              {/* Pagination stub */}
              <div className="mt-10 flex items-center justify-center gap-1">
                {[1,2,3,'…',7].map((p, i) => (
                  <button key={i} className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors ${p === 1 ? 'bg-brand-500 text-white shadow-btn' : 'text-slate-600 hover:bg-brand-50'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
