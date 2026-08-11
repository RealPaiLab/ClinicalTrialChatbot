import { useTranslation } from 'react-i18next';

const LINKS = [
  { key: 'footer.terms', href: '/terms' },
  { key: 'footer.oicrTerms', href: 'https://oicr.on.ca/terms-and-conditions/' },
  { key: 'footer.oicrPrivacy', href: 'https://oicr.on.ca/website-privacy-statement/' },
] as const;

function AppFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-header text-muted-foreground border-border before:bg-amber/80 relative flex h-8 shrink-0 items-center justify-center gap-2 border-t text-[0.7rem] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:content-['']">
      {LINKS.map((link, index) => (
        <span key={link.href} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden="true">·</span>}
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground underline underline-offset-2 transition-colors"
          >
            {t(link.key)}
          </a>
        </span>
      ))}
    </footer>
  );
}

export default AppFooter;
