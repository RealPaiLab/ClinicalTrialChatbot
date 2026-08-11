import type { ReactNode } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { LANGUAGE_TARGETS, LanguageCode } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

interface LanguageGateProps {
  children: ReactNode;
}

function LanguageGate({ children }: LanguageGateProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppLanguage();
  const hasChosenLanguage = useAppStore((state) => state.hasChosenLanguage);
  const markLanguageChosen = useAppStore((state) => state.markLanguageChosen);

  if (hasChosenLanguage) return <>{children}</>;

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    markLanguageChosen();
  };

  return (
    <>
      {children}
      <Dialog open>
        <DialogContent
          showCloseButton={false}
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

          <DialogDescription className="mt-3 text-xs leading-relaxed">
            {t('languageGate.description')}
          </DialogDescription>

          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {LANGUAGE_TARGETS.map((option) => (
              <button
                key={option.code}
                type="button"
                lang={option.code}
                onClick={() => choose(option.code)}
                className={cn(
                  'border-border hover:bg-accent flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-1 py-2.5 transition-colors',
                  language === option.code && 'border-primary bg-accent text-primary'
                )}
              >
                <span aria-hidden className="text-lg leading-none">
                  {option.flag}
                </span>
                <span className="text-caption text-center leading-tight">{option.endonym}</span>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            className="text-muted-foreground mt-3 h-8 w-full text-xs"
            onClick={() => choose(LanguageCode.En)}
          >
            {t('header.useEnglish')}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LanguageGate;
