export function PolicyPage({
  eyebrow,
  title,
  updated = "October 11, 2026",
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <section className="page-hero compact ocean-hero">
        <div className="hero-rays" />
        <div className="shell narrow">
          <span className="eyebrow light">{eyebrow}</span>
          <h1>{title}</h1>
          <p>
            Last updated {updated}. Pilot-stage policy for review before
            external onboarding.
          </p>
        </div>
      </section>
      <article className="section shell policy-content">{children}</article>
    </main>
  );
}
