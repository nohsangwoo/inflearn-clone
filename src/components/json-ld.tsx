'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { generateJsonLd, generateBreadcrumbJsonLd, generateCourseJsonLd } from '@/lib/seo-metadata';

interface JsonLdProps {
  type?: 'website' | 'breadcrumb' | 'course';
  locale?: 'ko' | 'en' | 'ja' | 'zh';
  breadcrumbItems?: Array<{ name: string; url: string }>;
  courseData?: {
    name: string;
    description: string;
    provider: string;
    url: string;
    image?: string;
    price?: number;
    currency?: string;
    duration?: string;
    level?: string;
  };
}

export function JsonLd({
  type = 'website',
  locale = 'ko',
  breadcrumbItems,
  courseData
}: JsonLdProps) {
  const pathname = usePathname();

  let jsonLdData;

  switch (type) {
    case 'breadcrumb':
      if (!breadcrumbItems) {
        const defaultItems = [
          { name: locale === 'ko' ? '홈' : 'Home', url: '/' }
        ];

        if (pathname.includes('/course')) {
          defaultItems.push({
            name: locale === 'ko' ? '강의' : 'Courses',
            url: '/courses'
          });
        }

        jsonLdData = generateBreadcrumbJsonLd(defaultItems, locale);
      } else {
        jsonLdData = generateBreadcrumbJsonLd(breadcrumbItems, locale);
      }
      break;

    case 'course':
      if (courseData) {
        jsonLdData = generateCourseJsonLd(courseData, locale);
      }
      break;

    default:
      jsonLdData = generateJsonLd(locale);
      break;
  }

  if (!jsonLdData) return null;

  return (
    <Script
      id={`json-ld-${type}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLdData),
      }}
    />
  );
}