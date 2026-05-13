'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, Flame, ArrowRight, PlayCircle, Brain, Rocket } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

const STATS = [
  { value: '50K',  suffix: '+',   label: 'Students'  },
  { value: '95',   suffix: '%',   label: 'Placement' },
  { value: '4.9',  suffix: '/5',  label: 'Rating'    },
];

export function Hero() {
  return (
    <section className="relative pt-28 pb-14 overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur border border-brand-200 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-brand-800">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> New Batches Starting Soon
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 px-2.5 py-1 text-[11px] font-bold tracking-wide">
                <Flame className="h-3 w-3" /> HOT
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 heading text-[40px] sm:text-5xl lg:text-[64px] xl:text-[72px] text-slate-900 leading-[1.04] tracking-tight"
            >
              Master the <span className="text-gradient">IT Skills</span><br />
              That <span className="text-gradient">Launch Real</span><br />
              <span className="text-slate-900">Careers.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed"
            >
              Industry-ready courses across 20+ tech domains — Data Science, AI/ML, Cyber Security, Full Stack &amp; more. Learn in your language, land your dream job.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <ButtonLink href="/courses" variant="primary" size="lg" className="rounded-full">
                Explore Courses <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="outline" size="lg" className="rounded-full">
                <PlayCircle className="h-5 w-5" /> Watch Demo
              </ButtonLink>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-7 max-w-xl"
            >
              <div className="glass rounded-full p-1.5 pl-4 flex items-center gap-2 shadow-glass">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search courses — Python, AI, Full Stack, Cyber Security…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 py-2"
                />
                <kbd className="hidden sm:inline-flex font-mono text-[10px] bg-white border border-slate-200 rounded-full px-2.5 py-1 text-slate-500">Ctrl K</kbd>
              </div>
            </motion.div>

            {/* Stats — inline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex items-end gap-8 sm:gap-12"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="heading leading-none flex items-baseline gap-0.5">
                    <span className="text-3xl sm:text-4xl text-slate-900">{s.value}</span>
                    <span className="text-2xl sm:text-3xl text-gradient">{s.suffix}</span>
                  </div>
                  <div className="mt-1.5 text-[12px] text-slate-500 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — featured card stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-[440px] hidden lg:block"
          >
            {/* Main hero card — AI & ML
                PHP parity: rotate(-2deg) at rest → translateY(-6px) rotate(0) on hover,
                spring ease 0.4s. */}
            <div
              className="hero-card-tilt absolute top-0 left-0 right-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white p-6 shadow-cardHover overflow-hidden h-[230px]
                         -rotate-2 hover:rotate-0 hover:-translate-y-1.5
                         transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]
                         [box-shadow:0_20px_60px_rgba(14,165,233,.3)]"
            >
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_60%)]" />
              <div aria-hidden className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-white/15 backdrop-blur">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="mt-12">
                  <h3 className="heading text-2xl">AI &amp; ML</h3>
                  <p className="mt-1 text-sm text-white/80">50+ Courses Available</p>
                </div>
                <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating card 1 — Live Projects
                PHP parity: rotate(2deg) at rest → straightens + lifts on hover. */}
            <div
              className="absolute bottom-16 left-4 glass rounded-md p-4 shadow-cardHover w-[220px]
                         rotate-2 hover:rotate-0 hover:-translate-y-1.5
                         transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]"
            >
              <div className="text-2xl">🎉</div>
              <div className="mt-2 heading text-sm text-slate-900">Live Projects</div>
              <div className="text-[11px] text-slate-500">Industry-grade Experience</div>
            </div>

            {/* Floating card 2 — 95% Placement
                PHP parity: rotate(-1deg) at rest → straightens + lifts on hover. */}
            <div
              className="absolute bottom-0 right-0 bg-white rounded-md p-4 shadow-cardHover w-[210px]
                         -rotate-1 hover:rotate-0 hover:-translate-y-1.5
                         transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]
                         [box-shadow:0_12px_40px_rgba(0,0,0,.08)]"
            >
              <div className="flex -space-x-2 mb-2">
                {['#bae6fd','#fcd34d','#86efac','#c4b5fd'].map((c, i) => (
                  <span key={c} className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700" style={{ background: c }}>
                    {['AK','PR','NS','+47'][i]}
                  </span>
                ))}
              </div>
              <div className="heading text-lg text-slate-900">95% Placement</div>
              <div className="flex items-center gap-1 text-[11px] text-success font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Top Tech Companies
              </div>
            </div>

            {/* Rocket accent — small floating chip top-right */}
            <div
              className="absolute -top-3 -right-1 h-12 w-12 rounded-md bg-white/95 backdrop-blur flex items-center justify-center shadow-cardHover
                         rotate-6 hover:rotate-0 transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]"
            >
              <Rocket className="h-5 w-5 text-brand-600" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
