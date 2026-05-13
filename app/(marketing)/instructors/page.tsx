import { PageHero } from '@/components/ui/PageHero';
import { Instructors } from '@/components/home/Instructors';

export default function InstructorsListPage() {
  return (
    <>
      <PageHero
        eyebrow="Meet our Mentors"
        title={<>Learn from people who <span className="text-gradient">ship real things</span></>}
        subtitle="Senior engineers, scientists and designers from Google, Razorpay, Flipkart, TCS, and more."
      />
      <Instructors />
    </>
  );
}
