import { LegalPage } from '@/components/ui/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="01 May 2026"
      intro="By using growupmore.com, you agree to these terms. Please read them carefully."
      sections={[
        { heading: 'Acceptance of terms', body: ['These terms govern your use of Grow Up More\'s website, mobile app and learning platform. By creating an account or enrolling in a course, you accept these terms in full.'] },
        { heading: 'Use of the platform', body: ['You agree to use the platform only for lawful purposes and in a manner consistent with all applicable laws. You will not share your account credentials, redistribute course material, or attempt to reverse-engineer the platform.'] },
        { heading: 'Payments &amp; refunds', body: ['All payments are processed in Indian Rupees through PCI-compliant gateways. Refund eligibility is described in our Refund Policy.'] },
        { heading: 'Intellectual property', body: ['All course content — videos, slides, assignments, code — is the intellectual property of Grow Up More or our instructors. You receive a non-exclusive, non-transferable licence to access them for personal learning.'] },
        { heading: 'Limitation of liability', body: ['Grow Up More provides educational content and placement assistance, but does not guarantee employment outcomes. Our total liability is limited to the amount you paid for the course in question.'] },
        { heading: 'Changes to these terms', body: ['We may update these terms occasionally. We\'ll notify you of material changes via email at least 14 days in advance.'] },
      ]}
    />
  );
}
