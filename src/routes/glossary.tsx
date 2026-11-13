import { createFileRoute } from "@tanstack/react-router";
import { glossary } from "@/lib/plain-language";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "How it works — People at Work" },
      { name: "description", content: "The science behind the hiring test, in plain words." },
      { property: "og:title", content: "How it works — People at Work" },
      { property: "og:description", content: "The science behind the hiring test, in plain words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Glossary,
});

function Glossary() {
  return (
    <>
      <header className="step-hero">
        <div>
          <p className="eyebrow">People at Work / How it works</p>
          <h1>The science, in plain words.</h1>
        </div>
        <div className="step-hero-copy">
          <p>
            The app is built on industrial-organizational psychology, the science of people at work. Each idea below
            shows the plain name you'll see in the app and the research term behind it.
          </p>
        </div>
      </header>
      <dl className="max-w-3xl">
        {glossary
          .filter((t) => !t.legacy)
          .map((t) => (
            <div key={t.label} className="border-b py-6">
              <dt className="text-2xl font-semibold">
                {t.label}
                <span className="block text-sm font-normal text-muted-foreground mt-2">Research term: {t.technical}</span>
              </dt>
              <dd className="mt-4">{t.definition}</dd>
              {t.science && (
                <dd className="mt-3 border-l-4 border-brand-yellow pl-4 text-muted-foreground">
                  <strong className="text-foreground">Why it works: </strong>
                  {t.science}
                </dd>
              )}
            </div>
          ))}
      </dl>
    </>
  );
}
