import { LegalPage } from '@/components/ui/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="01 May 2026"
      intro="Grow Up More respects your privacy. This policy describes what data we collect, how we use it, and the choices you have."
      sections={[
        { heading: 'Information we collect', body: ['When you register, we collect your name, email, mobile number, and educational background. When you enrol in a course, we additionally store your payment receipt and progress data.', 'Cookies and similar technologies are used to remember your login session and language preference. You can disable cookies in your browser but some features may stop working.'] },
        { heading: 'How we use your information', body: ['We use your information to deliver the courses you enrol in, to communicate with you about your account and progress, to issue certificates, and to share placement opportunities with you.', 'We do not sell your personal information to third parties. Aggregated, anonymised statistics may be shared with partners for industry research.'] },
        { heading: 'Data retention', body: ['Account data is retained while your account is active. You can request deletion at any time by emailing privacy@growupmore.com. Certificate records are retained for verification purposes for 7 years.'] },
        { heading: 'Your rights', body: ['You can access, correct or delete your personal data, withdraw consent, or restrict processing at any time. We respond to such requests within 30 days.'] },
        { heading: 'Contact', body: ['For any privacy questions, email privacy@growupmore.com or write to: Grow Up More, 4th floor, Tower B, Bengaluru — 560034.'] },
      ]}
    />
  );
}
