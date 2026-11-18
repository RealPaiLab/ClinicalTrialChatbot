import { useState, type ReactNode } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import LanguageOptions from '@/components/language/LanguageOptions/LanguageOptions';
import { useAppStore } from '@/store/appStore';

interface LanguageGateProps {
  children: ReactNode;
}

function LanguageGate({ children }: LanguageGateProps) {
  const { t } = useTranslation();
  const markLanguageChosen = useAppStore((state) => state.markLanguageChosen);
  const [needsChoice] = useState(() => !useAppStore.getState().hasChosenLanguage);
  const [open, setOpen] = useState(true);

  if (!needsChoice) return <>{children}</>;

  const choose = () => {
    markLanguageChosen();
    setOpen(false);
  };

  return (
    <>
      {children}
      <Dialog open={open}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[var(--scrim)] backdrop-blur-[7px] supports-backdrop-filter:backdrop-blur-[7px]"
          className="gap-0 rounded-2xl p-6 shadow-xl sm:max-w-xs"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Languages className="size-4" />
            </div>
            <DialogTitle className="text-base leading-snug">{t('languageGate.title')}</DialogTitle>
          </div>

          <DialogDescription className="mt-3 mb-4 text-xs leading-relaxed">
            {t('languageGate.description')}
          </DialogDescription>

          <LanguageOptions onSelect={choose} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LanguageGate;
