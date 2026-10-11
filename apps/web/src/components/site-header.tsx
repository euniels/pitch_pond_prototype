import Link from "next/link";
import { Brand } from "./brand";
import { navItems } from "@/lib/content";
import { getOptionalUser } from "@/lib/auth";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const user = await getOptionalUser();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link
            className="text-link desktop-only"
            href={user ? "/workspace" : "/sign-in"}
          >
            {user ? "Workspace" : "Sign in"}
          </Link>
          <Link
            className="button button-primary button-small"
            href={user ? "/workspace" : "/pilot"}
          >
            {user ? "Open workspace" : "Join the pilot"}
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Open navigation">
              <span />
              <span />
              <span />
            </summary>
            <nav aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href={user ? "/workspace" : "/sign-in"}>
                {user ? "Workspace" : "Sign in"}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
