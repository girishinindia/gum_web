import type { CatalogConfig } from './CatalogView';

/**
 * Per-content-type catalog configurations.
 * Courses is the multi-type catalog; single-type pages set `fixedType` so the
 * shared <CatalogView/> locks to that type and shows only its filters.
 *
 * Note: category filtering for blog/podcasts is deferred — it needs a
 * per-type category source (blog uses its own taxonomy) wired into CatalogView.
 */
export const coursesConfig: CatalogConfig = {
  basePath: '/courses',
  searchPlaceholder: 'Search courses…',
  showCategory: true,
  hero: {
    eyebrow: 'All Courses',
    title: (
      <>Find the program that <span className="text-gradient">fits your career goal</span></>
    ),
    subtitle: 'Industry-grade courses across multiple categories. Filter, compare, enroll.',
  },
};

export const bundlesConfig: CatalogConfig = {
  basePath: '/bundles',
  searchPlaceholder: 'Search bundles…',
  fixedType: 'bundles',
  hero: {
    eyebrow: 'Career Bundles',
    title: (
      <>Buy a <span className="text-gradient">whole career path</span>, not just a course</>
    ),
    subtitle: 'Multi-course bundles built around specific career outcomes — saves you up to 54%.',
  },
};

export const webinarsConfig: CatalogConfig = {
  basePath: '/webinars',
  searchPlaceholder: 'Search webinars by title or code…',
  fixedType: 'webinars',
  hero: {
    eyebrow: 'Live & Recorded Webinars',
    title: (
      <>Hop on a <span className="text-gradient">free live class</span> this week</>
    ),
    subtitle: 'Career roadmaps, hands-on coding, and Q&A with senior engineers — every Tue, Thu and weekend.',
  },
};

export const instructorsConfig: CatalogConfig = {
  basePath: '/instructors',
  searchPlaceholder: 'Search instructors…',
  fixedType: 'instructors',
  hero: {
    eyebrow: 'Meet our Mentors',
    title: (
      <>Learn from people who <span className="text-gradient">ship real things</span></>
    ),
    subtitle: 'Senior engineers, scientists and designers from Google, Razorpay, Flipkart, TCS, and more.',
  },
};

export const blogConfig: CatalogConfig = {
  basePath: '/blog',
  searchPlaceholder: 'Search articles by title, author or topic…',
  fixedType: 'blogs',
  hero: {
    eyebrow: 'The Grow Up More Blog',
    title: (
      <>Career playbooks &amp; <span className="text-gradient">deep technical reads</span></>
    ),
    subtitle: 'Written by our mentors and recent placements — actionable, opinionated and free.',
  },
};

export const podcastsConfig: CatalogConfig = {
  basePath: '/podcasts',
  searchPlaceholder: 'Search podcasts…',
  fixedType: 'podcasts',
  hero: {
    eyebrow: 'Podcasts',
    title: (
      <>Listen &amp; learn <span className="text-gradient">on the go</span></>
    ),
    subtitle: 'Bite-sized episodes on careers, tech trends and behind-the-scenes from our instructors.',
  },
};

export const liveSessionsConfig: CatalogConfig = {
  basePath: '/live-sessions',
  searchPlaceholder: 'Search sessions by title or topic…',
  fixedType: 'live_sessions',
  hero: {
    eyebrow: 'Live Sessions',
    title: (
      <>Real-time learning with <span className="text-gradient">industry experts</span></>
    ),
    subtitle: 'Join interactive live sessions, ask questions, and learn alongside a community of peers.',
  },
};

export const batchesConfig: CatalogConfig = {
  basePath: '/batches',
  searchPlaceholder: 'Search batches…',
  fixedType: 'batches',
  hero: {
    eyebrow: 'Course Batches',
    title: (
      <>Join a <span className="text-gradient">live cohort</span></>
    ),
    subtitle: 'Structured, time-boxed batches with a start date, peers and mentor support.',
  },
};
