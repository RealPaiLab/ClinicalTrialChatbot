import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LanguageOptions from '@/components/language/LanguageOptions/LanguageOptions';
import { LanguageCode } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { cn } from '@/lib/utils';

function LanguagePicker() {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const [open, setOpen] = useState(false);

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
        <LanguageOptions onSelect={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

export default LanguagePicker;
