/**
 * Static UI translations for chrome strings.
 *
 * What lives here:
 *   • Header / secondary nav / footer labels
 *   • Hero static copy
 *   • Common CTAs and microcopy
 *
 * What does NOT live here:
 *   • Course names, blog titles, sub-category names — those come from the API.
 *
 * Adding a new language:
 *   1. Copy the `en` block, translate the strings.
 *   2. Add the ISO code as a top-level key.
 *   3. Make sure the language has `for_material = true` in the API so it
 *      shows up in the language switcher.
 *
 * Missing keys fall back to English at lookup time (see `useT.ts`).
 */

// Shape of the dictionary — English is the source of truth, every locale
// satisfies this interface so missing keys can be safely deep-merged in.
export interface Messages {
  nav: {
    courses: string; about: string; team: string;
    faqs: string;    careers: string; contact: string;
  };
  secondary: {
    bundles: string;       webinars: string;     liveSessions: string;   batches: string;
    blogs: string;         discussion: string;   instructors: string;    reviews: string;
    announcements: string;
  };
  common: {
    login: string;  signup: string;  logout: string;  menu: string;
    search: string; searchHint: string;
    allCourses: string;  viewAll: string;  seeAllWebinars: string;
    allBundles: string;  allInstructors: string; allArticles: string;
    browseCategories: string;
    explore: string;  watchDemo: string;  reserve: string;
    addToCart: string;  buyNow: string;  enroll: string;
    readMore: string; continue: string; next: string; previous: string;
    tagline: string;
  };
  hero: {
    badgeNew: string; badgeHot: string;
    titleA: string;   titleB: string;   titleC: string;
    titleD: string;   titleE: string;
    desc: string;
    stat1Label: string; stat2Label: string; stat3Label: string;
  };
  sections: {
    categoriesEyebrow: string; categoriesTitle: string; categoriesDesc: string;
    bundlesEyebrow: string;    webinarsEyebrow: string;  instructorsEyebrow: string;
    reviewsEyebrow: string;    blogEyebrow: string;      featuresEyebrow: string;
    faqEyebrow: string;        faqTitle: string;
    newsletterEyebrow: string; certificateEyebrow: string;
    partnersEyebrow: string;   howEyebrow: string;
  };
  footer: {
    coursesHeading: string; companyHeading: string; supportHeading: string;
    privacy: string; terms: string; refund: string;
    rights: string; brandDesc: string;
  };
}

export type SupportedLocale = 'en' | 'hi';

