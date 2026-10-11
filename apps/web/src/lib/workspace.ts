import type { MembershipRole } from "./domain";
import { requireUser } from "./auth";

export async function getWorkspaceContext() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("organization_memberships")
      .select("id,organization_id,role,organizations(id,name,kind,region)")
      .eq("user_id", user.id),
  ]);
  return {
    supabase,
    user,
    profile,
    memberships: (memberships ?? []) as unknown as Array<{
      id: string;
      organization_id: string;
      role: MembershipRole;
      organizations: {
        id: string;
        name: string;
        kind: string;
        region: string | null;
      };
    }>,
  };
}

export function hasRole(
  memberships: Array<{ role: MembershipRole }>,
  roles: MembershipRole[],
) {
  return memberships.some((membership) => roles.includes(membership.role));
}
