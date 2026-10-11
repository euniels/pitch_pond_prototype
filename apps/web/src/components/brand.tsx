import Link from "next/link";
import Image from "next/image";

export function BrandMarkImage({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      className={className}
      src="/brand/pitchpond-mark.png"
      width={1536}
      height={1024}
      alt=""
      sizes="(max-width: 560px) 104px, 120px"
      priority={priority}
    />
  );
}

export function BrandSymbol({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`brand-symbol ${className}`}
      viewBox="0 0 96 96"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pitchpond-fish" x1="20" y1="12" x2="72" y2="73">
          <stop stopColor="#79f6ff" />
          <stop offset="0.42" stopColor="#20d7e8" />
          <stop offset="0.72" stopColor="#5ee783" />
          <stop offset="1" stopColor="#e5ff67" />
        </linearGradient>
        <linearGradient id="pitchpond-water" x1="12" y1="72" x2="84" y2="84">
          <stop stopColor="#1cbfff" />
          <stop offset="0.5" stopColor="#3ff0e1" />
          <stop offset="1" stopColor="#8cf05d" />
        </linearGradient>
        <linearGradient id="pitchpond-lotus" x1="14" y1="66" x2="31" y2="82">
          <stop stopColor="#ffb9ef" />
          <stop offset="1" stopColor="#ff6fc9" />
        </linearGradient>
      </defs>
      <ellipse cx="49" cy="79" rx="38" ry="8.5" fill="none" stroke="url(#pitchpond-water)" strokeWidth="2.5" opacity=".95" />
      <ellipse cx="49" cy="79" rx="27" ry="5.5" fill="none" stroke="url(#pitchpond-water)" strokeWidth="2" opacity=".72" />
      <path d="M59 10c-16.6 1.6-29.7 10.4-36.4 24.7-5.2 11.1-4.3 24.6 3.4 33.9 4.8 5.8 11.9 8.8 20 8.8 11.4 0 20.7-5.5 25.7-15.1-5.1 3.6-10.8 5.5-17 5.5-11.2 0-19.7-6.9-19.7-17.4 0-11.7 8.5-21.1 21.1-23.7l9.8-2c6.9-1.4 10.8-5.2 11.9-11.2C72.4 10.6 66.2 9.3 59 10Z" fill="url(#pitchpond-fish)" />
      <path d="M51.5 35.5h18.2c9.2 0 15.3 5 15.3 13.2 0 9.3-7.4 15-18.2 15H55.7V54h10.5c4.1 0 6.3-1.8 6.3-4.8 0-2.8-2.2-4.3-6-4.3h-15Z" fill="url(#pitchpond-fish)" />
      <path d="M24.5 27.7 12.8 22l5.9 12.5-9.8 7.8 13.4.2" fill="#2a9ff3" opacity=".9" />
      <ellipse cx="66.4" cy="16.8" rx="2.7" ry="2" fill="#032437" />
      <g fill="url(#pitchpond-lotus)">
        <path d="M19 76.5c-4.9-1-8.2-4-9.5-8.8 5.1.4 8.6 2.9 10.5 7.5Z" />
        <path d="M21 75.6c-2.8-4.5-2.5-8.8.7-12.8 3 4.4 3 8.6.2 12.8Z" />
        <path d="M22.6 76.7c1.4-4.5 4.6-7.1 9.3-7.7-1 4.8-4 7.8-9.3 7.7Z" />
      </g>
    </svg>
  );
}

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
      {compact ? (
        <BrandMarkImage className="brand-mark-image" priority />
      ) : (
        <Image
          className="brand-lockup"
          src="/brand/pitchpond-logo-lockup.png"
          width={2172}
          height={724}
          alt=""
          sizes="(max-width: 560px) 142px, 174px"
          priority
        />
      )}
    </Link>
  );
}
