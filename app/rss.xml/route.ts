import { getPosts } from '@/app/actions/blog/actions';

export async function GET() {
  const baseUrl = 'https://hthkia.com';

  const { posts } = await getPosts({
    published: true,
    limit: 20,
  });

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SMART CROWD Blog</title>
    <description>Latest articles from SMART CROWD</description>
    <link>${baseUrl}</link>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map((post: RssPost) => {
        const title = post.title;
        const description = post.excerpt || post.seoDescription || '';
        const pubDate = post.publishedAt
          ? new Date(post.publishedAt).toUTCString()
          : new Date().toUTCString();
        const link = `${baseUrl}/${post.locale}/blog/${post.slug}`;

        return `
    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.author ? `<author>${escapeXml(post.author.name)}</author>` : ''}
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

type RssPost = {
  title: string;
  excerpt?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | Date | null;
  locale: string;
  slug: string;
  author?: { name: string } | null;
};





