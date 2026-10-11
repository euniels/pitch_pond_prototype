import { ShieldCheck } from "lucide-react";

export function TrustNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="trust-note">
      <ShieldCheck aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
