import { PageHero } from '@/components/ui/PageHero';
import { Bundles }  from '@/components/home/Bundles';

export default function BundlesPage() {
  return (
    <>
      <PageHero
        eyebrow="Career Bundles"
        title={<>Buy a <span className="text-gradient">whole career path</span>, not just a course</>}
        subtitle="Multi-course bundles built around specific career outcomes — saves you up to 54%."
      />
      <Bundles />
    </>
  );
}
