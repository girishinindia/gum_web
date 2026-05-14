'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { cn } from '@/lib/cn';

const FAQS = [
  { q: 'What languages are the courses taught in?', a: 'Every program is recorded and live-taught in Hindi, English, and 10+ regional languages — including Tamil, Telugu, Marathi, Bengali, Gujarati and Kannada.' },
  { q: 'Do I get placement assistance?',            a: 'Yes — 95% placement rate with 250+ hiring partners. Mock interviews, resume reviews, direct introductions.' },
  { q: 'How much do the courses cost?',             a: 'Most programs ₹20,000–₹40,000 with no-cost EMI. A few intro courses are free.' },
  { q: 'Are the certificates recognised?',          a: 'All certificates are blockchain-verified and recognised by 250+ hiring partners. Some are NSDC-aligned.' },
  { q: 'Can I learn at my own pace?',                a: 'Yes — every batch combines live sessions with recorded lectures.' },
  { q: 'What if I am a complete beginner?',          a: 'Most intro courses start from zero — including a free Python from Scratch course in Hindi.' },
];

export default function MobileFaqPage() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <MobilePageHeader title="FAQs" />
      <div className="px-3 pt-2 space-y-2 pb-4">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={cn('rounded-md bg-white border shadow-card overflow-hidden', isOpen ? 'border-brand-300' : 'border-slate-200')}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full px-3.5 py-3 flex items-center justify-between gap-2 text-left active:scale-[0.99] transition-all"
              >
                <span className="heading text-[13px] font-bold text-slate-900">{f.q}</span>
                <span className={cn('shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-colors', isOpen ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500')}>
                  {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>
              {isOpen && <div className="px-3.5 pb-3.5 text-[12.5px] text-slate-600 leading-relaxed">{f.a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
