import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PostCard from "@/components/blog/PostCard";
import { getAllPosts, getAllTags } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Fliq",
  description:
    "Tutorials, guides, and insights on serverless infrastructure, HTTP workflows, and background job scheduling.",
  openGraph: {
    title: "Blog | Fliq",
    description:
      "Tutorials, guides, and insights on serverless infrastructure.",
    url: "https://fliq.sh/blog",
    siteName: "Fliq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Fliq",
    description:
      "Tutorials, guides, and insights on serverless infrastructure.",
  },
  alternates: { canonical: "https://fliq.sh/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const featured = posts.find((p) => p.frontmatter.featured);
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="flex-1 pt-14">
        {/* Hero */}
        <section className="py-20 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Tutorials, guides, and insights on serverless infrastructure
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          {/* Tag filters */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <Link
                href="/blog"
                className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs text-indigo-400 font-medium"
              >
                All posts
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Featured post */}
          {featured && (
            <div className="mb-10">
              <PostCard
                slug={featured.slug}
                title={featured.frontmatter.title}
                description={featured.frontmatter.description}
                date={featured.frontmatter.date}
                readingTime={featured.frontmatter.readingTime}
                tags={featured.frontmatter.tags}
                featured
              />
            </div>
          )}

          {/* Post grid */}
          {rest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <PostCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.frontmatter.title}
                  description={post.frontmatter.description}
                  date={post.frontmatter.date}
                  readingTime={post.frontmatter.readingTime}
                  tags={post.frontmatter.tags}
                />
              ))}
            </div>
          ) : !featured ? (
            <p className="text-center text-white/40 py-20">
              No posts yet. Check back soon!
            </p>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
