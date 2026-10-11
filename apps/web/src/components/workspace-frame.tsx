import type { MembershipRole } from "@/lib/domain";
import { WorkspaceNav } from "./workspace-nav";

export function WorkspaceFrame({
  name,
  roles,
  eyebrow,
  title,
  intro,
  children,
}: {
  name: string;
  roles: MembershipRole[];
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="workspace-page">
      <div className="workspace-shell shell">
        <WorkspaceNav roles={roles} />
        <div className="workspace-main">
          <header className="workspace-heading">
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{intro}</p>
            </div>
            <div className="avatar" title={name}>
              {name.slice(0, 1).toUpperCase()}
            </div>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
