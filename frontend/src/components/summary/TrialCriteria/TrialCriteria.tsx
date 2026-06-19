import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageResponse } from '@/components/ai-elements/message';
import type { Trial } from '@/types/trial';

function TrialCriteria({ trial }: { trial: Trial }) {
  const hasInclusion = Boolean(trial.inclusionCriteriaEn);
  const hasExclusion = Boolean(trial.exclusionCriteriaEn);

  if (!hasInclusion && !hasExclusion) return null;

  return (
    <Accordion type="multiple" className="w-full">
      {hasInclusion && (
        <AccordionItem value="inclusion">
          <AccordionTrigger>Who can join</AccordionTrigger>
          <AccordionContent>
            <MessageResponse className="text-muted-foreground text-sm">
              {trial.inclusionCriteriaEn ?? ''}
            </MessageResponse>
          </AccordionContent>
        </AccordionItem>
      )}
      {hasExclusion && (
        <AccordionItem value="exclusion">
          <AccordionTrigger>Who cannot join</AccordionTrigger>
          <AccordionContent>
            <MessageResponse className="text-muted-foreground text-sm">
              {trial.exclusionCriteriaEn ?? ''}
            </MessageResponse>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

export default TrialCriteria;
