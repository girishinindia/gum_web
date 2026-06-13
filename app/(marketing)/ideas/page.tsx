import Link from 'next/link';
import { Lightbulb, Eye, Trophy, Handshake, Sparkles, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { fetchIdeaCategories, fetchPublicIdeas, type PublicIdea } from '@/lib/ideas';
import LikeButton from '@/components/ideas/LikeButton';
import { siteMeta } from '@/lib/seo';

export const revalidate = 60;

export const metadata = siteMeta({
  title: 'Idea Showcase — Your Idea Can Become Reality | Grow Up More',
  description: 'Students and instructors submit innovative ideas. If we implement your idea, you may receive a cash reward, recognition, or partnership opportunity.',
  path: '/ideas',
});

const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  planned_for_implementation: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  implemented: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rewarded: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  partnership_offered: 'bg-violet-50 text-violet-700 border-violet-200',
  closed: 'bg-slate-100 text-slate-500 border-slate-200',
};

/**
 * Public Idea Showcase (June 2026) — "Submit Your Idea & Get Reward".
 * Approved/implemented ideas, made public by admin, shown to inspire more.
 */
export default async function IdeasShowcasePage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.category) qs.set('category', sp.category);
  if (sp.sort) qs.set('sort', sp.sort);
  qs.set('limit', '24');

  const [ideas, categories] = await Promise.all([
    fetchPublicIdeas(qs.toString()),
    fetchIdeaCategories(),
  ]);
  const list: PublicIdea[] = ideas ?? [];

  return (
    <>
      <PageHero
        eyebrow="Idea Showcase"
        title={<>Your idea can become <span className="text-gradient">reality</span></>}
        subtitle="Students and instructors submit innovative ideas. If we implement yours, you may receive a cash reward, recognition, or a partnership opportunity."
      />

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* CTA strip */}
          <div className="rounded-md border border-brand-200 bg-gradient-to-r from-brand-50 to-emerald-50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-2xl shadow-card">💡</span>
              <div>
                <h2 className="heading text-lg text-slate-900">Have an idea? Submit it and get rewarded.</h2>
                <p className="text-[13px] text-slate-600 mt-0.5">Best ideas may get a cash reward (paid to your GUM Wallet) or a partnership opportunity. Students and instructors both can submit.</p>
              </div>
            </div>
            {/* BUG-75: give signed-in users a way to reach their submissions.
                Rendered unconditionally (page is ISR/anonymous) — /my-ideas
                lives in the (app) group and bounces to sign-in if needed. */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/my-ideas" className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 whitespace-nowrap">
                <Lightbulb className="h-4 w-4" /> My Ideas
              </Link>
              <Link href="/submit-idea" className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-btn hover:bg-brand-700 whitespace-nowrap">
                Submit your idea <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Link href="/ideas" className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold ${!sp.category ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>All</Link>
            {(categories ?? []).map((c) => (
              <Link key={c.id} href={`/ideas?category=${c.slug}`}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold ${sp.category === c.slug ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                {c.icon} {c.name}
              </Link>
            ))}
            <div className="ml-auto flex gap-2">
              {[['latest', 'Latest'], ['popular', 'Most liked'], ['views', 'Most viewed']].map(([v, l]) => (
                <Link key={v} href={`/ideas?${new URLSearchParams({ ...(sp.category ? { category: sp.category } : {}), sort: v }).toString()}`}
                  className={`text-[12px] font-semibold ${((sp.sort || 'latest') === v) ? 'text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}>{l}</Link>
              ))}
            </div>
          </div>

          {/* Grid */}
          {list.length === 0 ? (
            <div className="mt-8 rounded-md bg-white border border-slate-200 p-12 text-center">
              <Lightbulb className="h-8 w-8 mx-auto text-slate-300" />
              <p className="mt-3 heading text-lg text-slate-800">No public ideas here yet</p>
              <p className="mt-1 text-sm text-slate-500">Approved ideas appear on the showcase — yours could be the first!</p>
              <Link href="/submit-idea" className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-btn hover:bg-brand-700">Submit an idea</Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((idea) => (
                <Link key={idea.id} href={`/ideas/${idea.slug}`} className="group rounded-md bg-white border border-slate-200 shadow-card p-5 hover:-translate-y-1 hover:shadow-cardHover transition-all flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-slate-500">{idea.idea_categories?.icon} {idea.idea_categories?.name || 'Idea'}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${STATUS_BADGE[idea.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {idea.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="mt-3 heading text-[17px] leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">{idea.title}</h3>
                  {idea.short_summary ? <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{idea.short_summary}</p> : null}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {idea.is_rewarded ? <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-[10.5px] font-bold text-yellow-700"><Trophy className="h-3 w-3" /> REWARDED</span> : null}
                    {idea.has_partnership ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10.5px] font-bold text-violet-700"><Handshake className="h-3 w-3" /> PARTNERSHIP</span> : null}
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-[12px] text-slate-400 capitalize">
                      by {idea.users?.first_name || 'a member'} · {idea.user_type}
                    </span>
                    <span className="flex items-center gap-3 text-[12px] text-slate-400">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {idea.views_count}</span>
                      <LikeButton ideaId={idea.id} initialCount={idea.likes_count} compact />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Bottom banners */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ['💡', 'Your idea can become a real product feature.'],
              ['🏆', 'Get rewarded if your idea is implemented.'],
              ['🤝', 'Best ideas may earn a partnership opportunity.'],
            ].map(([icon, text]) => (
              <div key={text} className="rounded-md bg-white border border-slate-200 p-5 text-center">
                <div className="text-2xl">{icon}</div>
                <p className="mt-2 text-[13px] font-medium text-slate-700">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/submit-idea" className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              <Sparkles className="h-4 w-4" /> Submit your idea now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
