import { cn } from "@/lib/utils";

/**
 * Dependency-free monochrome area sparkline. Stays on-brand (no chart library,
 * no decorative hue — white at low opacity per ADR 0001). Renders nothing
 * meaningful for empty/flat data beyond a baseline.
 */
export function Sparkline({
  data,
  width = 120,
  height = 32,
  className,
  strokeClass = "stroke-white/70",
  fillClass = "fill-white/10",
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeClass?: string;
  fillClass?: string;
}) {
  const n = data.length;
  const max = Math.max(1, ...data);
  const pad = 1;
  const innerH = height - pad * 2;
  const stepX = n > 1 ? width / (n - 1) : width;

  const points = data.map((v, i) => {
    const x = n > 1 ? i * stepX : width / 2;
    const y = pad + innerH - (v / max) * innerH;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      {n > 1 && <path d={area} className={fillClass} />}
      {n > 1 && <path d={line} fill="none" className={strokeClass} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}
