import Link from "next/link";
import { Brand } from "./brand";
import { footerGroups } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Brand inverse />
          <p>
            Evidence before claims. Fit before introductions. Human judgment
            throughout.
          </p>
          <small>
            PitchPond does not execute investments, hold funds, or provide
            investment advice.
          </small>
        </div>
        {footerGroups.map((group) => (
          <div className="footer-link-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 PitchPond. Pilot-stage software.</span>
        <span>Built for the Philippine early-stage ecosystem.</span>
      </div>
    </footer>
  );
}
