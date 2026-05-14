import { MetadataRoute } from 'next';
import { desc, eq } from 'drizzle-orm';
import { db, lectures } from '@/db';
import { brand } from '@/lib/brand';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = brand.url;
  const locales = ['ko', 'en', 'ja', 'zh'];
  const currentDate = new Date().toISOString();

  const routes = [
    {
      path: '',
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    { path: '/company', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  routes.forEach(route => {
    locales.forEach(locale => {
      const url = `${baseUrl}/${locale}${route.path}`;

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            ko: `${baseUrl}/ko${route.path}`,
            en: `${baseUrl}/en${route.path}`,
            ja: `${baseUrl}/ja${route.path}`,
            zh: `${baseUrl}/zh${route.path}`,
          },
        },
      });
    });
  });

  try {
    const courses = await db
      .select({ id: lectures.id, updatedAt: lectures.updatedAt })
      .from(lectures)
      .where(eq(lectures.isActive, true))
      .orderBy(desc(lectures.updatedAt))
      .limit(5000);

    courses.forEach((course) => {
      locales.forEach((locale) => {
        const path = `/course/${course.id}`;
        sitemapEntries.push({
          url: `${baseUrl}/${locale}${path}`,
          lastModified: course.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              ko: `${baseUrl}/ko${path}`,
              en: `${baseUrl}/en${path}`,
              ja: `${baseUrl}/ja${path}`,
              zh: `${baseUrl}/zh${path}`,
            },
          },
        });
      });
    });
  } catch {
    // Keep builds and crawlers resilient when the database is temporarily unavailable.
  }

  return sitemapEntries;
}
