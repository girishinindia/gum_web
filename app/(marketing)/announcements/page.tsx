import { Megaphone, Flame } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { ANNOUNCEMENTS } from '@/lib/homeContent';

const TIME_LABELS = ['Just now', 'Yesterday', '3 days ago', '1 week ago', '2 weeks ago'];

export const metadata = {
  title: 'Announcements',
  description: 'Latest announcements, product updates, and news from Grow Up More.',
};

export default function AnnouncementsPage() {
  return (
    <>
      <PageHero
        eyebrow="Announcements"
        title={<>What&apos;s new on <span className="text-gradient">Grow Up More</span></>}
        subtitle="Platform updates, new course launches, events and everything you need to know."
      />

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {ANNOUNCEMENTS.map((a, i) => (
              <Reveal key={a.id} delay={(i % 5) * 0.04}>
                <div className="rounded-md bg-white border border-slate-200 shadow-card p-5 hover:shadow-cardHover transition-all">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center shrink-0">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-slate-900 leading-snug">
                        {a.emoji} {a.text}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-500">
                        <span>{TIME_LABELS[i] ?? `${i + 1} weeks ago`}</span>
                        {i < 2 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-[10.5px] font-bold">
                            <Flame className="h-3 w-3" /> NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
