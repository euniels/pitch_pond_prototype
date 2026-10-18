"use client";

import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  PackageCheck,
  Repeat2,
  ShieldCheck,
  Store,
} from "lucide-react";

type Pathway = "launch" | "continuity";
const content = {
  launch: {
    eyebrow: "Future pathway 01",
    title: "Ready-to-operate microbusiness systems",
    intro: "Help aspiring Filipino operators start from a tested operating system instead of a blank page—without presenting a package as guaranteed income.",
    icon: PackageCheck,
    stages: [
      ["Discover", "Match skills, location, budget, and operating preferences."],
      ["Inspect", "Review the playbook, equipment, suppliers, economics, and evidence."],
      ["Prepare", "Complete permits, training, cash planning, and launch-readiness checks."],
      ["Operate", "Track actual sales, costs, exceptions, and support needs against assumptions."],
    ],
    guardrails: ["No guaranteed-income claims", "Transparent package assumptions", "Independent supplier verification", "Local permit checklist"],
  },
  continuity: {
    eyebrow: "Future pathway 02",
    title: "SME continuity and ownership transfer",
    intro: "Help aging or exiting owners prepare a functioning business for a responsible handover to a qualified new operator.",
    icon: Repeat2,
    stages: [
      ["Prepare", "Structure operating history, assets, obligations, processes, and transfer goals."],
      ["Screen", "Use anonymized first looks and operator-fit criteria before identity reveal."],
      ["Diligence", "Coordinate controlled document access, site review, and professional advice."],
      ["Transition", "Track training, customer and supplier handover, milestones, and post-transfer support."],
    ],
    guardrails: ["No custody or transaction execution", "Verified authority to list", "Permissioned diligence", "Legal and tax professionals remain required"],
  },
} as const;

export function FuturePathways() {
  const [pathway, setPathway] = useState<Pathway>("launch");
  const selected = content[pathway];
  const Icon = selected.icon;
  return (
    <section className="future-pathways" aria-labelledby="future-pathways-title">
      <div className="future-pathways-heading">
        <div><span className="eyebrow">One intelligence layer · multiple entrepreneurship paths</span><h2 id="future-pathways-title">A responsible future beyond startup matching.</h2><p>Both concepts can reuse PitchPond’s evidence, readiness, permission, matching, and audit foundations while keeping different workflows and legal boundaries.</p></div>
        <span><BriefcaseBusiness />Future concept validation</span>
      </div>
      <div className="pathway-tabs" role="tablist" aria-label="Future product pathways">
        <button type="button" role="tab" aria-selected={pathway === "launch"} onClick={() => setPathway("launch")}><Store /><span><strong>Start with a system</strong><small>Microbusiness launch kits</small></span></button>
        <button type="button" role="tab" aria-selected={pathway === "continuity"} onClick={() => setPathway("continuity")}><Repeat2 /><span><strong>Continue a proven business</strong><small>SME ownership transition</small></span></button>
      </div>
      <div className="pathway-panel" role="tabpanel">
        <div className="pathway-intro"><span className="pathway-icon"><Icon /></span><span className="eyebrow">{selected.eyebrow}</span><h3>{selected.title}</h3><p>{selected.intro}</p></div>
        <div className="pathway-stages">{selected.stages.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{body}</p></div>{index < selected.stages.length - 1 && <ArrowRight aria-hidden="true" />}</article>)}</div>
        <div className="pathway-guardrails"><div><ShieldCheck /><strong>Required guardrails</strong></div>{selected.guardrails.map((item) => <span key={item}><CheckCircle2 />{item}</span>)}</div>
      </div>
    </section>
  );
}
