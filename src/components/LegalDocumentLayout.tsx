import { Link } from "react-router-dom";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalDocumentLayoutProps = {
  title: string;
  description: string;
  canonicalUrl: string;
  alternatePath: "/privacy" | "/terms";
  alternateLabel: string;
  updatedAt: string;
  sections: LegalSection[];
};

export type { LegalSection };

export default function LegalDocumentLayout({
  title,
  description,
  canonicalUrl,
  alternatePath,
  alternateLabel,
  updatedAt,
  sections,
}: LegalDocumentLayoutProps) {
  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#1b1b1b]">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <header className="border-b border-black/10 pb-8 sm:pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <Link to="/" className="font-medium tracking-[0.08em] text-[#1b1b1b]">
              Mivibe
            </Link>
            <nav className="flex items-center gap-4 text-black/60">
              <Link to="/privacy" className="transition hover:text-black">
                Privacy Policy
              </Link>
              <Link to="/terms" className="transition hover:text-black">
                Terms of Service
              </Link>
            </nav>
          </div>

          <div className="mt-10 max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111111] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-black/65 sm:text-lg">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-black/50">
              <span>Effective date: {updatedAt}</span>
              <a href={canonicalUrl} className="transition hover:text-black">
                {canonicalUrl}
              </a>
              <Link to={alternatePath} className="transition hover:text-black">
                {alternateLabel}
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-10 space-y-10 sm:mt-12">
          {sections.map((section) => (
            <section key={section.title} className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#111111] sm:text-3xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-black/70 sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-black/10 pt-6 text-sm text-black/50">
          <p>© {new Date().getFullYear()} Mivibe. All rights reserved.</p>
        </footer>
      </section>
    </main>
  );
}
