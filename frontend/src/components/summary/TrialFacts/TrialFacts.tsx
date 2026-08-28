import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { deriveTrialStatus, formatPhase, primarySite, uniqueCancerTypes } from '@/lib/trial';
import Fact from '@/components/summary/Fact/Fact';
import FactValues from '@/components/summary/FactValues/FactValues';
import type { Trial } from '@/types/trial';

const EMPTY_VALUE = '—';

function TrialFacts({ trial }: { trial: Trial }) {
  const { t } = useTranslation();
  const status = deriveTrialStatus(trial);
  const site = primarySite(trial);
  const cancerTypes = uniqueCancerTypes(trial);
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
