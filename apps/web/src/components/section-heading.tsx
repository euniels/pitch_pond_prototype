export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  center?: boolean;
}) {
  return (
    <div className={`section-heading ${center ? "center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{intro}</p>
    </div>
  );
}
