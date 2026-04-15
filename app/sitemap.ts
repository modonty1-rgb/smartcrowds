import { MetadataRoute } from 'next';
import { routing } from '@/lib/routing';
import { getPosts } from '@/app/actions/blog/actions';
import { getProjects } from '@/app/actions/project/actions';
import { listEvents } from '@/app/actions/events/actions';

const BASE_URL = 'https://www.smartcrowdme.com';

const STATIC_ROUTES = ['', '/about', '/services', '/events', '/projects', '/blog', '/contact'];

type WithTimestamps = {
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
  date?: Date | string | null;
};

const toDate = (value: WithTimestamps[keyof WithTimestamps] | Date | string | number | null | undefined) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? new Date() : parsed;
};

const buildAlternateLanguages = (path: string) =>
  Object.fromEntries(routing.locales.map((locale) => [locale, `${BASE_URL}/${locale}${path}`]));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const locales = routing.locales;
  const now = new Date();

  // Static routes
  locales.forEach((locale) => {
    STATIC_ROUTES.forEach((route) => {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === '' ? 'daily' : route === '/blog' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
        alternates: { languages: buildAlternateLanguages(route) },
      });
    });
  });

  // Events (published only)
  const events = await listEvents();
  events
    .filter((event: { published?: boolean | null }) => event.published === true)
    .forEach((event) => {
      locales.forEach((locale) => {
        const path = `/events/${event.id}`;
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified: toDate((event as WithTimestamps).updatedAt ?? event.date ?? (event as WithTimestamps).createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: { languages: buildAlternateLanguages(path) },
        });
      });
    });

  // Blog posts & projects per locale
  for (const locale of locales) {
    const [postResult, projectResult] = await Promise.all([
      getPosts({ locale, published: true, limit: 1000 }),
      getProjects({ locale, published: true, limit: 1000 }),
    ]);

    const posts = postResult.posts as Array<{ slug: string } & WithTimestamps>;
    posts.forEach((post) => {
      const path = `/blog/${post.slug}`;
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: toDate(post.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    const projects = projectResult.projects as Array<{ slug: string } & WithTimestamps>;
    projects.forEach((project) => {
      const path = `/projects/${project.slug}`;
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: toDate(project.updatedAt ?? project.createdAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  }

  return sitemapEntries;
}