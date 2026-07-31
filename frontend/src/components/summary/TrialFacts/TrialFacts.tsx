import { cn } from '@/lib/utils';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { deriveTrialStatus, formatPhases, primarySite, uniqueCancerTypes } from '@/lib/trial';
import Fact from '@/components/summary/Fact/Fact';
import type { PanelStrings } from '@/constants/i18n';
import type { Trial } from '@/types/trial';

const EMPTY_VALUE = '—';

function TrialFacts({ trial, strings }: { trial: Trial; strings: PanelStrings }) {
  const status = deriveTrialStatus(trial);
  const site = primarySite(trial);
  const cancerTypes = uniqueCancerTypes(trial);
  const phases = formatPhases(trial.phases);
  const treatments = trial.treatmentTypeNames.join(', ');
  const statusLabel = status === 'recruiting' ? strings.recruiting : strings.openingSoon;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Fact label={strings.status}>
        {status ? (
          <span className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', TRIAL_STATUS[status].badgeClass)} />
            {statusLabel}
          </span>
        ) : (
          EMPTY_VALUE
        )}
      </Fact>
      <Fact label={strings.cancerType}>
        <span className="capitalize">
          {cancerTypes.length ? cancerTypes.join(', ') : EMPTY_VALUE}
        </span>
      </Fact>
      <Fact label={strings.phase}>{phases || EMPTY_VALUE}</Fact>
      {treatments && (
        <Fact label={strings.treatment}>
          <span className="capitalize">{treatments}</span>
        </Fact>
      )}
      <Fact label={strings.province}>{site?.province ?? EMPTY_VALUE}</Fact>
      <Fact label={strings.city}>{site?.city ?? EMPTY_VALUE}</Fact>
    </dl>
  );
}

export default TrialFacts;
