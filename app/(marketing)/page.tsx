import { Hero }               from '@/components/home/Hero';
import { TrustedStrip }       from '@/components/home/TrustedStrip';
import { Categories }         from '@/components/home/Categories';
import { StatsCounter }       from '@/components/home/StatsCounter';
import { HowItWorks }         from '@/components/home/HowItWorks';
import { UpcomingWebinars }   from '@/components/home/UpcomingWebinars';
import { PopularCourses }     from '@/components/home/PopularCourses';
import { Features }           from '@/components/home/Features';
import { Bundles }            from '@/components/home/Bundles';
import { Instructors }        from '@/components/home/Instructors';
import { CertificatePreview } from '@/components/home/CertificatePreview';
import { StudentReviews }     from '@/components/home/StudentReviews';
import { LatestBlog }         from '@/components/home/LatestBlog';
import { Podcasts }           from '@/components/home/Podcasts';
import { FAQ }                from '@/components/home/FAQ';
import { Newsletter }         from '@/components/home/Newsletter';
import { CTA }                from '@/components/home/CTA';
import { LanguagesBanner }    from '@/components/home/LanguagesBanner';
import { JsonLd }             from '@/components/seo/JsonLd';
import { organizationLd, websiteLd, faqLd } from '@/lib/jsonld';
import { api }                from '@/lib/api';

export const revalidate = 300;

export default async function HomePage() {
  const [faqs, webinars, bundles, instructors, blogPosts, podcasts, vis, home] = await Promise.all([
    api.faqs(),
    api.upcomingWebinars(),
    api.featuredBundles(),
    api.featuredInstructors(),
    api.latestBlogPosts(),
    api.latestPodcasts(),
    api.sectionVisibility(),
    api.homePage(),
  ]);

  /** Helper: section shows unless explicitly toggled off (defaults visible). */
  const show = (key: string) => vis?.[key] !== false;

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      {faqs && faqs.length > 0 && <JsonLd data={faqLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />}
      <Hero cms={home} />
      <TrustedStrip />
      {show('categories')      && <Categories />}
      {show('stats')           && <StatsCounter tiles={home?.stats_tiles ?? undefined} />}
      {show('how_it_works')    && <HowItWorks cms={home} />}
      {show('webinars')        && <UpcomingWebinars data={webinars} />}
      {show('languages')       && <LanguagesBanner />}
      {show('courses')         && <PopularCourses />}
      {show('features')        && <Features cms={home} />}
      {show('bundles')         && <Bundles data={bundles} />}
      {show('instructors')     && <Instructors data={instructors} />}
      {show('certificate')     && <CertificatePreview />}
      {show('student_reviews') && <StudentReviews />}
      {show('blogs')           && <LatestBlog data={blogPosts} />}
      {show('podcasts')        && <Podcasts data={podcasts} />}
      {show('faq')             && <FAQ items={faqs && faqs.length > 0 ? faqs.map((f) => ({ question: f.question, answer: f.answer })) : undefined} />}
      {show('newsletter')      && <Newsletter cms={home} />}
      {show('cta')             && <CTA cms={home} />}
    </>
  );
}
