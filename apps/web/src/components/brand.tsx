import Link from "next/link";

export function Brand({
  inverse = false,
  compact = false,
}: {
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      aria-label="PitchPond home"
    >
      <svg className="brand-symbol" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="brand-gradient" x1="7" y1="7" x2="41" y2="41">
            <stop stopColor="#50f0d0" />
            <stop offset="1" stopColor="#d9f86c" />
          </linearGradient>
        </defs>
        <path
          d="M28.5 6.5C18 6.5 11 13.7 11 24.4c0 8.6 6 14.8 14.2 14.8 5.5 0 10-2.7 12.5-7.2-3.1 1.8-6.2 2.5-9.2 2.2-6.3-.7-10.4-5-10.4-10.8 0-5.1 3.3-8.7 8.3-9.6v8.4h-4.1v6.2h4.1v5.8h6.8V13.1c0-3.7-1.7-6.6-4.7-6.6Z"
          fill="url(#brand-gradient)"
        />
        <path
          d="M5 39.5c5.8-2.6 11.6-2.6 17.4 0 5.8 2.6 11.6 2.6 17.4 0"
          fill="none"
          stroke="url(#brand-gradient)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span className="brand-word">
          Pitch<span>Pond</span>
        </span>
      )}
    </Link>
  );
}
