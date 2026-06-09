interface FliqIconProps {
  size?: number;
  className?: string;
}

/**
 * Fliq F-lettermark icon.
 *
 * This is the ONE place colour lives in the marketing brand: the F is rendered
 * in a holographic / iridescent spectrum while the rest of the site is strict
 * monochrome white-on-dark. Keeping the iridescence contained to the mark is
 * deliberate — see ADR 0001. Pure SVG; works anywhere (navbar, footer, OG).
 */
export default function FliqIcon({ size = 32, className }: FliqIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Fliq"
    >
      <defs>
        {/* Single iridescent spectrum, swept diagonally across the whole mark
            so the F reads as one continuous holographic surface. */}
        <linearGradient id="fi-iri" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#5eead4" />
          <stop offset="30%"  stopColor="#818cf8" />
          <stop offset="55%"  stopColor="#c084fc" />
          <stop offset="78%"  stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <radialGradient id="fi-glow" cx="42%" cy="44%" r="55%">
          <stop offset="0%"   stopColor="#c084fc" stopOpacity="0.22" />
          <stop offset="60%"  stopColor="#818cf8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
        <filter id="fi-dot-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient iridescent glow */}
      <ellipse cx="34" cy="36" rx="28" ry="28" fill="url(#fi-glow)" />

      {/* F — vertical stroke + two horizontal bars, all one iridescent fill */}
      <rect x="18" y="14"   width="9"  height="44" rx="2" fill="url(#fi-iri)" />
      <rect x="18" y="14"   width="36" height="9"  rx="2" fill="url(#fi-iri)" />
      <rect x="18" y="31.5" width="26" height="8"  rx="2" fill="url(#fi-iri)" />

      {/* Motion lines — neutral white, so only the F itself carries colour */}
      <line x1="52" y1="27" x2="59" y2="27" stroke="rgba(255,255,255,0.55)" strokeWidth="2"   strokeLinecap="round" />
      <line x1="54" y1="33" x2="59" y2="33" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="39" x2="59" y2="39" stroke="rgba(255,255,255,0.18)" strokeWidth="1"   strokeLinecap="round" />

      {/* Corner accent dot — iridescent highlight */}
      <circle cx="54" cy="18.5" r="3"   fill="#f0abfc" opacity="0.95" filter="url(#fi-dot-glow)" />
      <circle cx="54" cy="18.5" r="1.5" fill="#ffffff" />
    </svg>
  );
}
