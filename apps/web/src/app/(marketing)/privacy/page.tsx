import { PolicyPage } from "@/components/policy-page";
import { policyCopy } from "@/lib/content";

export const metadata = { title: "Privacy notice" };

export default function Page() {
  const copy = policyCopy.privacy;
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
