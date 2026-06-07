import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { getAllComparisonSlugs } from "@/lib/comparisons";

const BASE_URL = "https://fliq.sh";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/docs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/vs`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/cron`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/status`, changeFrequency: "always", priority: 0.5 },
  ];

  const comparisonPages: MetadataRoute.Sitemap = getAllComparisonSlugs().map(
    (slug) => ({
      url: `${BASE_URL}/vs/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tagPages: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `${BASE_URL}/blog/tag/${tag}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...comparisonPages, ...blogPosts, ...tagPages];
}
