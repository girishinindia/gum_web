import { PageHero } from '@/components/ui/PageHero';
import { UpcomingWebinars } from '@/components/home/UpcomingWebinars';

export default function WebinarsPage() {
  return (
    <>
      <PageHero
        eyebrow="Live & Recorded Webinars"
        title={<>Hop on a <span className="text-gradient">free live class</span> this week</>}
        subtitle="Career roadmaps, hands-on coding, and Q&A with senior engineers — every Tue, Thu and weekend."
      />
      <UpcomingWebinars />
    </>
  );
}
