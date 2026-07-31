import { Check, Languages } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LANGUAGES, type LanguageCode } from '@/constants/language';
import type { PanelStrings } from '@/constants/i18n';
import { cn } from '@/lib/utils';

interface LanguagePickerProps {
  language: LanguageCode | null;
  onSelect: (language: LanguageCode | null) => void;
  strings: PanelStrings;
}

function LanguagePicker({ language, onSelect, strings }: LanguagePickerProps) {
  const [open, setOpen] = useState(false);

  const select = (next: LanguageCode | null) => {
    onSelect(next);
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
                aria-label={strings.translate}
                className={cn(language && 'text-primary')}
              >
                <Languages />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{strings.translate}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="grid grid-cols-3 gap-1">
          {LANGUAGES.map((option) => (
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
        {language && (
          <button
            type="button"
            onClick={() => select(null)}
            className="text-caption text-muted-foreground hover:text-foreground mt-2 flex w-full items-center justify-center gap-1.5 border-t pt-2 transition-colors"
          >
            <Check className="size-3" />
            {strings.seeOriginal}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default LanguagePicker;
