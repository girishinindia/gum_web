import { Header }             from '@/components/layout/Header';
import { Footer }             from '@/components/layout/Footer';
import { Hero }               from '@/components/home/Hero';
import { TrustedStrip }       from '@/components/home/TrustedStrip';
import { Categories }         from '@/components/home/Categories';
import { StatsCounter }       from '@/components/home/StatsCounter';
import { HowItWorks }         from '@/components/home/HowItWorks';
import { PopularCourses }     from '@/components/home/PopularCourses';
import { Features }           from '@/components/home/Features';
import { CertificatePreview } from '@/components/home/CertificatePreview';
import { HiringPartners }     from '@/components/home/HiringPartners';
import { Testimonials }       from '@/components/home/Testimonials';
import { FAQ }                from '@/components/home/FAQ';
import { Newsletter }         from '@/components/home/Newsletter';
import { CTA }                from '@/components/home/CTA';
import { LanguagesBanner }    from '@/components/home/LanguagesBanner';
import { api }                from '@/lib/api';

export const revalidate = 300; // 5 min ISR for the home page as a whole

export default async function HomePage() {
  // Prefetch FAQ items on the server for SEO + first-paint speed.
  const faqs = await api.faqs();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustedStrip />
        <Categories />
        <StatsCounter />
        <HowItWorks />
        <PopularCourses />
        <Features />
        <CertificatePreview />
        <HiringPartners />
        <Testimonials />
        <FAQ items={faqs && faqs.length > 0 ? faqs.map((f) => ({ question: f.question, answer: f.answer })) : undefined} />
        <Newsletter />
        <CTA />
        <LanguagesBanner />
      </main>
      <Footer />
    </>
  );
}
