import { useState, type ReactNode } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import ConsentArtwork from '@/components/consent/ConsentArtwork';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { hasConsented, recordConsent } from '@/lib/consent';

interface ConsentGateProps {
  children: ReactNode;
}

function ConsentGate({ children }: ConsentGateProps) {
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
        <DialogContent
          className="grid-cols-1 gap-0 overflow-hidden rounded-2xl p-0 shadow-xl sm:max-w-3xl sm:grid-cols-[0.44fr_0.56fr] [&>button]:hidden"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <ConsentArtwork />

          <div className="bg-card flex flex-col p-8">
            <DialogTitle className="text-subhead leading-snug">
              Welcome to the Canadian Cancer Clinical Trials Map and Chatbot (C3TMC)
            </DialogTitle>

            <DialogDescription className="mt-4 text-xs leading-relaxed">
              By using this website, you are agreeing to our{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-medium underline underline-offset-4"
              >
                terms and conditions
              </a>
              .
            </DialogDescription>

            <label className="border-border hover:bg-secondary/40 mt-5 flex cursor-pointer flex-col gap-1.5 rounded-lg border p-3 transition-colors">
              <span className="flex items-center gap-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value === true)}
                  aria-describedby="consent-help"
                />
                <span className="text-xs font-semibold">
                  I agree to the C3TMC terms and conditions
                </span>
              </span>
              <span id="consent-help" className="text-muted-foreground pl-7 text-[11px]">
                You must agree to the terms and conditions to continue.
              </span>
            </label>

            <Button
              className="relative mt-4 h-9 w-full rounded-lg text-xs"
              disabled={!checked}
              onClick={handleAgree}
            >
              Continue
              <ArrowRight aria-hidden className="absolute right-4 size-4" />
            </Button>

            <hr className="border-border mt-6" />
            <div className="text-muted-foreground mt-5 flex items-center gap-2.5 text-[11px] leading-relaxed">
              <Lock aria-hidden className="size-4 shrink-0" />
              <p>C3TMC is an alpha version. Information may be incomplete and subject to change.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ConsentGate;
