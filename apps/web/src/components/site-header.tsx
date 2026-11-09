import { Brand } from "./brand";
import { headerNavigation, mobileNavItems } from "@/lib/content";
import { getOptionalUser } from "@/lib/auth";
import { ThemeToggle } from "./theme-toggle";
import { MobileNavigation } from "./mobile-navigation";
import { DesktopNavigation } from "./desktop-navigation";
import { HeaderScrollState } from "./header-scroll-state";
import Link from "next/link";

export async function SiteHeader() {
  const user = await getOptionalUser();
  return (
    <header className="site-header">
      <HeaderScrollState />
      <div className="shell header-inner">
        <Brand />
        <DesktopNavigation entries={headerNavigation} />
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
            items={[...mobileNavItems]}
            accountHref={user ? "/workspace" : "/sign-in"}
            accountLabel={user ? "Workspace" : "Sign in"}
          />
        </div>
      </div>
    </header>
  );
}
