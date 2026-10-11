import Link from "next/link";
import {
  Building2,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Sprout,
  Target,
} from "lucide-react";
import type { MembershipRole } from "@/lib/domain";
import { signOutAction } from "@/app/workspace/actions";

export function WorkspaceNav({ roles }: { roles: MembershipRole[] }) {
  const entries = [
    {
      href: "/workspace",
      label: "Overview",
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: "/workspace/founder",
      label: "Founder Studio",
      icon: Sprout,
      show: roles.includes("founder"),
    },
    {
      href: "/workspace/investor",
      label: "Thesis & matches",
      icon: Target,
      show: roles.includes("investor_mentor"),
    },
    {
      href: "/workspace/institution",
      label: "Cohorts",
      icon: Building2,
      show: roles.some((role) =>
        ["institution_reviewer", "institution_manager"].includes(role),
      ),
    },
    {
      href: "/workspace/admin",
      label: "Administration",
      icon: ShieldCheck,
      show: roles.includes("platform_admin"),
    },
    {
      href: "/workspace/security",
      label: "Account security",
      icon: KeyRound,
      show: true,
    },
  ];
  return (
    <aside className="workspace-nav">
      <nav aria-label="Workspace navigation">
        {entries
          .filter((entry) => entry.show)
          .map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Icon />
              {label}
            </Link>
          ))}
      </nav>
      <form action={signOutAction}>
        <button className="text-button">Sign out</button>
      </form>
    </aside>
  );
}
