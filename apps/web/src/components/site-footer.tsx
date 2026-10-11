import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Brand />
          <p>Transparent donation and reward crowdfunding for Filipino communities and businesses.</p>
          <span className="beta-pill">Closed beta · Philippines</span>
        </div>
        <div>
          <h3>Platform</h3>
          <Link href="/explore">Explore campaigns</Link>
          <Link href="/pricing">Plans and fees</Link>
          <Link href="/about">How PitchPond works</Link>
        </div>
        <div>
          <h3>Trust</h3>
          <Link href="/legal#funding">Funding policy</Link>
          <Link href="/legal#privacy">Privacy</Link>
          <Link href="/legal#complaints">Complaints</Link>
        </div>
        <div>
          <h3>Important</h3>
          <p>PitchPond does not currently offer securities or equity investments. Campaign backing carries fulfilment risk.</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 PitchPond</span><span>Built for clear choices, not hype.</span>
      </div>
    </footer>
  );
}
