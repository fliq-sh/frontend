import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Clock, ChevronRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import Newsletter from "@/components/blog/Newsletter";
import AuthorCard from "@/components/blog/AuthorCard";
import PostCard from "@/components/blog/PostCard";
import { mdxComponents } from "@/components/blog/MDXComponents";
import {
  getPostSlugs,
  getPostBySlug,
  getRelatedPosts,
  extractHeadings,
} from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const { title, description, image, author, date } = post.frontmatter;
  const url = `https://fliq.sh/blog/${slug}`;

  return {
    title: `${title} | Fliq Blog`,
    description,
    authors: [{ name: author }],
    openGraph: {
      title,
      description,
      url,
      siteName: "Fliq",
      type: "article",
      publishedTime: date,
      authors: [author],
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const headings = extractHeadings(content);
  const related = getRelatedPosts(slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    author: {
      "@type": "Person",
      name: frontmatter.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Fliq",
      url: "https://fliq.sh",
    },
    url: `https://fliq.sh/blog/${slug}`,
    ...(frontmatter.image && { image: frontmatter.image }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="flex-1 pt-14">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Breadcrumbs */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <nav className="flex items-center gap-1.5 text-sm text-white/40">
            <Link
              href="/blog"
              className="hover:text-white transition-colors"
            >
              Blog
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/60 truncate max-w-[300px]">
              {frontmatter.title}
            </span>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex gap-12">
          {/* TOC sidebar — desktop only */}
          <aside className="hidden xl:block w-56 shrink-0">
            <TableOfContents headings={headings} />
          </aside>

          {/* Content */}
          <article className="min-w-0 max-w-[720px] flex-1 pb-16">
            {/* Header */}
            <header className="mb-10">
              <div className="flex flex-wrap gap-2 mb-4">
                {frontmatter.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag}`}
                    className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {frontmatter.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span>{frontmatter.author}</span>
                <span>
                  {format(new Date(frontmatter.date), "MMMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {frontmatter.readingTime} min read
                </span>
              </div>
            </header>

            {/* MDX Content */}
            <div className="mdx-content">
              <MDXRemote
                source={content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                  },
                }}
              />
            </div>

            {/* Share + Newsletter + Author */}
            <div className="mt-12 border-t border-white/10 pt-6">
              <ShareButtons title={frontmatter.title} slug={slug} />
              <Newsletter />
              <AuthorCard name={frontmatter.author} />
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="mt-12 border-t border-white/10 pt-10">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Related posts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {related.map((r) => (
                    <PostCard
                      key={r.slug}
                      slug={r.slug}
                      title={r.frontmatter.title}
                      description={r.frontmatter.description}
                      date={r.frontmatter.date}
                      readingTime={r.frontmatter.readingTime}
                      tags={r.frontmatter.tags}
                    />
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
