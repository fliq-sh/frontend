export default function ComparisonTable({
  headers = [],
  rows = [],
}: {
  headers?: string[];
  rows?: string[][];
}) {
  // Defensive: under next-mdx-remote v6 expression-valued props (`rows={[...]}`)
  // reach the component as `undefined` (see BLOG_GUIDE.md). Defaulting to []
  // makes a bad authoring render an empty table instead of crashing the build.
  if (headers.length === 0) return null;
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-white/80 border-b border-white/10"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              {(row ?? []).map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-3 ${
                    ci === 0 ? "text-white/80 font-medium" : "text-white/55"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
