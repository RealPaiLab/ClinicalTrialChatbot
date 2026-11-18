import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import ContactDialog from '@/components/contact/ContactDialog/ContactDialog';
import { publicTrialId } from '@/lib/trial';
import { trialQuery } from '@/services/trials';

interface TrialContactLinkProps {
  trialRef: string;
}

function TrialContactLink({ trialRef }: TrialContactLinkProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: trial } = useQuery(trialQuery(trialRef));

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={t('contact.cta')}
        onClick={() => setOpen(true)}
        className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-primary/20 mx-0.5 inline-flex h-5 max-w-full rounded-full border px-2 align-baseline text-[0.7rem] font-medium"
      >
        <Mail className="size-3" />
        <span className="truncate">{t('contact.cta')}</span>
      </Button>
      <ContactDialog
        trialRef={trialRef}
        publicTrialId={publicTrialId(trial)}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export default TrialContactLink;
