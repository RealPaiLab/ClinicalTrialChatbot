import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { HoverCardTrigger } from '@/components/ui/hover-card';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationSource,
} from '@/components/ai-elements/inline-citation';
import type { TrialSummary } from '@/types/trial';

const CITATION_TITLE_MAX_LENGTH = 50;
const COMPACT_TITLE_MAX_LENGTH = 28;
const CITATION_DESCRIPTION_MAX_LENGTH = 200;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

interface TrialCitationProps {
  nctNumber: string;
  fetchTrial: (nctNumber: string, signal?: AbortSignal) => Promise<TrialSummary>;
  onSelect?: (nctNumber: string) => void;
  compact?: boolean;
}

function TrialCitation({ nctNumber, fetchTrial, onSelect, compact }: TrialCitationProps) {
  const { data: trial } = useQuery({
    queryKey: ['trial', nctNumber],
    queryFn: ({ signal }) => fetchTrial(nctNumber, signal),
    enabled: Boolean(nctNumber),
  });

  const fullTitle = trial?.shortTitleEn ?? trial?.officialTitleEn ?? nctNumber;
  const title = truncate(fullTitle, compact ? COMPACT_TITLE_MAX_LENGTH : CITATION_TITLE_MAX_LENGTH);
  const description = trial?.descriptionEn
    ? truncate(trial.descriptionEn, CITATION_DESCRIPTION_MAX_LENGTH)
    : undefined;

  return (
    <InlineCitation>
      <InlineCitationCard>
        <HoverCardTrigger asChild>
          <Button
            type="button"
            variant={compact ? 'outline' : 'secondary'}
            size="sm"
            aria-label={`Show trial ${nctNumber} on the map`}
            onClick={() => onSelect?.(nctNumber)}
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
