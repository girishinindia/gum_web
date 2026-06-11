import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Calendar, Clock, ChevronRight, ArrowLeft, User, Star, Eye, Tag } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reviews } from '@/components/reviews/Reviews';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleLd, breadcrumbLd } from '@/lib/jsonld';
import { api } from '@/lib/api';
import { SITE, siteMeta } from '@/lib/seo';
import { ShareBar } from '@/components/ui/ShareBar';

export const revalidate = 60; // SEO fix: og/meta changes propagate within a minute

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function personName(u?: any): string {
  if (!u) return 'Grow Up More';
  return u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Grow Up More';
}
function fmtDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function toTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post: any = await api.blogById(slug).catch(() => null);
  if (!post) return { title: 'Article Not Found' };
  // SEO audit (June 2026): blog_posts has meta_title/meta_description/
  // meta_keywords/og_image_url — they were ignored before.
  return {
    ...siteMeta({
      title: post.meta_title || post.title || 'Article',
      description: post.meta_description || post.excerpt || null,
      path: `/blog/${post.slug || slug}`,
      image: post.og_image_url || post.featured_image_url || null,
      type: 'article',
    }),
    keywords: post.meta_keywords || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // catalog links carry the post id here
  const post = await api.blogById(slug).catch(() => null);
  if (!post) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = post;
  const author = personName(p.users);
  const avatar = p.users?.avatar_url || p.users?.profile_image_url || null;
  const category = p.categories?.name || p.blog_categories?.name || '';
  const tags = toTags(p.tags);
  const rating = p.rating_average != null ? Number(p.rating_average) : null;
  const shareUrl = `${SITE.url}/blog/${slug}`;

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <JsonLd data={articleLd({ headline: post.title, description: p.excerpt, url: `/blog/${slug}`, image: p.featured_image_url, datePublished: p.published_at, authorName: author })} />
      <JsonLd data={breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }, { name: post.title, url: `/blog/${slug}` }])} />
      {/* Course-detail frame: max-w-7xl + [content | 380px sticky sidebar] */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-brand-700">Blog</Link><ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[220px]">{post.title}</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
          {/* ════════ LEFT — article ════════ */}
          <article className="min-w-0">
            <Eyebrow>{[category, p.reading_time_min ? `${p.reading_time_min} min read` : ''].filter(Boolean).join(' · ') || 'Article'}</Eyebrow>
            <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">{post.title}</h1>
            <div className="mt-3 text-[12px] text-slate-500 flex items-center gap-4">
              {p.published_at && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmtDate(p.published_at)}</span>}
              {p.reading_time_min ? <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.reading_time_min} min read</span> : null}
              {p.view_count != null && <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {Number(p.view_count).toLocaleString('en-IN')} views</span>}
            </div>

            <Reveal>
              {p.featured_image_url ? (
                <div className="mt-8 aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 shadow-cardHover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="mt-8 aspect-[16/9] rounded-lg bg-gradient-to-br from-brand-600 to-accent shadow-cardHover" />
              )}
            </Reveal>

            {p.excerpt && <p className="mt-6 text-lg text-slate-900 font-medium leading-relaxed">{p.excerpt}</p>}

            {p.content ? (
              <div
                className="prose prose-slate max-w-none mt-6 text-[16px] leading-[1.8] text-slate-700 [&_h2]:heading [&_h2]:text-2xl [&_h2]:text-slate-900 [&_h2]:mt-10 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-brand-700"
                dangerouslySetInnerHTML={{ __html: p.content }}
              />
            ) : (
              <p className="mt-6 text-slate-500">Full article coming soon.</p>
            )}

            {/* Reviews */}
            <div className="mt-12">
              <Reviews itemType="blog" itemId={post.id} noun="article" />
            </div>
          </article>

          {/* ════════ RIGHT — sticky sidebar (course-detail pattern) ════════ */}
          <aside className="order-first lg:order-none lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-5">
              {/* Author */}
              <div className="flex items-center gap-3">
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatar} alt={author} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center">{author.charAt(0).toUpperCase()}</div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5 truncate"><User className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {author}</div>
                  <div className="text-[11px] text-slate-500">Author</div>
                </div>
              </div>

              {/* Facts */}
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-[12.5px] text-slate-600">
                {p.published_at && <li className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-brand-600" /> Published {fmtDate(p.published_at)}</li>}
                {p.reading_time_min ? <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-brand-600" /> {p.reading_time_min} min read</li> : null}
                {p.view_count != null && <li className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-brand-600" /> {Number(p.view_count).toLocaleString('en-IN')} views</li>}
                {rating != null && rating > 0 && (
                  <li className="flex items-center gap-2"><Star className="h-3.5 w-3.5 fill-warn text-warn" /> <b className="text-slate-800">{rating.toFixed(1)}</b>{p.rating_count != null ? <span className="text-slate-400">({p.rating_count} review{Number(p.rating_count) === 1 ? '' : 's'})</span> : null}</li>
                )}
              </ul>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1"><Tag className="h-3 w-3" /> Tags</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((t) => <span key={t} className="rounded-full bg-brand-50 text-brand-700 text-[11.5px] font-semibold px-2.5 py-1">{t}</span>)}
                  </div>
                </div>
              )}

              {/* Share — unified ShareBar (June 2026): FB, X, LinkedIn, WhatsApp, Telegram, Email, Copy + native sheet (Instagram) */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <ShareBar url={shareUrl} title={post.title || ''} label="Share this article" />
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-14 text-center">
          <ButtonLink href="/blog" variant="outline" size="md" className="rounded-full"><ArrowLeft className="h-4 w-4" /> All articles</ButtonLink>
        </div>
      </div>
    </section>
  );
}
