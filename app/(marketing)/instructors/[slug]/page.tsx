import Link from 'next/link';
import { Star, Users, BookOpen, Linkedin, Twitter, Globe, BadgeCheck, ChevronRight } from 'lucide-react';
import { CourseCard } from '@/components/ui/CourseCard';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';

const COURSES = [
  { id: 1, code: 'AI201', slug: 'ai-machine-learning',     name: 'AI & Machine Learning Pro', short_description: 'Deep learning + GenAI for production.', price: 39999, original_price: 69999, rating_average: 4.9, total_lessons: 86, difficulty_level: 'intermediate' },
  { id: 2, code: 'GA101', slug: 'generative-ai-builder',   name: 'Generative AI Builder',     short_description: 'LLMs, RAG, agents.',                    price: 22999, rating_average: 4.9, total_lessons: 40, difficulty_level: 'intermediate' },
  { id: 3, code: 'ML301', slug: 'ml-system-design',        name: 'ML System Design',          short_description: 'Production ML pipelines at scale.',     price: 29999, rating_average: 4.8, total_lessons: 54, difficulty_level: 'advanced' },
];

export default function InstructorDetailPage() {
  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
          <Link href="/instructors" className="hover:text-brand-700">Instructors</Link><ChevronRight className="h-3 w-3" />
          <span>Aniket Rao</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[280px_1fr] gap-10">
          <Reveal>
            <div className="rounded-md bg-white border border-slate-200 shadow-cardHover p-6 text-center lg:sticky lg:top-24 self-start">
              <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white heading text-4xl flex items-center justify-center shadow-cardHover">AR</div>
              <h1 className="mt-4 heading text-xl text-slate-900">Aniket Rao</h1>
              <p className="mt-1 text-sm text-slate-500">Sr. ML Engineer · ex-Google</p>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-[11px] font-bold"><BadgeCheck className="h-3 w-3" /> Top Rated</div>

              <div className="mt-5 grid grid-cols-3 gap-1 text-[11px] text-slate-500 pt-5 border-t border-slate-100">
                <div className="flex flex-col items-center gap-0.5"><BookOpen className="h-3.5 w-3.5" /><span className="font-semibold text-slate-800 text-sm">8</span><span>Courses</span></div>
                <div className="flex flex-col items-center gap-0.5"><Users className="h-3.5 w-3.5" /><span className="font-semibold text-slate-800 text-sm">24k+</span><span>Students</span></div>
                <div className="flex flex-col items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-warn text-warn" /><span className="font-semibold text-slate-800 text-sm">4.9</span><span>Rating</span></div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <Link href="#" className="h-9 w-9 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-center text-slate-600"><Linkedin className="h-4 w-4" /></Link>
                <Link href="#" className="h-9 w-9 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-center text-slate-600"><Twitter className="h-4 w-4" /></Link>
                <Link href="#" className="h-9 w-9 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-center text-slate-600"><Globe className="h-4 w-4" /></Link>
              </div>
            </div>
          </Reveal>

          <div>
            <Eyebrow>About the Instructor</Eyebrow>
            <h2 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">
              10 years of ML, shipped at <span className="text-gradient">Google &amp; 3 startups</span>
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Aniket led recommendation systems at YouTube for 5 years, then went on to build the ML platform at 3 successful startups (2 acquired). He teaches the way he learned — from first principles, with real production code.
            </p>

            <h3 className="mt-8 heading text-lg text-slate-900">Expertise</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Deep Learning','RAG / LLMs','MLOps','Recommendation Systems','PyTorch','TensorFlow','Vector DBs','LangChain'].map((t) => (
                <span key={t} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[12px] text-slate-700">{t}</span>
              ))}
            </div>

            <h3 className="mt-10 heading text-2xl text-slate-900">Courses by Aniket</h3>
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {COURSES.map((c, i) => <Reveal key={c.id} delay={(i % 3) * 0.06}><CourseCard course={c} index={i} /></Reveal>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
