import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LANGUAGE_TARGETS, LanguageCode } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { cn } from '@/lib/utils';

interface LanguageOptionsProps {
  onSelect?: (language: LanguageCode) => void;
}

/** The language grid with its English opt-out: the first-visit gate, the header picker and the mobile menu. */
function LanguageOptions({ onSelect }: LanguageOptionsProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppLanguage();

  const select = (next: LanguageCode) => {
    setLanguage(next);
    onSelect?.(next);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        {LANGUAGE_TARGETS.map((option) => (
          <button
            key={option.code}
            type="button"
            lang={option.code}
            onClick={() => select(option.code)}
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
        className={cn(
          'mt-2 h-8 w-full text-xs',
          language === LanguageCode.En ? 'text-primary' : 'text-muted-foreground'
        )}
        onClick={() => select(LanguageCode.En)}
      >
        {t('header.useEnglish')}
      </Button>
    </div>
  );
}

export default LanguageOptions;
