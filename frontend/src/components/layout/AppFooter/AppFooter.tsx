const LINKS = [
  { label: 'Terms and Conditions', href: 'https://oicr.on.ca/terms-and-conditions/' },
  { label: 'OICR Privacy Statement', href: 'https://oicr.on.ca/website-privacy-statement/' },
] as const;

function AppFooter() {
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
            {link.label}
          </a>
        </span>
      ))}
    </footer>
  );
}

export default AppFooter;
