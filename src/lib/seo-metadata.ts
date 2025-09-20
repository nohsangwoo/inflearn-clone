import { Metadata } from 'next';

export const siteConfig = {
  name: '링구스트',
  nameEn: 'Lingoost',
  description: '스타트업부터 대기업까지, 각 비즈니스 단계에 맞는 최적의 온라인 교육 솔루션을 제공합니다',
  descriptionEn: 'Providing optimal online education solutions for each business stage, from startups to large enterprises',
  keywords: '온라인 강의, 인프런, 교육 플랫폼, 링구스트, Lingoost, 프로그래밍 교육, IT 교육',
  keywordsEn: 'online courses, education platform, Lingoost, programming education, IT education',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lingoost.com',
  ogImage: '/og-image.png',
  links: {
    youtube: 'https://www.youtube.com/@lingoost',
    twitter: 'https://x.com/lingoost_official',
  },
  creator: '주식회사 럿지',
  creatorEn: 'Ludgi Inc.',
  email: 'contact@lingoost.com',
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
    ? `${title} | ${siteName}`
    : `${siteName} - ${isKorean ? '온라인 교육 플랫폼' : 'Online Education Platform'}`;

  const pageDescription = description || siteDescription;
  const pageKeywords = keywords || siteKeywords;
  const pageOgImage = ogImage || siteConfig.ogImage;

  const url = `${siteConfig.url}${locale !== 'ko' ? `/${locale}` : ''}${path}`;
  const canonicalUrl = alternates?.canonical || url;

  const languages = alternates?.languages || {
    'ko': `${siteConfig.url}${path}`,
    'en': `${siteConfig.url}/en${path}`,
    'ja': `${siteConfig.url}/ja${path}`,
    'zh': `${siteConfig.url}/zh${path}`,
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
      site: '@lingoost_official',
      creator: '@lingoost_official',
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
  const url = `${siteConfig.url}${locale !== 'ko' ? `/${locale}` : ''}`;

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
  const baseUrl = `${siteConfig.url}${locale !== 'ko' ? `/${locale}` : ''}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`
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
  },
  locale: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
) {
  const baseUrl = `${siteConfig.url}${locale !== 'ko' ? `/${locale}` : ''}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider,
      sameAs: siteConfig.url
    },
    url: `${baseUrl}${course.url}`,
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