import { MapPin, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Trial } from '@/types/trial';

interface SelectedTrialsProps {
  trials: Trial[];
  onRemove?: (nctNumber: string) => void;
}

function SelectedTrials({ trials, onRemove }: SelectedTrialsProps) {
  const { t } = useTranslation();

  if (trials.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {trials.map((trial) => {
        const nctNumber = trial.nctNumber ?? '';
        const label = trial.shortTitleEn ?? trial.officialTitleEn ?? nctNumber;
        return (
          <Badge key={nctNumber} variant="secondary" className="gap-1.5 py-1 pr-1 pl-2">
            <MapPin className="size-3 shrink-0" />
            <span className="max-w-[12rem] truncate">{label}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('chat.removeFromContext', { nctNumber })}
              onClick={() => onRemove?.(nctNumber)}
              className="size-4 rounded-full hover:bg-transparent"
            >
              <X className="size-3" />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
}

export default SelectedTrials;
