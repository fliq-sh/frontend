import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";
import Step from "./Step";
import ComparisonTable from "./ComparisonTable";
import CTA from "./CTA";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => {
    const id = typeof children === "string" ? slugify(children) : undefined;
    return (
      <h2
        id={id}
        className="mt-12 mb-4 text-2xl font-bold text-white scroll-mt-24"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const id = typeof children === "string" ? slugify(children) : undefined;
    return (
      <h3
        id={id}
        className="mt-8 mb-3 text-xl font-semibold text-white scroll-mt-24"
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold text-white" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="my-4 text-white/70 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/")) {
      return (
        <Link
          href={href}
          className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors"
          {...props}
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },
  ul: ({ children, ...props }) => (
    <ul className="my-4 ml-6 list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-4 ml-6 list-decimal space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-white/70 leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 border-l-4 border-indigo-500/30 bg-white/5 py-3 px-4 italic [&>p]:m-0 [&>p]:text-white/60"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    // Inline code (no language class)
    if (!className) {
      return (
        <code
          className="rounded bg-white/10 px-1.5 py-0.5 text-sm font-mono text-indigo-300"
          {...props}
        >
          {children}
        </code>
      );
    }
    // Fenced code block — rendered inside <pre> by MDX
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => {
    // Extract language from the code child's className
    const codeEl = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    const className = codeEl?.props?.className ?? "";
    const language = className.replace("language-", "");

    return (
      <CodeBlock language={language}>
        <pre {...props}>{children}</pre>
      </CodeBlock>
    );
  },
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="bg-white/5 px-4 py-3 text-left font-semibold text-white/80 border-b border-white/10"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 text-white/60 border-b border-white/5" {...props}>
      {children}
    </td>
  ),
  hr: () => <hr className="my-8 border-white/10" />,
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="my-6 rounded-xl"
      loading="lazy"
      {...props}
    />
  ),
  // Custom MDX components
  Callout,
  Step,
  ComparisonTable,
  CTA,
};
