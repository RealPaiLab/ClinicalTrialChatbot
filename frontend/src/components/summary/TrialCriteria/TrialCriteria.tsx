import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageResponse } from '@/components/ai-elements/message';
import type { PanelStrings } from '@/constants/i18n';
import type { Trial } from '@/types/trial';

function TrialCriteria({ trial, strings }: { trial: Trial; strings: PanelStrings }) {
  const hasInclusion = Boolean(trial.inclusionCriteriaEn);
  const hasExclusion = Boolean(trial.exclusionCriteriaEn);

  if (!hasInclusion && !hasExclusion) return null;

  return (
    <Accordion type="multiple" className="w-full">
      {hasInclusion && (
        <AccordionItem value="inclusion">
          <AccordionTrigger>{strings.whoCanJoin}</AccordionTrigger>
          <AccordionContent>
            <MessageResponse className="text-muted-foreground text-sm">
              {trial.inclusionCriteriaEn ?? ''}
            </MessageResponse>
          </AccordionContent>
        </AccordionItem>
      )}
      {hasExclusion && (
        <AccordionItem value="exclusion">
          <AccordionTrigger>{strings.whoCannotJoin}</AccordionTrigger>
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
