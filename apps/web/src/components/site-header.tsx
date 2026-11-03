import Link from "next/link";
import { Brand } from "./brand";
import { navItems } from "@/lib/content";
import { getOptionalUser } from "@/lib/auth";
import { ThemeToggle } from "./theme-toggle";
import { MobileNavigation } from "./mobile-navigation";

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
          <MobileNavigation
            items={[...navItems]}
            accountHref={user ? "/workspace" : "/sign-in"}
            accountLabel={user ? "Workspace" : "Sign in"}
          />
        </div>
      </div>
    </header>
  );
}
