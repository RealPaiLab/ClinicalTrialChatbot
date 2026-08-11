import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';
import { MessageResponse } from '@/components/ai-elements/message';
import type { Trial } from '@/types/trial';

function TrialCriteria({ trial }: { trial: Trial }) {
  const { t } = useTranslation();
  const hasInclusion = Boolean(trial.inclusionCriteriaEn);
  const hasExclusion = Boolean(trial.exclusionCriteriaEn);

  if (!hasInclusion && !hasExclusion) return null;

  return (
    <Accordion type="multiple" className="w-full">
      {hasInclusion && (
        <AccordionItem value="inclusion">
          <AccordionTrigger>{t('summary.whoCanJoin')}</AccordionTrigger>
          <AccordionContent>
            <MessageResponse className="text-muted-foreground text-sm">
              {trial.inclusionCriteriaEn ?? ''}
            </MessageResponse>
          </AccordionContent>
        </AccordionItem>
      )}
      {hasExclusion && (
        <AccordionItem value="exclusion">
          <AccordionTrigger>{t('summary.whoCannotJoin')}</AccordionTrigger>
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
