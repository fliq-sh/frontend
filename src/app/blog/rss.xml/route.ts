import { getAllPosts } from "@/lib/blog";

export async function GET() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <description><![CDATA[${post.frontmatter.description}]]></description>
      <link>https://fliq.sh/blog/${post.slug}</link>
      <guid isPermaLink="true">https://fliq.sh/blog/${post.slug}</guid>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <author>${post.frontmatter.author}</author>
      ${post.frontmatter.tags.map((t) => `<category>${t}</category>`).join("\n      ")}
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fliq Blog</title>
    <description>Tutorials, guides, and insights on serverless infrastructure</description>
    <link>https://fliq.sh/blog</link>
    <atom:link href="https://fliq.sh/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
