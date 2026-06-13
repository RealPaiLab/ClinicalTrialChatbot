import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
          <AccordionContent className="text-muted-foreground text-sm whitespace-pre-line">
            {trial.inclusionCriteriaEn}
          </AccordionContent>
        </AccordionItem>
      )}
      {hasExclusion && (
        <AccordionItem value="exclusion">
          <AccordionTrigger>Who cannot join</AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm whitespace-pre-line">
            {trial.exclusionCriteriaEn}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

export default TrialCriteria;
