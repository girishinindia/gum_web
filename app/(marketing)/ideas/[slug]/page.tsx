import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Eye, Trophy, Handshake, ArrowRight } from 'lucide-react';
import { fetchPublicIdea } from '@/lib/ideas';
import LikeButton from '@/components/ideas/LikeButton';
import { siteMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const idea = await fetchPublicIdea(slug);
  return siteMeta({
    title: idea ? `${idea.title} — Idea Showcase | Grow Up More` : 'Idea Showcase | Grow Up More',
    description: idea?.short_summary || 'Community ideas that may become real features — with cash rewards and partnerships.',
    path: `/ideas/${slug}`,
    type: 'article',
  });
}

/** Public idea detail (June 2026). Views are counted server-side. */
export default async function PublicIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = await fetchPublicIdea(slug);
  if (!idea) notFound();

  const sections: [string, string | null | undefined][] = [
    ['The problem', idea.problem_statement],
    ['Proposed solution', idea.proposed_solution],
    ['Who it helps', idea.target_users],
    ['Expected benefit', idea.expected_benefit],
  ];

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <Link href="/ideas" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Idea Showcase
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-slate-500">{idea.idea_categories?.icon} {idea.idea_categories?.name}</span>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">{idea.status.replace(/_/g, ' ')}</span>
          {idea.is_rewarded ? <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 border border-yellow-200 px-2.5 py-0.5 text-[11px] font-bold text-yellow-700"><Trophy className="h-3 w-3" /> REWARDED</span> : null}
          {idea.has_partnership ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-[11px] font-bold text-violet-700"><Handshake className="h-3 w-3" /> PARTNERSHIP</span> : null}
        </div>

        <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">{idea.title}</h1>
        <p className="mt-2 text-sm text-slate-500 capitalize">
          Submitted by {idea.users?.first_name || 'a member'} · {idea.user_type} · {new Date(idea.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <LikeButton ideaId={idea.id} initialCount={idea.likes_count} />
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-400"><Eye className="h-4 w-4" /> {idea.views_count.toLocaleString('en-IN')} views</span>
        </div>

        {idea.short_summary ? (
          <p className="mt-6 rounded-md bg-brand-50/60 border border-brand-100 p-4 text-[15px] text-slate-700 leading-relaxed">{idea.short_summary}</p>
        ) : null}

        <div className="mt-6 space-y-6">
          {sections.filter(([, v]) => v).map(([title, body]) => (
            <div key={title} className="rounded-md bg-white border border-slate-200 shadow-card p-5 sm:p-6">
              <h2 className="heading text-lg text-slate-900">{title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600 whitespace-pre-wrap">{body}</p>
            </div>
          ))}
        </div>

        {Array.isArray(idea.tags) && idea.tags.length ? (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {idea.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-600">#{t}</span>)}
          </div>
        ) : null}

        <div className="mt-10 rounded-md border border-brand-200 bg-gradient-to-r from-brand-50 to-emerald-50 p-6 text-center">
          <h3 className="heading text-xl text-slate-900">Have an idea like this?</h3>
          <p className="mt-1 text-sm text-slate-600">If we implement your idea, you may receive a cash reward, recognition, or a partnership opportunity.</p>
          <Link href="/submit-idea" className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-btn hover:bg-brand-700">
            Submit your idea <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
