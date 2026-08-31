import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL } from '@/constants/contact';
import type { SiteContact } from '@/types/contact';

interface ContactRowProps {
  contact: SiteContact;
  publicTrialId: string | null;
}

function mailtoHref(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

function telHref(phoneNumber: string, extension: string | null): string {
  const digits = phoneNumber.replace(/[^\d+]/g, '');
  return extension ? `tel:${digits},${extension}` : `tel:${digits}`;
}

function ContactRow({ contact, publicTrialId }: ContactRowProps) {
  const { t } = useTranslation();
  const [phoneShown, setPhoneShown] = useState(false);
  const name = contact.fullName ?? t('contact.unnamed');
  const subject = publicTrialId
    ? `${CONTACT_EMAIL.subject} ${publicTrialId}`
    : CONTACT_EMAIL.subject;

  return (
    <div className="border-border flex flex-col gap-2 rounded-lg border p-3">
      <span className="text-sm font-medium">{name}</span>
      <div className="flex flex-wrap items-center gap-2">
        {contact.email && (
          <Button asChild size="sm" variant="secondary" className="h-8">
            <a href={mailtoHref(contact.email, subject)} target="_blank" rel="noreferrer noopener">
              <Mail className="size-3.5" />
              {t('contact.email')}
            </a>
          </Button>
        )}
        {contact.phoneNumber &&
          (phoneShown ? (
            <Button asChild size="sm" variant="link" className="h-8 font-mono underline">
              <a href={telHref(contact.phoneNumber, contact.phoneExtension)}>
                <Phone className="size-3.5 shrink-0" />
                {contact.phoneNumber}
                {contact.phoneExtension &&
                  ` ${t('contact.phoneExtension', { ext: contact.phoneExtension })}`}
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="h-8"
              onClick={() => setPhoneShown(true)}
            >
              <Phone className="size-3.5" />
              {t('contact.showPhone')}
            </Button>
          ))}
      </div>
    </div>
  );
}

export default ContactRow;
