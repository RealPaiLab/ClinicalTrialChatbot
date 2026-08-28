import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { HoverCardTrigger } from '@/components/ui/hover-card';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationSource,
} from '@/components/ai-elements/inline-citation';
import { useCachedTrialTranslation } from '@/hooks/useCachedTranslation';
import { publicTrialId } from '@/lib/trial';
import type { TrialSummary } from '@/types/trial';

const CITATION_TITLE_MAX_LENGTH = 50;
const COMPACT_TITLE_MAX_LENGTH = 28;
const CITATION_DESCRIPTION_MAX_LENGTH = 200;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

interface TrialCitationProps {
  trialRef: string;
  fetchTrial: (trialRef: string, signal?: AbortSignal) => Promise<TrialSummary>;
  onSelect?: (trialRef: string) => void;
  compact?: boolean;
}

function TrialCitation({ trialRef, fetchTrial, onSelect, compact }: TrialCitationProps) {
  const { data: trial } = useQuery({
    queryKey: ['trial', trialRef],
    queryFn: ({ signal }) => fetchTrial(trialRef, signal),
    enabled: Boolean(trialRef),
  });

  // Shows a translation the app already has; a citation never orders one.
  const translation = useCachedTrialTranslation(trialRef);
  const fullTitle =
    translation?.shortTitle ??
    translation?.officialTitle ??
    trial?.shortTitleEn ??
    trial?.officialTitleEn ??
    publicTrialId(trial) ??
    'Trial';
  const title = truncate(fullTitle, compact ? COMPACT_TITLE_MAX_LENGTH : CITATION_TITLE_MAX_LENGTH);
  const summary = translation?.description ?? trial?.descriptionEn;
  const description = summary ? truncate(summary, CITATION_DESCRIPTION_MAX_LENGTH) : undefined;

  return (
    <InlineCitation>
      <InlineCitationCard>
        <HoverCardTrigger asChild>
          <Button
            type="button"
            variant={compact ? 'outline' : 'secondary'}
            size="sm"
            aria-label={`Show ${title} on the map`}
            onClick={() => onSelect?.(trialRef)}
            className="mx-0.5 inline-flex h-5 max-w-full rounded-full px-2 align-baseline text-[0.7rem] font-medium"
          >
            <span className="truncate">{title}</span>
          </Button>
        </HoverCardTrigger>
        <InlineCitationCardBody>
          <div className="p-3">
            <InlineCitationSource title={title} description={description} />
          </div>
        </InlineCitationCardBody>
      </InlineCitationCard>
    </InlineCitation>
  );
}

export default TrialCitation;
