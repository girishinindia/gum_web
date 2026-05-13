import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { api, type Course } from '@/lib/api';

const FALLBACK: Course[] = [
  { id: 1, code: 'DS101', slug: 'data-science-foundations',  name: 'Data Science Foundations',   short_description: 'Python · pandas · ML basics. End-to-end in Hindi & English.', price: 29999, original_price: 49999, rating_average: 4.8, total_lessons: 64, difficulty_level: 'beginner' },
  { id: 2, code: 'AI201', slug: 'ai-machine-learning',       name: 'AI & Machine Learning Pro',  short_description: 'From regression to deep learning with real capstones.',     price: 39999, original_price: 69999, rating_average: 4.9, total_lessons: 86, difficulty_level: 'intermediate' },
  { id: 3, code: 'FS101', slug: 'mern-full-stack',           name: 'MERN Full-Stack Engineer',   short_description: 'React, Node, Mongo, AWS — ship production-grade apps.',   price: 34999, original_price: 59999, rating_average: 4.7, total_lessons: 92, difficulty_level: 'intermediate' },
  { id: 4, code: 'CS101', slug: 'cyber-security-101',        name: 'Cyber Security Fundamentals', short_description: 'Networks, web security, ethical hacking labs.',          price: 24999, rating_average: 4.6, total_lessons: 48, difficulty_level: 'beginner' },
  { id: 5, code: 'CL101', slug: 'cloud-devops-essentials',   name: 'Cloud & DevOps Essentials',  short_description: 'AWS · Docker · Kubernetes · CI/CD pipelines.',           price: 29999, original_price: 49999, rating_average: 4.8, total_lessons: 72, difficulty_level: 'intermediate' },
  { id: 6, code: 'GA101', slug: 'generative-ai-builder',     name: 'Generative AI Builder',      short_description: 'LLMs, RAG, agents — build production GenAI apps.',         price: 22999, rating_average: 4.9, total_lessons: 40, difficulty_level: 'intermediate' },
  { id: 7, code: 'MB101', slug: 'flutter-mobile-dev',        name: 'Flutter Mobile Development', short_description: 'Build cross-platform iOS + Android apps.',               price: 19999, original_price: 34999, rating_average: 4.5, total_lessons: 56, difficulty_level: 'beginner' },
  { id: 8, code: 'PY101', slug: 'python-from-scratch',       name: 'Python from Scratch',        short_description: 'The most accessible intro to programming in Hindi.',       is_free: true,            rating_average: 4.7, total_lessons: 28, difficulty_level: 'beginner' },
  { id: 9, code: 'UX101', slug: 'ux-design-foundations',     name: 'UX / UI Design Foundations', short_description: 'Figma, design systems, user research, portfolio prep.',    price: 17999, rating_average: 4.6, total_lessons: 36, difficulty_level: 'beginner' },
];

export async function PopularCourses() {
  const live = await api.featuredCourses();
  const items = (live && live.length > 0 ? live : FALLBACK).slice(0, 9);

  return (
    <section id="courses" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>Popular Courses</Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Courses Our Students Love
              </h2>
              <p className="mt-4 text-slate-600 max-w-md">
                Handpicked courses with highest ratings, real projects, and placement support.
              </p>
            </div>
            <ButtonLink href="/courses" variant="primary" size="md" className="rounded-full self-start lg:self-auto">
              All <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((c, i) => (
            <Reveal key={c.id || c.slug} delay={(i % 3) * 0.06}>
              <CourseCard course={c} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
