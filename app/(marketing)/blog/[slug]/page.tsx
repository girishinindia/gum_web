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
import { SITE } from '@/lib/seo';

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
  const post = await api.blogById(slug).catch(() => null);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.title || 'Article',
    description: post.excerpt || '',
    openGraph: { title: post.title || '', description: post.excerpt || '', images: post.featured_image_url ? [{ url: post.featured_image_url }] : [], type: 'article' },
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

              {/* Share */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Share this article</div>
                <div className="mt-2 flex items-center gap-2">
                  <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.547 4.098 1.504 5.828L0 24l6.335-1.652A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.894 0-3.686-.508-5.233-1.44l-.375-.223-3.885 1.018 1.036-3.784-.245-.39A9.706 9.706 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75z"/></svg>
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                </div>
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
