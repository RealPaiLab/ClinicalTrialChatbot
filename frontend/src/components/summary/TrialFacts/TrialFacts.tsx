import { useTranslation } from 'react-i18next';
import Fact from '@/components/summary/Fact/Fact';
import FactValues from '@/components/summary/FactValues/FactValues';
import StatusLabel from '@/components/trial/StatusLabel/StatusLabel';
import {
  deriveTrialStatus,
  findSiteByKey,
  formatPhase,
  normalizeStatus,
  primarySite,
  uniqueCancerTypes,
} from '@/lib/trial';
import type { Trial } from '@/types/trial';

const EMPTY_VALUE = '—';

interface TrialFactsProps {
  trial: Trial;
  /** Describes this site instead of the trial's primary one. */
  siteKey?: string | null;
}

function TrialFacts({ trial, siteKey = null }: TrialFactsProps) {
  const { t } = useTranslation();
  const selected = findSiteByKey(trial, siteKey);
  const site = selected ?? primarySite(trial);
  const status = selected ? normalizeStatus(selected.state) : deriveTrialStatus(trial);
  const cancerTypes = selected ? [...new Set(selected.cancerTypeNames)] : uniqueCancerTypes(trial);
  const phases = trial.phases.map(formatPhase);
  const treatments = trial.treatmentTypeNames;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Fact label={t('summary.status')}>
        {status ? <StatusLabel status={status} /> : EMPTY_VALUE}
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
      {trial.ageRangeText && <Fact label={t('summary.age')}>{trial.ageRangeText}</Fact>}
      <Fact label={t('summary.province')}>{site?.province ?? EMPTY_VALUE}</Fact>
      <Fact label={t('summary.city')}>{site?.city ?? EMPTY_VALUE}</Fact>
    </dl>
  );
}

export default TrialFacts;
