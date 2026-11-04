import Image from "next/image";
import type { MembershipRole } from "@/lib/domain";
import { editorialMedia } from "@/lib/editorial-media";
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
  const headerMedia = roles.includes("founder")
    ? editorialMedia.founder
    : roles.includes("investor_mentor")
      ? editorialMedia.investor
      : roles.some((role) => ["institution_reviewer", "institution_manager"].includes(role))
        ? editorialMedia.institution
        : editorialMedia.network;
  return (
    <main className="workspace-page">
      <div className="workspace-shell shell">
        <WorkspaceNav roles={roles} />
        <div className="workspace-main">
          <header className="workspace-heading workspace-cinematic-heading">
            <Image src={headerMedia.src} alt="" fill sizes="(max-width: 760px) 100vw, 70vw" aria-hidden="true" />
            <div className="workspace-heading-shade" aria-hidden="true" />
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
