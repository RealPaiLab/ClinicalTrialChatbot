import { useTranslation } from 'react-i18next';
import StatusDot from '@/components/trial/StatusDot/StatusDot';
import { normalizeStatus, sitePlace } from '@/lib/trial';
import { cn } from '@/lib/utils';
import type { SiteContacts } from '@/types/contact';

interface ContactSiteStepProps {
  sites: SiteContacts[];
  onSelect: (siteName: string) => void;
}

function ContactSiteStep({ sites, onSelect }: ContactSiteStepProps) {
  const { t } = useTranslation();

  if (sites.every(({ contacts }) => contacts.length === 0)) {
    return <p className="text-caption text-muted-foreground">{t('contact.emptyBody')}</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {sites.map(({ site, contacts }) => {
        const status = normalizeStatus(site.state);
        const place = sitePlace(site);
        const reachable = contacts.length > 0;
        return (
          <button
            key={site.nameEn}
            type="button"
            disabled={!reachable}
            onClick={() => onSelect(site.nameEn)}
            className={cn(
              'border-border flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
              reachable ? 'hover:bg-accent cursor-pointer' : 'opacity-55'
            )}
          >
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {status && <StatusDot status={status} className="size-1.5" />}
              {site.nameEn}
            </span>
            <span className="text-caption text-muted-foreground">
              {reachable
                ? place
                : [place, t('contact.noContactsAtSite')].filter(Boolean).join(' · ')}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ContactSiteStep;
