'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Eyebrow } from '@/components/ui/Eyebrow';

interface FaqItem { question: string; answer: string }

const FALLBACK: FaqItem[] = [
  { question: 'What languages are the courses taught in?', answer: 'Every program is recorded and live-taught in Hindi, English, and 10+ regional languages — including Tamil, Telugu, Marathi, Bengali, Gujarati and Kannada.' },
  { question: 'Do I get placement assistance?',            answer: 'Yes — we have a 95% placement rate with 250+ hiring partners. You get mock interviews, resume reviews, and direct introductions.' },
  { question: 'How much do the courses cost?',             answer: 'Most programs are priced ₹20,000–₹40,000 with no-cost EMI options. We also have a few fully-free intro courses.' },
  { question: 'Are the certificates recognised?',           answer: 'All certificates are blockchain-verified and recognised by our 250+ hiring partners. Some courses are also NSDC-aligned.' },
  { question: 'Can I learn at my own pace?',                answer: 'Yes — every batch combines live sessions with recorded lectures so you can move at your own pace and re-watch anytime.' },
  { question: 'What if I am a complete beginner?',          answer: 'Most of our intro courses start from zero — including a free Python from Scratch course in Hindi to get you started.' },
];

export function FAQ({ items = FALLBACK, inline }: { items?: FaqItem[]; inline?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);

  const accordion = (
    <div className={cn(inline ? 'space-y-3' : 'mt-10 space-y-3')}>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={cn(
              'rounded-xl border overflow-hidden transition-colors',
              isOpen ? 'border-sky-200' : 'border-slate-200',
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left bg-slate-50"
              aria-expanded={isOpen}
            >
              <span className="heading text-base text-slate-900">{f.question}</span>
              <span className={cn(
                'shrink-0 text-slate-400 transition-transform',
                isOpen && 'rotate-180',
              )}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-5 py-4 text-sm text-slate-600 leading-relaxed">{f.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  /* inline mode: just the accordion, no section wrapper */
  if (inline) return accordion;

  return (
    <section id="faq" className="py-14 sm:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <Eyebrow className="justify-center">FAQ</Eyebrow>
          <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-tight tracking-tight">Frequently Asked Questions</h2>
        </div>
        {accordion}
      </div>
    </section>
  );
}
