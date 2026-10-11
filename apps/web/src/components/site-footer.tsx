import Link from "next/link";
import { Brand } from "./brand";

const groups = [
  {
    title: "Platform",
    links: [
      ["How it works", "/how-it-works"],
      ["Founder Studio", "/founder-studio"],
      ["Evidence Vault", "/evidence-vault"],
      ["Explainable matching", "/matching"],
    ],
  },
  {
    title: "Pilot",
    links: [
      ["Institutions", "/institutions"],
      ["Pricing", "/pricing"],
      ["Apply", "/pilot"],
      ["Sign in", "/sign-in"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Responsible AI", "/responsible-ai"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Accessibility", "/accessibility"],
    ],
  },
] as const;

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
        {groups.map((group) => (
          <div key={group.title}>
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
