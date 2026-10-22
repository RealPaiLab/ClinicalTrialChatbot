import { useState, type ReactNode } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CamilleIcon from '@/components/layout/CamilleIcon/CamilleIcon';
import CornerMark from '@/components/layout/CornerMark/CornerMark';
import OicrLogo from '@/components/layout/OicrLogo/OicrLogo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AGENT_NAME } from '@/constants/chat';
import { hasConsented, recordConsent } from '@/lib/consent';

interface ConsentGateProps {
  children: ReactNode;
}

function ConsentGate({ children }: ConsentGateProps) {
  const { t } = useTranslation();
  const [consented, setConsented] = useState(hasConsented);
  const [checked, setChecked] = useState(false);

  const handleAgree = () => {
    recordConsent();
    setConsented(true);
  };

  if (consented) return <>{children}</>;

  return (
    <div className="bg-background grain h-screen w-screen">
      <Dialog open>
        {/* Mirrors the mobile menu: corner marks, logo header, separators. */}
        <DialogContent
          className="isolate flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-x-hidden overflow-y-auto rounded-xl p-5 shadow-xl sm:max-w-md sm:p-6"
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <CornerMark className="top-0 right-0" />
          <CornerMark className="bottom-0 left-0 rotate-180" />

          <header className="flex items-center gap-2 pb-3 sm:gap-3">
            <OicrLogo className="h-9 sm:h-11" />
            <span aria-hidden className="bg-border h-8 w-px shrink-0" />
            <div className="group flex min-w-0 items-center gap-2">
              <CamilleIcon className="h-8 sm:h-10" />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="font-display text-lg leading-none font-extrabold tracking-[-0.03em]">
                    {AGENT_NAME}
                  </span>
                  <span className="text-eyebrow text-primary bg-primary/10 rounded-full px-1.5 py-px text-[0.5rem] font-bold whitespace-nowrap">
                    Pre-Release
                  </span>
                </div>
                <span className="text-muted-foreground text-xs leading-tight">
                  {t('app.tagline')}
                </span>
              </div>
            </div>
          </header>
          <Separator />

          <div className="flex flex-col py-7">
            <DialogTitle className="text-subhead leading-snug">
              Welcome to {AGENT_NAME}, the Cancer Trial Chatbot
            </DialogTitle>

            <DialogDescription className="mt-4 text-sm leading-relaxed">
              Please read our{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-medium underline underline-offset-4"
              >
                terms and conditions
              </a>{' '}
              before you start.
            </DialogDescription>

            <label className="border-border hover:bg-secondary/40 bg-card mt-6 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors">
              <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
              <span className="text-sm font-semibold">
                I have read and agree to the {AGENT_NAME} terms and conditions
              </span>
            </label>

            <Button
              className="relative mt-4 h-11 w-full rounded-lg text-sm"
              disabled={!checked}
              onClick={handleAgree}
            >
              Continue
              <ArrowRight aria-hidden className="absolute right-4 size-4" />
            </Button>
          </div>

          <Separator />
          <div className="text-muted-foreground mt-4 flex items-center gap-2.5 text-xs leading-relaxed">
            <Lock aria-hidden className="size-4 shrink-0" />
            <p>
              {AGENT_NAME} is an alpha version. Information may be incomplete and subject to change.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ConsentGate;
