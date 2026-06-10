import { notFound } from 'next/navigation';
import { Calendar, Clock, User, Share2, Newspaper } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileDetailBar } from '@/components/mobile/MobileDetailBar';
import { Reviews } from '@/components/reviews/Reviews';
import { api } from '@/lib/api';

export const revalidate = 300;

function personName(u?: { full_name?: string | null; first_name?: string | null; last_name?: string | null } | null) {
  if (!u) return 'Staff';
  return u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Staff';
}

export default async function MobileBlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // holds the blog post id on mobile
  const post = await api.blogById(slug);
  if (!post) notFound();

  const author = personName(post.users);
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div>
      <MobilePageHeader title={post.title} subtitle="Article" action={<span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700"><Share2 className="h-4 w-4" /></span>} />

      <div className="px-3">
        <div className="relative aspect-video rounded-md overflow-hidden bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center">
          {post.featured_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.featured_image_url} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : <Newspaper className="h-12 w-12 text-white/80" />}
        </div>
      </div>

      <article className="px-4 pt-4">
        <h1 className="heading text-2xl text-slate-900 leading-tight">{post.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
          <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {author}</span>
          {date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {date}</span>}
          {post.reading_time_min ? <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.reading_time_min} min read</span> : null}
        </div>
        {post.excerpt && <p className="mt-3 text-[13px] text-slate-600 leading-relaxed font-medium">{post.excerpt}</p>}
        {post.content ? (
          <div className="mt-3 text-[13px] text-slate-700 leading-relaxed space-y-3 [&_h2]:heading [&_h2]:text-[16px] [&_h2]:text-slate-900 [&_h2]:mt-4 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-brand-700" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="mt-3 text-[12.5px] text-slate-500">Full article coming soon.</p>
        )}
      </article>

      <section className="px-4 mt-6">
        <Reviews itemType="blog" itemId={post.id} basePath="/m" noun="article" />
      </section>

      <MobileDetailBar
        cta="Share"
        CtaIcon={Share2}
        left={
          <div>
            <div className="heading text-[15px] text-slate-900">{post.reading_time_min ? `${post.reading_time_min} min read` : 'Article'}</div>
            <div className="text-[10.5px] text-slate-500">by {author}</div>
          </div>
        }
      />
    </div>
  );
}
