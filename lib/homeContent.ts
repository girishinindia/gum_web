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

// ── Phase A — new home sections (static seed data) ──────────────────────

export const ANNOUNCEMENTS = [
  { id: 1, emoji: '🎉', text: 'New batches starting Monday — early-bird discount up to 40% off',  href: '/courses' },
  { id: 2, emoji: '🆕', text: 'Free Generative AI bootcamp this Saturday — register now',         href: '/webinars' },
  { id: 3, emoji: '🏆', text: '50,000+ learners placed across 250+ hiring partners',              href: '/about' },
];

export const UPCOMING_WEBINARS = [
  { id: 1, title: 'Generative AI for Beginners',     host: 'Aniket Rao',     date: 'Sat, 17 May',  time: '7:00 PM IST', duration: '60 min', tag: 'Free', cover: 'from-brand-600 to-accent' },
  { id: 2, title: 'Cloud & DevOps Career Roadmap',   host: 'Priya Iyer',     date: 'Sun, 18 May',  time: '11:00 AM IST', duration: '45 min', tag: 'Free', cover: 'from-emerald-600 to-brand-500' },
  { id: 3, title: 'Cracking the FAANG Interview',    host: 'Ravi Kumar',     date: 'Tue, 20 May',  time: '8:00 PM IST', duration: '90 min', tag: 'Premium', cover: 'from-violet-600 to-rose-500' },
  { id: 4, title: 'Data Science with Python (Live)', host: 'Anjali Sharma',  date: 'Thu, 22 May',  time: '6:30 PM IST', duration: '75 min', tag: 'Free', cover: 'from-amber-600 to-rose-500' },
];

export const BUNDLES = [
  {
    id: 1, slug: 'full-stack-pro-bundle', name: 'Full-Stack Pro Bundle',
    desc: 'MERN + DevOps + System Design — 4 courses, 1 capstone, 12 months access.',
    courseCount: 4, students: 3200, rating: 4.9,
    price: 59999, originalPrice: 129999, savePercent: 54,
    cover: 'from-brand-700 via-brand-600 to-brand-500',
  },
  {
    id: 2, slug: 'data-and-ai-career', name: 'Data & AI Career Pack',
    desc: 'Python · Pandas · ML · GenAI — end-to-end pipeline.',
    courseCount: 3, students: 2100, rating: 4.8,
    price: 49999, originalPrice: 99999, savePercent: 50,
    cover: 'from-emerald-700 via-emerald-600 to-brand-500',
  },
  {
    id: 3, slug: 'cyber-security-mastery', name: 'Cyber Security Mastery',
    desc: 'Networks + Web Sec + Ethical Hacking + SOC labs.',
    courseCount: 4, students: 980, rating: 4.7,
    price: 44999, originalPrice: 89999, savePercent: 50,
    cover: 'from-violet-700 via-rose-600 to-amber-500',
  },
];

export const FEATURED_INSTRUCTORS = [
  { id: 1, name: 'Aniket Rao',    title: 'Sr. ML Engineer · ex-Google',     courses: 8, students: '24k+', rating: 4.9, badge: 'Top Rated',  initial: 'AR', accent: 'from-brand-500 to-brand-700' },
  { id: 2, name: 'Anjali Sharma', title: 'Lead Data Scientist · Flipkart',  courses: 5, students: '18k+', rating: 4.9, badge: 'Bestseller', initial: 'AS', accent: 'from-rose-500 to-amber-500' },
  { id: 3, name: 'Ravi Kumar',    title: 'Staff Engineer · Razorpay',       courses: 6, students: '21k+', rating: 4.8, badge: 'Top Rated',  initial: 'RK', accent: 'from-emerald-500 to-brand-500' },
  { id: 4, name: 'Priya Iyer',    title: 'DevOps Architect · TCS',          courses: 4, students: '12k+', rating: 4.7, badge: 'Mentor',     initial: 'PI', accent: 'from-violet-500 to-brand-500' },
  { id: 5, name: 'Aditya Patel',  title: 'Sr. ML Engineer · Swiggy',        courses: 5, students: '15k+', rating: 4.8, badge: 'Bestseller', initial: 'AP', accent: 'from-amber-500 to-rose-500' },
  { id: 6, name: 'Neha Gupta',    title: 'Frontend Architect · Razorpay',   courses: 7, students: '19k+', rating: 4.9, badge: 'Top Rated',  initial: 'NG', accent: 'from-brand-600 to-accent' },
];

export const STUDENT_REVIEWS = [
  { id: 1, name: 'Rohan Mehta',     course: 'Data Science with Python', rating: 5, jump: '3.4×', date: '2 days ago',
    text: 'The Hindi explanations were a game-changer. Got a Data Analyst role at Flipkart within 4 months of finishing the course.', initial: 'R', helpful: 142 },
  { id: 2, name: 'Sneha Kapoor',    course: 'MERN Full Stack',          rating: 5, jump: '3.1×', date: '5 days ago',
    text: 'Live mentor reviews on every project pushed me to actually ship things. Hiring partner intro landed me 3 interviews.', initial: 'S', helpful: 98 },
  { id: 3, name: 'Karthik V',       course: 'Cloud & DevOps Essentials', rating: 5, jump: '2.8×', date: '1 week ago',
    text: 'Tamil-language labs made AWS so much easier. Already deploying production workloads at my new role.', initial: 'K', helpful: 87 },
  { id: 4, name: 'Ananya Reddy',    course: 'AI & Machine Learning Pro', rating: 5, jump: '3.6×', date: '2 weeks ago',
    text: 'Capstone project is what cracked the final interview for me. Real, end-to-end ML — not toy datasets.', initial: 'A', helpful: 154 },
  { id: 5, name: 'Vikram Singh',    course: 'Cyber Security Fundamentals', rating: 4, jump: '2.5×', date: '3 weeks ago',
    text: 'Hands-on labs are top notch. I would have liked more advanced modules but overall an excellent starting point.', initial: 'V', helpful: 64 },
  { id: 6, name: 'Pooja Nair',      course: 'Generative AI Builder',     rating: 5, jump: '4.0×', date: '1 month ago',
    text: 'Built a RAG-based product on the side that I now ship to clients. Course paid for itself in 6 weeks.', initial: 'P', helpful: 211 },
];

export const BLOG_POSTS = [
  {
    id: 1, slug: 'how-to-land-your-first-data-science-job',
    title: 'How to land your first Data Science job in India',
    excerpt: 'A practical 6-month roadmap with portfolio templates, interview prep, and salary negotiation scripts.',
    category: 'Career', readMin: 8, date: '12 May 2026', cover: 'from-brand-600 to-accent', author: 'Anjali Sharma',
  },
  {
    id: 2, slug: 'building-rag-agents-in-2026',
    title: 'Building RAG agents in 2026 — the production playbook',
    excerpt: 'Vector DBs, chunking strategies, evaluation, and deploying agents that actually work for paying customers.',
    category: 'AI / ML', readMin: 12, date: '08 May 2026', cover: 'from-violet-600 to-rose-500', author: 'Aniket Rao',
  },
  {
    id: 3, slug: 'cyber-security-careers-without-cs-degree',
    title: 'Cyber security careers without a CS degree',
    excerpt: 'Stories from 12 students who broke into security from non-tech backgrounds, plus the cert path that worked.',
    category: 'Career', readMin: 6, date: '02 May 2026', cover: 'from-emerald-600 to-brand-500', author: 'Priya Iyer',
  },
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
