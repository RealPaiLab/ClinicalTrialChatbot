import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import ContactRow from '@/components/contact/ContactRow/ContactRow';
import ContactSiteStep from '@/components/contact/ContactSiteStep/ContactSiteStep';
import { trialContactsQuery } from '@/services/contacts';

export interface ContactDialogBodyProps {
  trialRef: string;
  publicTrialId: string | null;
  /** Set when a map pin already chose a site, which skips the site step. */
  preselectedSiteName?: string | null;
}

function ContactDialogBody({
  trialRef,
  publicTrialId,
  preselectedSiteName,
}: ContactDialogBodyProps) {
  const { t } = useTranslation();
  const [siteName, setSiteName] = useState<string | null>(preselectedSiteName ?? null);
  const { data, isPending, isError } = useQuery(trialContactsQuery(trialRef));

  const sites = data?.sites ?? [];
  const entry = sites.find((candidate) => candidate.site.nameEn === siteName) ?? null;
  const showBack = entry !== null && sites.length > 1;

  return (
    <>
      <DialogHeader className="gap-0 text-left">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Mail className="size-4" />
          </div>
          <DialogTitle className="text-base leading-snug">{t('contact.title')}</DialogTitle>
        </div>
        <DialogDescription className="mt-3 text-xs leading-relaxed">
          {entry ? t('contact.contactsAt', { site: entry.site.nameEn }) : t('contact.sitePrompt')}
        </DialogDescription>
      </DialogHeader>

      <Alert className="mt-4">
        <ShieldAlert />
        <AlertTitle>{t('contact.adviceTitle')}</AlertTitle>
        <AlertDescription className="text-xs leading-relaxed">
          {t('contact.adviceBody')}
        </AlertDescription>
      </Alert>

      <ScrollArea type="hover" className="mt-4 -mr-3 max-h-[45vh]">
        <div className="pr-3">
          {isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <p className="text-caption text-destructive">{t('contact.loadError')}</p>
          ) : entry ? (
            entry.contacts.length === 0 ? (
              <p className="text-caption text-muted-foreground">{t('contact.emptyBody')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {entry.contacts.map((contact, index) => (
                  <ContactRow key={index} contact={contact} publicTrialId={publicTrialId} />
                ))}
              </div>
            )
          ) : (
            <ContactSiteStep sites={sites} onSelect={setSiteName} />
          )}
        </div>
      </ScrollArea>

      {showBack && (
        <Button
          variant="ghost"
          className="text-muted-foreground mt-3 h-8 w-full text-xs"
          onClick={() => setSiteName(null)}
        >
          <ArrowLeft className="size-3.5" />
          {t('contact.changeSite')}
        </Button>
      )}
    </>
  );
}

export default ContactDialogBody;
