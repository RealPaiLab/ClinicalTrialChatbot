import { Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Trial } from '@/types/trial';

const TRIAL_URL_BASE = 'https://www.cancertrialscanada.ca/trial/';

interface TrialSummaryHeaderProps {
  trial: Trial;
  onClose?: () => void;
  onAddToContext?: (nctNumber: string) => void;
  isInContext?: boolean;
}

function TrialSummaryHeader({
  trial,
  onClose,
  onAddToContext,
  isInContext,
}: TrialSummaryHeaderProps) {
  const title = trial.officialTitleEn ?? trial.shortTitleEn ?? trial.nctNumber ?? 'Trial';
  const trialUrl = trial.acronymOrProtocolId
    ? `${TRIAL_URL_BASE}${encodeURIComponent(trial.acronymOrProtocolId)}`
    : null;

  return (
    <div className="border-border flex items-start justify-between gap-3 border-b p-4">
      <div className="flex min-w-0 flex-col gap-1">
        {trial.nctNumber && (
          <span className="text-eyebrow text-primary font-mono">{trial.nctNumber}</span>
        )}
        <h2 className="font-display text-lg leading-snug font-semibold">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onAddToContext && trial.nctNumber && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isInContext ? 'Added to your chat' : 'Ask Camille about this trial'}
                  disabled={isInContext}
                  onClick={() => onAddToContext(trial.nctNumber as string)}
                >
                  {isInContext ? <Check className="text-recruiting" /> : <Sparkles />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isInContext
                  ? 'Added, ask Camille anything about it'
                  : 'Ask Camille about this trial'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {trialUrl && (
          <Button asChild variant="ghost" size="icon" aria-label="View on Cancer Trials Canada">
            <a href={trialUrl} target="_blank" rel="noreferrer">
              <ExternalLink />
            </a>
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

export default TrialSummaryHeader;
