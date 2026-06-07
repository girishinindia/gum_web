import Link from 'next/link';
import { MessagesSquare, ArrowUp, MessageCircle, Hash } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

const TOPICS = [
  { id: 1, title: 'How do I prep for the data-science capstone review?', tag: 'Data Science',   author: 'Rohan M.',   replies: 24, votes: 87,  when: '2h ago' },
  { id: 2, title: 'Tips for cracking React system design rounds',        tag: 'MERN',           author: 'Sneha K.',   replies: 18, votes: 64,  when: '5h ago' },
  { id: 3, title: 'Best LLM for RAG over Indic languages?',              tag: 'AI / ML',        author: 'Pooja N.',   replies: 31, votes: 112, when: '1d ago' },
  { id: 4, title: 'AWS cert order — SAA → SAP or SAA → DVA?',            tag: 'Cloud',          author: 'Karthik V.', replies: 12, votes: 41,  when: '1d ago' },
  { id: 5, title: 'CTF tools every beginner should know',                tag: 'Cyber Security', author: 'Vikram S.',  replies: 22, votes: 76,  when: '2d ago' },
  { id: 6, title: 'Is Django still relevant in 2026?',                   tag: 'Full Stack',     author: 'Arjun D.',   replies: 35, votes: 98,  when: '3d ago' },
];

const CHANNELS = ['All', 'Data Science', 'AI / ML', 'MERN', 'Cloud', 'Cyber Security', 'Full Stack', 'DevOps'];

export default function DiscussionPage() {
  return (
    <>
      <PageHero
        eyebrow="Community Discussion"
        title={<>Learn together, <span className="text-gradient">grow together</span></>}
        subtitle="Ask questions, share insights, and connect with fellow learners and instructors."
      />

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Channel chips */}
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              {CHANNELS.map((c, i) => (
                <button key={c} className={cn(
                  'rounded-full px-4 py-1.5 text-[12px] font-semibold border transition-all',
                  i === 0 ? 'bg-brand-500 text-white border-brand-500 shadow-btn' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:text-brand-700',
                )}>
                  {i > 0 && <Hash className="inline h-3 w-3 mr-1" />}
                  {c}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="mt-8 space-y-3">
            {TOPICS.map((t, i) => (
              <Reveal key={t.id} delay={(i % 6) * 0.04}>
                <div className="group rounded-md bg-white border border-slate-200 shadow-card p-5 hover:shadow-cardHover hover:border-brand-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0 rounded-md bg-brand-50 text-brand-700 px-3 py-2">
                      <ArrowUp className="h-4 w-4" />
                      <span className="text-sm font-bold">{t.votes}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10.5px] font-semibold mb-2">
                        <Hash className="h-3 w-3" /> {t.tag}
                      </div>
                      <h3 className="heading text-[16px] font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
                        {t.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-[12px] text-slate-500">
                        <span>by <span className="font-medium text-slate-700">{t.author}</span></span>
                        <span>{t.when}</span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" /> {t.replies} replies
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={0.2}>
            <div className="mt-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white p-8 text-center shadow-cardHover">
              <MessagesSquare className="h-8 w-8 mx-auto" />
              <h2 className="heading mt-3 text-xl">Join the conversation</h2>
              <p className="mt-2 text-sm opacity-90 max-w-md mx-auto">
                Sign in to post questions, share your knowledge, and connect with the Grow Up More community.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-brand-700 px-5 py-2.5 text-sm font-bold hover:shadow-lg transition-all"
              >
                Sign in to participate
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
