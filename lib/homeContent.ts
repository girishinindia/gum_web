/**
 * Static content for home-page sections that don't have a backing API yet.
 * When `/homepage/*` endpoints land in gum_api, swap these out for fetches.
 */

export const TRUSTED_BY = [
  { name: 'Google',   logo: 'Google' },
  { name: 'Microsoft', logo: 'Microsoft' },
  { name: 'Amazon',   logo: 'Amazon' },
  { name: 'Meta',     logo: 'Meta' },
  { name: 'TCS',      logo: 'TCS' },
  { name: 'Infosys',  logo: 'Infosys' },
  { name: 'Wipro',    logo: 'Wipro' },
  { name: 'Accenture', logo: 'Accenture' },
];

export const HIRING_PARTNERS = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe', 'Netflix',
  'Flipkart', 'Swiggy', 'Zomato', 'Paytm', 'Razorpay', 'Freshworks',
];

export const HERO_STATS = [
  { value: '50K+',  label: 'Learners' },
  { value: '60+',   label: 'Courses' },
  { value: '95%',   label: 'Placement' },
];

export const STATS_TILES = [
  { target: 50000, label: 'Students',       suffix: '+' },
  { target: 60,    label: 'Courses',        suffix: '+' },
  { target: 250,   label: 'Hiring partners',suffix: '+' },
  { target: 95,    label: 'Placement rate', suffix: '%' },
  { target: 12,    label: 'Languages',      suffix: '+' },
  { target: 4.9,   label: 'Avg rating',     suffix: '/5', isFloat: true },
];

export const HOW_IT_WORKS = [
  { step: 1, title: 'Explore courses',    desc: 'Browse 60+ industry-grade IT programs across 12+ Indian languages.' },
  { step: 2, title: 'Enrol in minutes',   desc: 'Pick a course, pay securely, and join the next live batch immediately.' },
  { step: 3, title: 'Learn with mentors', desc: 'Live classes, real projects, weekly assignments and instant doubt-solving.' },
  { step: 4, title: 'Get placed',         desc: '95% placement rate across 250+ hiring partners — interview prep included.' },
];

export const FEATURES = [
  { num: '01', title: 'Multilingual lessons',  desc: 'Every course is taught in Hindi, English and 10+ regional languages.', icon: 'Languages' },
  { num: '02', title: 'Placement assistance',  desc: 'Mock interviews, resume reviews and direct intros to hiring partners.', icon: 'Briefcase' },
  { num: '03', title: 'Industry-grade pricing',desc: 'Programs from ₹20,000 with EMI options — built for accessibility.',  icon: 'IndianRupee' },
  { num: '04', title: 'Real-world projects',   desc: 'Build a portfolio of 4–6 production-grade projects per course.',     icon: 'Hammer' },
  { num: '05', title: 'Live mentor support',   desc: 'Daily doubt sessions, 1:1 reviews and a private community channel.', icon: 'MessageSquare' },
  { num: '06', title: 'Verified certificate',  desc: 'Blockchain-verified certificates with QR-code-based authenticity.',  icon: 'BadgeCheck' },
];

export const TESTIMONIALS = [
  {
    name: 'Anjali Sharma',     role: 'Data Analyst @ Flipkart',  course: 'Data Science with Python',
    salaryBefore: '₹3.5L',     salaryAfter: '₹12L',               jump: '3.4×',
    quote: 'The course was 100% in Hindi which made tough concepts so much easier. Within 4 months of completing it I landed my dream role.',
    avatar: 'A',
  },
  {
    name: 'Ravi Kumar',        role: 'Full-Stack Dev @ Razorpay', course: 'MERN Full Stack',
    salaryBefore: '₹4.2L',     salaryAfter: '₹14L',               jump: '3.3×',
    quote: 'Live mentor reviews on every project made a huge difference. The hiring partner intro was the cherry on top.',
    avatar: 'R',
  },
  {
    name: 'Priya Iyer',        role: 'Cloud Engineer @ TCS',      course: 'Cloud & DevOps',
    salaryBefore: '₹3L',       salaryAfter: '₹10L',               jump: '3.3×',
    quote: 'Came in with zero IT background. The step-by-step labs and Tamil-language explainers got me production-ready.',
    avatar: 'P',
  },
  {
    name: 'Aditya Patel',      role: 'ML Engineer @ Swiggy',      course: 'AI & Machine Learning',
    salaryBefore: '₹5L',       salaryAfter: '₹18L',               jump: '3.6×',
    quote: 'The capstone project I shipped here is what got me through the final round. Real, end-to-end ML — not toy datasets.',
    avatar: 'A',
  },
];

export const HEADER_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/about',   label: 'About'   },
  { href: '/team',    label: 'Team'    },
  { href: '/faq',     label: 'FAQs'    },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];

export const FOOTER_COLUMNS = [
  {
    heading: 'Courses',
    links: [
      { label: 'Data Science',    href: '/courses?category=data-science' },
      { label: 'AI & ML',         href: '/courses?category=ai-ml' },
      { label: 'Full Stack',      href: '/courses?category=full-stack' },
      { label: 'Cyber Security',  href: '/courses?category=cyber-security' },
      { label: 'Cloud & DevOps',  href: '/courses?category=cloud-devops' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',       href: '/about' },
      { label: 'Careers',     href: '/careers' },
      { label: 'Team',        href: '/team' },
      { label: 'All Courses', href: '/courses' },
      { label: 'Contact',     href: '/contact' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Centre',     href: '/help' },
      { label: 'Privacy Policy',  href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy',   href: '/refund' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
];
