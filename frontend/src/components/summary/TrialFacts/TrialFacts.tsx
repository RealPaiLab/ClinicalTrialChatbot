import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { normalizeStatus, TRIAL_STATUS } from '@/lib/trialStatus';
import {
  deriveTrialStatus,
  findSite,
  formatPhase,
  primarySite,
  uniqueCancerTypes,
} from '@/lib/trial';
import Fact from '@/components/summary/Fact/Fact';
import FactValues from '@/components/summary/FactValues/FactValues';
import type { Trial } from '@/types/trial';

const EMPTY_VALUE = '—';

interface TrialFactsProps {
  trial: Trial;
  selectedSiteName?: string | null;
}

function TrialFacts({ trial, selectedSiteName }: TrialFactsProps) {
  const { t } = useTranslation();
  const selected = findSite(trial, selectedSiteName);
  const site = selected ?? primarySite(trial);
  const status = selected ? normalizeStatus(selected.state) : deriveTrialStatus(trial);
  const cancerTypes = selected ? [...new Set(selected.cancerTypeNames)] : uniqueCancerTypes(trial);
  const phases = trial.phases.map(formatPhase);
  const treatments = trial.treatmentTypeNames;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Fact label={t('summary.status')}>
        {status ? (
          <span className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', TRIAL_STATUS[status].badgeClass)} />
            {t(TRIAL_STATUS[status].labelKey)}
          </span>
        ) : (
          EMPTY_VALUE
        )}
      </Fact>
      <Fact label={t('summary.cancerType')}>
        {cancerTypes.length ? (
          <FactValues key={cancerTypes.join('|')} values={cancerTypes} className="capitalize" />
        ) : (
          EMPTY_VALUE
        )}
      </Fact>
      <Fact label={t('summary.phase')}>
        {phases.length ? (
          <FactValues key={phases.join('|')} values={phases} separator=" / " />
        ) : (
          EMPTY_VALUE
        )}
      </Fact>
      {treatments.length > 0 && (
        <Fact label={t('summary.treatment')}>
          <FactValues key={treatments.join('|')} values={treatments} className="capitalize" />
        </Fact>
      )}
      <Fact label={t('summary.province')}>{site?.province ?? EMPTY_VALUE}</Fact>
      <Fact label={t('summary.city')}>{site?.city ?? EMPTY_VALUE}</Fact>
    </dl>
  );
}

export default TrialFacts;
