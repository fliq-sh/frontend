import Link from "next/link";
import { format } from "date-fns";
import { Clock, Calendar } from "lucide-react";

interface PostCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  tags: string[];
  featured?: boolean;
}

export default function PostCard({
  slug,
  title,
  description,
  date,
  readingTime,
  tags,
  featured,
}: PostCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className={`group block rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06] ${
        featured ? "md:col-span-2 lg:col-span-3" : ""
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3
          className={`font-semibold text-white group-hover:text-indigo-400 transition-colors ${
            featured ? "text-2xl" : "text-lg"
          }`}
        >
          {title}
        </h3>

        <p className={`text-white/60 leading-relaxed ${featured ? "text-base" : "text-sm"}`}>
          {description}
        </p>

        <div className="flex items-center gap-4 text-xs text-white/40 pt-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(date), "MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readingTime} min read
          </span>
        </div>
      </div>
    </Link>
  );
}
