import { Metadata } from 'next';
import { brand } from '@/lib/brand';

export const siteConfig = {
  name: brand.name,
  nameEn: brand.nameEn,
  description: brand.description,
  descriptionEn: 'Lingoost is a web-first online course marketplace by Ludgi Inc. for seasonal course launches, HLS learning, seller dashboards, SEO, and manual payouts.',
  keywords: [
    '링구스트',
    'Lingoost',
    '럿지',
    '주식회사 럿지',
    '온라인 강의',
    '온라인 강의 플랫폼',
    '강의 플랫폼',
    '강의 판매',
    '강의 판매 플랫폼',
    '강의 등록',
    '강사 모집',
    '강의자 모집',
    '지식창업',
    '시즌제 강의',
    '코호트 강의',
    '수강 신청',
    '계좌입금 강의',
    'HLS 강의',
    '자막 강의',
    'AI 더빙 강의',
    '강의 SEO',
    '인프런 대안',
  ].join(', '),
  keywordsEn: 'Lingoost, Ludgi Inc., online courses, course marketplace, sell online courses, course creator marketplace, HLS learning, paid courses, creator education, cohort courses',
  url: brand.url,
  ogImage: '/opengraph-image',
  links: {
    youtube: 'https://www.youtube.com/@lingoost',
    twitter: 'https://x.com/lingoost',
  },
  creator: brand.creator,
  creatorEn: 'Ludgi Inc.',
  email: brand.supportEmail,
  phone: '+82-2-931-9310',
  address: {
    street: '인천광역시 연수구 인천타워대로 323',
    city: '인천',
    region: '인천광역시',
    postalCode: '22606',
    country: 'KR'
  }
};

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  path?: string;
  locale?: 'ko' | 'en' | 'ja' | 'zh';
  noIndex?: boolean;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

const metadataLocales = ['ko', 'en', 'ja', 'zh'] as const;

function stripLocaleFromPath(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const [first, ...rest] = cleanPath.split('/').filter(Boolean);
  if (first && (metadataLocales as readonly string[]).includes(first)) {
    return rest.length ? `/${rest.join('/')}` : '/';
  }
  return cleanPath;
}

function localizedPath(locale: string, cleanPath: string) {
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

export function generateSeoMetadata({
  title,
  description,
  keywords,
  ogImage,
  path = '/',
  locale = 'ko',
  noIndex = false,
  alternates
}: GenerateMetadataProps = {}): Metadata {
  const isKorean = locale === 'ko';
  const siteName = isKorean ? siteConfig.name : siteConfig.nameEn;
  const siteDescription = isKorean ? siteConfig.description : siteConfig.descriptionEn;
  const siteKeywords = isKorean ? siteConfig.keywords : siteConfig.keywordsEn;

  const pageTitle = title
    ? title.includes(siteName) || title.includes(siteConfig.nameEn)
      ? title
      : `${title} | ${siteName}`
    : `${siteName} - ${isKorean ? '온라인 교육 플랫폼' : 'Online Education Platform'}`;

  const pageDescription = description || siteDescription;
  const pageKeywords = keywords || siteKeywords;
  const pageOgImage = ogImage || siteConfig.ogImage;
  const cleanPath = stripLocaleFromPath(path);

  const url = `${siteConfig.url}${localizedPath(locale, cleanPath)}`;
  const canonicalUrl = alternates?.canonical || url;

  const languages = alternates?.languages || {
    'ko': `${siteConfig.url}${localizedPath('ko', cleanPath)}`,
    'en': `${siteConfig.url}${localizedPath('en', cleanPath)}`,
    'ja': `${siteConfig.url}${localizedPath('ja', cleanPath)}`,
    'zh': `${siteConfig.url}${localizedPath('zh', cleanPath)}`,
  };

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    authors: [{
      name: isKorean ? siteConfig.creator : siteConfig.creatorEn,
      url: siteConfig.url
    }],
    creator: isKorean ? siteConfig.creator : siteConfig.creatorEn,
    publisher: isKorean ? siteConfig.creator : siteConfig.creatorEn,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
      languages: languages,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: url,
      siteName: siteName,
      images: [
        {
          url: pageOgImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
      locale: getLocaleString(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      site: '@lingoost',
      creator: '@lingoost',
      images: [pageOgImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      nocache: false,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ? {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ? {
        'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
      } : undefined,
    } : undefined,
  };
}

function getLocaleString(locale: string): string {
  const localeMap: Record<string, string> = {
    'ko': 'ko_KR',
    'en': 'en_US',
    'ja': 'ja_JP',
    'zh': 'zh_CN',
  };
  return localeMap[locale] || 'ko_KR';
}

export function generateJsonLd(locale: 'ko' | 'en' | 'ja' | 'zh' = 'ko') {
  const isKorean = locale === 'ko';
  const siteName = isKorean ? siteConfig.name : siteConfig.nameEn;
  const siteDescription = isKorean ? siteConfig.description : siteConfig.descriptionEn;
  const url = `${siteConfig.url}${localizedPath(locale, '/')}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: url,
        name: siteName,
        description: siteDescription,
        publisher: {
          '@id': `${siteConfig.url}/#organization`
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${url}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        },
        inLanguage: getLocaleString(locale)
      },
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: isKorean ? siteConfig.creator : siteConfig.creatorEn,
        alternateName: siteName,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          '@id': `${siteConfig.url}/#logo`,
          url: `${siteConfig.url}/logo.png`,
          contentUrl: `${siteConfig.url}/logo.png`,
          width: 512,
          height: 512,
          caption: siteName
        },
        image: {
          '@id': `${siteConfig.url}/#logo`
        },
        description: siteDescription,
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address.street,
          addressLocality: siteConfig.address.city,
          addressRegion: siteConfig.address.region,
          postalCode: siteConfig.address.postalCode,
          addressCountry: siteConfig.address.country
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteConfig.phone,
          email: siteConfig.email,
          contactType: 'customer service',
          availableLanguage: ['Korean', 'English', 'Japanese', 'Chinese']
        },
        sameAs: [
          siteConfig.links.youtube,
          siteConfig.links.twitter
        ]
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${siteConfig.url}/#educationalorg`,
        name: siteName,
        description: siteDescription,
        url: url,
        logo: `${siteConfig.url}/logo.png`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address.street,
          addressLocality: siteConfig.address.city,
          addressRegion: siteConfig.address.region,
          postalCode: siteConfig.address.postalCode,
          addressCountry: siteConfig.address.country
        }
      }
    ]
  };
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
  locale: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
) {
  const baseUrl = `${siteConfig.url}${localizedPath(locale, '/')}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url === '/' ? '' : item.url}`
    }))
  };
}

export function generateCourseJsonLd(
  course: {
    name: string;
    description: string;
    provider: string;
    url: string;
    image?: string;
    price?: number;
    currency?: string;
    duration?: string;
    level?: string;
    keywords?: string[];
  },
  locale: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
) {
  const baseUrl = `${siteConfig.url}${localizedPath(locale, '/')}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    keywords: course.keywords?.join(', '),
    provider: {
      '@type': 'Organization',
      name: course.provider,
      sameAs: siteConfig.url
    },
    url: `${baseUrl}${course.url === '/' ? '' : course.url}`,
    image: course.image || siteConfig.ogImage,
    offers: course.price ? {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: course.currency || 'KRW',
      availability: 'https://schema.org/InStock'
    } : undefined,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      duration: course.duration,
      inLanguage: getLocaleString(locale)
    },
    educationalLevel: course.level
  };
}
