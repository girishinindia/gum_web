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
import { HiringPartners }     from '@/components/home/HiringPartners';
import { StudentReviews }     from '@/components/home/StudentReviews';
import { LatestBlog }         from '@/components/home/LatestBlog';
import { Podcasts }           from '@/components/home/Podcasts';
import { FAQ }                from '@/components/home/FAQ';
import { Newsletter }         from '@/components/home/Newsletter';
import { CTA }                from '@/components/home/CTA';
import { LanguagesBanner }    from '@/components/home/LanguagesBanner';
import { api }                from '@/lib/api';

export const revalidate = 300;

export default async function HomePage() {
  const [faqs, webinars, bundles, instructors, blogPosts, podcasts] = await Promise.all([
    api.faqs(),
    api.upcomingWebinars(),
    api.featuredBundles(),
    api.featuredInstructors(),
    api.latestBlogPosts(),
    api.latestPodcasts(),
  ]);
  return (
    <>
      <Hero />
      <TrustedStrip />
      <Categories />
      <StatsCounter />
      <HowItWorks />
      <UpcomingWebinars data={webinars} />
      <PopularCourses />
      <Features />
      <Bundles data={bundles} />
      <Instructors data={instructors} />
      <CertificatePreview />
      <HiringPartners />
      <StudentReviews />
      <LatestBlog data={blogPosts} />
      <Podcasts data={podcasts} />
      <FAQ items={faqs && faqs.length > 0 ? faqs.map((f) => ({ question: f.question, answer: f.answer })) : undefined} />
      <Newsletter />
      <CTA />
      <LanguagesBanner />
    </>
  );
}
