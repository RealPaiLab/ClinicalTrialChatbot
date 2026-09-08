import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LANGUAGE_TARGETS, LanguageCode } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { cn } from '@/lib/utils';

function LanguagePicker() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppLanguage();
  const [open, setOpen] = useState(false);

  const select = (next: LanguageCode) => {
    setLanguage(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-tour="language"
                aria-label={t('header.language')}
                className={cn(language !== LanguageCode.En && 'text-primary')}
              >
                <Languages />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{t('header.language')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="grid grid-cols-3 gap-1">
          {LANGUAGE_TARGETS.map((option) => (
            <button
              key={option.code}
              type="button"
              lang={option.code}
              onClick={() => select(option.code)}
              className={cn(
                'hover:bg-accent flex flex-col items-center gap-1 rounded-md px-1 py-2 transition-colors',
                language === option.code && 'bg-accent text-primary'
              )}
            >
              <span aria-hidden className="text-lg leading-none">
                {option.flag}
              </span>
              <span className="text-caption text-center leading-tight">{option.endonym}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => select(LanguageCode.En)}
          className={cn(
            'text-caption hover:bg-accent mt-1 w-full cursor-pointer rounded-md py-1.5 text-center transition-colors',
            language === LanguageCode.En ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {t('header.useEnglish')}
        </button>
      </PopoverContent>
    </Popover>
  );
}

export default LanguagePicker;
