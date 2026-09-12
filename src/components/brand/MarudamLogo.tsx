// =============================================================================
// Marudam — Brand Logo SVG Component
// =============================================================================
// Minimal, premium agricultural mark: a stylised water-drop integrated with
// a sprouting leaf emerging from a curved field-horizon line.
// Works at any size: 20px (navbar icon) → 64px (login hero).
// =============================================================================

interface MarudamLogoProps {
  size?: number;
  /** Accent colour for the leaf/water elements. Defaults to #a0e050 (soft lime) */
  color?: string;
  /** If true, renders the wordmark "Marudam" next to the mark */
  showWordmark?: boolean;
  wordmarkStyle?: React.CSSProperties;
  className?: string;
}

export default function MarudamLogo({
  size = 32,
  color = '#a0e050',
  showWordmark = false,
  wordmarkStyle,
  className,
}: MarudamLogoProps) {
  // Derived colours
  const fill1 = color;                         // leaf
  const fill2 = `${color}55`;                 // water fill
  const stroke1 = color;                       // stem / arc
  const stroke2 = `${color}88`;               // inner wave

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.22 }}
    >
      {/* ── Mark ─────────────────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle ring — field horizon */}
        <circle
          cx="20" cy="20" r="18"
          stroke={stroke1}
          strokeWidth="1.4"
          strokeOpacity="0.75"
          fill="none"
        />

        {/* Field horizon arc — bottom half */}
        <path
          d="M 4 26 Q 20 20 36 26"
          stroke={stroke1}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.65"
        />

        {/* Water shimmer under horizon */}
        <path
          d="M 8 29 Q 14 26 20 29 Q 26 32 32 29"
          stroke={stroke2}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central stem */}
        <line
          x1="20" y1="26"
          x2="20" y2="12"
          stroke={stroke1}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Left leaf */}
        <path
          d="M 20 18 Q 12 13 12 7 Q 18 10 20 18"
          fill={fill2}
          stroke={stroke1}
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeOpacity="0.8"
        />

        {/* Right leaf */}
        <path
          d="M 20 16 Q 28 11 28 5 Q 22 8 20 16"
          fill={fill1}
          fillOpacity="0.55"
          stroke={stroke1}
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeOpacity="0.8"
        />

        {/* Water-drop at stem base */}
        <ellipse
          cx="20" cy="27.5" rx="2.2" ry="1.3"
          fill={fill1}
          fillOpacity="0.6"
        />
      </svg>

      {/* ── Wordmark ─────────────────────────────────────────────────── */}
      {showWordmark && (
        <span
          style={{
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: size * 0.52,
            letterSpacing: '0.03em',
            lineHeight: 1,
            userSelect: 'none',
            ...wordmarkStyle,
          }}
        >
          Marudam
        </span>
      )}
    </span>
  );
}
