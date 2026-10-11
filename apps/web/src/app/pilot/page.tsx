import { Building2, MapPinned, ShieldCheck, Users } from "lucide-react";
import { PilotApplicationForm } from "@/components/pilot-application-form";
import { pilotCopy } from "@/lib/content";
export const metadata = { title: "Join the pilot" };
export default function Page() {
  const copy = pilotCopy;
  const icons = {
    founders: Users,
    supporters: ShieldCheck,
    institutions: Building2,
    location: MapPinned,
  };
  return (
    <main>
      <section className="page-hero ocean-hero">
        <div className="hero-rays" />
        <div className="shell narrow">
          <span className="eyebrow light">{copy.hero.eyebrow}</span>
          <h1>{copy.hero.title}</h1>
          <p>{copy.hero.body}</p>
        </div>
      </section>
      <section className="section shell pilot-layout">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <div className="pilot-audience">
            {copy.audiences.map((audience) => {
              const Icon = icons[audience.icon];
              return (
                <div key={audience.title}>
                  <Icon />
                  <h3>{audience.title}</h3>
                  <p>{audience.body}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <PilotApplicationForm />
          <p className="form-privacy">{copy.privacy}</p>
        </div>
      </section>
    </main>
  );
}
