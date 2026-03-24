import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PostCard from "@/components/blog/PostCard";
import { getAllTags, getPostsByTag } from "@/lib/blog";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Posts tagged "${tag}" | Fliq Blog`,
    description: `Browse all Fliq blog posts about ${tag}.`,
    alternates: { canonical: `https://fliq.sh/blog/tag/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  const allTags = getAllTags();

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="flex-1 pt-14">
        <section className="py-20 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-indigo-400 mb-2">Tag</p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{tag}</h1>
            <p className="text-white/60">
              {posts.length} post{posts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          {/* Tag chips */}
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/blog"
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
            >
              All posts
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/blog/tag/${t}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  t === tag
                    ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
                    : "border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
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
          ) : (
            <p className="text-center text-white/40 py-20">
              No posts with this tag yet.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
