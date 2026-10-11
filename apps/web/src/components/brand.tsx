import Link from "next/link";
import { Waves } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="PitchPond home">
      <span className="brand-mark" aria-hidden="true"><Waves size={23} strokeWidth={2.4} /></span>
      {!compact && <span>Pitch<span>Pond</span></span>}
    </Link>
  );
}
