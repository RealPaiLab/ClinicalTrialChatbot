import type { ReactNode } from 'react';
import { Streamdown } from 'streamdown';
import termsMarkdown from '@/content/terms.md?raw';
import { TERMS_VERSION } from '@/lib/consent';

const TERMS_TITLE = 'Terms of Use';

const effectiveDate = new Date(`${TERMS_VERSION}T00:00:00Z`).toLocaleDateString('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const components = {
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-primary bg-secondary text-foreground my-6 rounded-r-md border-l-4 py-4 pr-4 pl-5 leading-relaxed [&_p]:my-0 [&_p+p]:mt-3">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      className="text-primary font-medium underline underline-offset-4"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
};

function TermsPage() {
  return (
    <div className="bg-background text-foreground grain min-h-screen">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="pt-8 pb-10">
          <p className="text-eyebrow text-primary text-center">C3TMC Alpha Testing</p>
          <h1 className="text-display mt-6 text-center font-bold">{TERMS_TITLE}</h1>
          <div className="border-border mt-24 flex items-baseline justify-between gap-4 border-b pb-4">
            <p className="text-sm font-semibold">Effective {effectiveDate}</p>
            <a
              href="/"
              className="text-sm font-semibold underline underline-offset-4 hover:no-underline"
            >
              Back to C3TMC
            </a>
          </div>
        </header>
        <Streamdown
          className="text-foreground [&_h1]:text-display [&_h2]:text-title [&_ul]:marker:text-primary [&_h2]:mt-12 [&_h2]:mb-4 [&_li]:my-1.5 [&_p]:my-4 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          components={components}
        >
          {termsMarkdown}
        </Streamdown>
      </article>
    </div>
  );
}

export default TermsPage;
