import { LegalPage } from '@/components/ui/LegalPage';

export default function RefundPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      updated="01 May 2026"
      intro="We want you to be happy with your course. Here's how refunds work."
      sections={[
        { heading: '7-day no-questions refund', body: ['You can request a full refund within 7 days of enrolment, as long as you have not completed more than 25% of the course content. No questions asked.'] },
        { heading: 'How to request', body: ['Email refund@growupmore.com from your registered email with your order ID. Refunds are processed to the original payment method within 7 working days.'] },
        { heading: 'Non-refundable items', body: ['Bundles, live webinars and one-on-one mentor sessions are non-refundable after attendance. Certificate processing fees are non-refundable once a certificate has been issued.'] },
        { heading: 'Cohort transfers', body: ['If your circumstances change, you can transfer your enrolment to the next batch once, free of charge. Transfers requested less than 7 days before the batch start incur a 10% admin fee.'] },
      ]}
    />
  );
}
