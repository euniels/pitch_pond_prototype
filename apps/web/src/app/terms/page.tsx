import { PolicyPage } from "@/components/policy-page";
import { policyCopy } from "@/lib/content";

export const metadata = { title: "Pilot terms" };

export default function Page() {
  const copy = policyCopy.terms;
  return (
    <PolicyPage eyebrow={copy.eyebrow} title={copy.title}>
      {copy.sections.map(([title, body]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
        </section>
      ))}
    </PolicyPage>
  );
}