export const MESSAGES: Record<SupportedLocale, Messages> = {
  en: {
    nav: {
      courses:  'Courses',
      about:    'About',
      team:     'Team',
      faqs:     'FAQs',
      careers:  'Careers',
      contact:  'Contact',
    },
    secondary: {
      bundles:       'Course Bundles',
      webinars:      'Webinars',
      liveSessions:  'Live Sessions',
      batches:       'Course Batches',
      blogs:         'Blogs',
      discussion:    'Discussion',
      instructors:   'Instructors',
      reviews:       'Reviews',
      announcements: 'Announcements',
    },
    common: {
      login:           'Login',
      signup:          'Sign up',
      logout:          'Log out',
      menu:            'Menu',
      search:          'Search',
      searchHint:      'Search courses — Python, AI, Full Stack, Cyber Security…',
      allCourses:      'All courses',
      viewAll:         'View all',
      seeAllWebinars:  'See all webinars',
      allBundles:      'All bundles',
      allInstructors:  'All instructors',
      allArticles:     'All articles',
      browseCategories:'Browse Categories',
      explore:         'Explore Courses',
      watchDemo:       'Watch Demo',
      reserve:         'Reserve seat',
      addToCart:       'Add to cart',
      buyNow:          'Buy now',
      enroll:          'Enroll',
      readMore:        'Read more',
      continue:        'Continue',
      next:            'Next',
      previous:        'Previous',
      tagline:         "Don't just learn, apply!",
    },
    hero: {
      badgeNew:    'New Batches Starting Soon',
      badgeHot:    'HOT',
      titleA:      'Master the',
      titleB:      'IT Skills',
      titleC:      'That',
      titleD:      'Launch Real',
      titleE:      'Careers.',
      desc:        'Industry-ready courses across 20+ tech domains — Data Science, AI/ML, Cyber Security, Full Stack & more. Learn in your language, land your dream job.',
      stat1Label:  'Students',
      stat2Label:  'Placement',
      stat3Label:  'Rating',
    },
    sections: {
      categoriesEyebrow:  'Browse Categories',
      categoriesTitle:    'Explore Our Course Categories',
      categoriesDesc:     'From AI to Cyber Security — find the perfect course for your career goals.',
      bundlesEyebrow:     'Bundles & Savings',
      webinarsEyebrow:    'Upcoming Webinars',
      instructorsEyebrow: 'Meet the Instructors',
      reviewsEyebrow:     'Real Student Reviews',
      blogEyebrow:        'Latest from the Blog',
      featuresEyebrow:    'Why Us',
      faqEyebrow:         'FAQ',
      faqTitle:           'Frequently Asked Questions',
      newsletterEyebrow:  'Stay in the loop',
      certificateEyebrow: 'Certificate',
      partnersEyebrow:    'Hiring Partners',
      howEyebrow:         'How It Works',
    },
    footer: {
      coursesHeading:  'Courses',
      companyHeading:  'Company',
      supportHeading:  'Support',
      privacy:         'Privacy',
      terms:           'Terms',
      refund:          'Refund',
      rights:          'All rights reserved.',
      brandDesc:       "Empowering India's next generation of tech professionals through accessible, multilingual, job-oriented IT education.",
    },
  },

  hi: {
    nav: {
      courses:  'कोर्स',
      about:    'हमारे बारे में',
      team:     'टीम',
      faqs:     'सामान्य प्रश्न',
      careers:  'करियर',
      contact:  'संपर्क',
    },
    secondary: {
      bundles:       'कोर्स बंडल',
      webinars:      'वेबिनार',
      liveSessions:  'लाइव सत्र',
      batches:       'कोर्स बैच',
      blogs:         'ब्लॉग',
      discussion:    'चर्चा',
      instructors:   'प्रशिक्षक',
      reviews:       'समीक्षाएँ',
      announcements: 'घोषणाएँ',
    },
    common: {
      login:           'लॉगिन',
      signup:          'साइन अप',
      logout:          'लॉग आउट',
      menu:            'मेन्यू',
      search:          'खोजें',
      searchHint:      'कोर्स खोजें — Python, AI, Full Stack, Cyber Security…',
      allCourses:      'सभी कोर्स',
      viewAll:         'सभी देखें',
      seeAllWebinars:  'सभी वेबिनार देखें',
      allBundles:      'सभी बंडल',
      allInstructors:  'सभी प्रशिक्षक',
      allArticles:     'सभी लेख',
      browseCategories:'श्रेणियाँ देखें',
      explore:         'कोर्स देखें',
      watchDemo:       'डेमो देखें',
      reserve:         'सीट बुक करें',
      addToCart:       'कार्ट में जोड़ें',
      buyNow:          'अभी खरीदें',
      enroll:          'दाखिला लें',
      readMore:        'और पढ़ें',
      continue:        'जारी रखें',
      next:            'अगला',
      previous:        'पिछला',
      tagline:         'सिर्फ़ सीखो मत — लागू करो!',
    },
    hero: {
      badgeNew:    'नए बैच जल्द शुरू',
      badgeHot:    'हॉट',
      titleA:      'सीखें वो',
      titleB:      'IT स्किल्स',
      titleC:      'जो बनाएँ',
      titleD:      'असली करियर ।',
      titleE:      '',
      desc:        '20+ टेक डोमेन में इंडस्ट्री-रेडी कोर्स — Data Science, AI/ML, Cyber Security, Full Stack और भी बहुत कुछ। अपनी भाषा में सीखें, सपनों की नौकरी पाएँ।',
      stat1Label:  'छात्र',
      stat2Label:  'प्लेसमेंट',
      stat3Label:  'रेटिंग',
    },
    sections: {
      categoriesEyebrow:  'श्रेणियाँ देखें',
      categoriesTitle:    'हमारी कोर्स श्रेणियाँ देखें',
      categoriesDesc:     'AI से Cyber Security तक — अपने करियर के लिए सही कोर्स ढूँढें।',
      bundlesEyebrow:     'बंडल और बचत',
      webinarsEyebrow:    'आगामी वेबिनार',
      instructorsEyebrow: 'हमारे प्रशिक्षकों से मिलें',
      reviewsEyebrow:     'असली छात्र समीक्षाएँ',
      blogEyebrow:        'ब्लॉग से नवीनतम',
      featuresEyebrow:    'हम क्यों',
      faqEyebrow:         'सामान्य प्रश्न',
      faqTitle:           'अक्सर पूछे जाने वाले प्रश्न',
      newsletterEyebrow:  'जुड़े रहें',
      certificateEyebrow: 'प्रमाणपत्र',
      partnersEyebrow:    'हायरिंग पार्टनर',
      howEyebrow:         'यह कैसे काम करता है',
    },
    footer: {
      coursesHeading:  'कोर्स',
      companyHeading:  'कंपनी',
      supportHeading:  'सहायता',
      privacy:         'गोपनीयता',
      terms:           'नियम',
      refund:          'रिफंड',
      rights:          'सर्वाधिकार सुरक्षित।',
      brandDesc:       'सुलभ, बहुभाषी, रोज़गार-उन्मुख IT शिक्षा के माध्यम से भारत की अगली पीढ़ी के टेक प्रोफेशनल्स को सशक्त बनाना।',
    },
  },
};
