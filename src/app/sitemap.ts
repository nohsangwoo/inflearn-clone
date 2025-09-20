import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lingoost.com';
  const locales = ['ko', 'en', 'ja', 'zh'];
  const currentDate = new Date().toISOString();

  const routes = [
    {
      path: '',
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      path: '/courses',
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      path: '/login',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/me',
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      path: '/me/profile',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/me/courses',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/me/notifications',
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      path: '/me/likes',
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  routes.forEach(route => {
    locales.forEach(locale => {
      const url = locale === 'ko'
        ? `${baseUrl}${route.path}`
        : `${baseUrl}/${locale}${route.path}`;

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            ko: `${baseUrl}${route.path}`,
            en: `${baseUrl}/en${route.path}`,
            ja: `${baseUrl}/ja${route.path}`,
            zh: `${baseUrl}/zh${route.path}`,
          },
        },
      });
    });
  });

  return sitemapEntries;
}