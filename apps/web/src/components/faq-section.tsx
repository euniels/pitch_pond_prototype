import { CircleHelp, Plus } from "lucide-react";

const questions = [
  {
    question: "Does PitchPond collect investments or hold money?",
    answer:
      "No. The pilot helps ventures prepare evidence, understand readiness gaps, and request consent-based introductions. It does not collect investments, hold funds, sell securities, or provide investment advice.",
  },
  {
    question: "What does fundability mean here?",
    answer:
      "Fundability is the quality and inspectability of a venture profile: clear claims, linked evidence, completed readiness work, milestones, and transparent fit with a specific investor or mentor thesis. It is not a prediction that fundraising will succeed.",
  },
  {
    question: "How is readiness calculated?",
    answer:
      "Each of nine dimensions moves through objective workflow states: Not started, In progress, Evidence linked, and Reviewed. Evidence coverage is displayed separately, and neither result is influenced by a paid plan.",
  },
  {
    question: "How does explainable matching work?",
    answer:
      "A versioned 100-point rubric compares sector, stage, ticket overlap, traction requirements, geography, impact alignment, and risk tolerance. Hard exclusions and missing consent prevent a match instead of merely reducing its score.",
  },
  {
    question: "What is Blind First Look?",
    answer:
      "It hides names, logos, founder identities, exact addresses, and prestige cues while retaining relevant venture facts. A reviewer must explicitly reveal identity, and the real product records that action in the audit log.",
  },
  {
    question: "Can AI change a readiness or match result?",
    answer:
      "No. AI may draft editable gap suggestions, summaries, and narratives after consent, but deterministic product rules remain authoritative. AI output is labeled advisory and cannot publish itself or alter a score.",
  },
] as const;

export function FaqSection() {
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-heading">
        <CircleHelp />
        <div>
          <span className="eyebrow">Common questions</span>
          <h2 id="faq-title">Clear answers before you enter the pond.</h2>
        </div>
      </div>
      <div className="faq-list">
        {questions.map((item, index) => (
          <details key={item.question} open={index === 0}>
            <summary>
              <span>{item.question}</span>
              <Plus aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
