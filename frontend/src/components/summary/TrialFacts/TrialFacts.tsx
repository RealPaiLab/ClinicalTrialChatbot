import { cn } from '@/lib/utils';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { deriveTrialStatus, formatPhases, primarySite, uniqueCancerTypes } from '@/lib/trial';
import Fact from '@/components/summary/Fact/Fact';
import type { Trial } from '@/types/trial';

const EMPTY_VALUE = '—';

function TrialFacts({ trial }: { trial: Trial }) {
  const status = deriveTrialStatus(trial);
  const site = primarySite(trial);
  const cancerTypes = uniqueCancerTypes(trial);
  const phases = formatPhases(trial.phases);
  const treatments = trial.treatmentTypeNames.join(', ');

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Fact label="Status">
        {status ? (
          <span className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', TRIAL_STATUS[status].badgeClass)} />
            {TRIAL_STATUS[status].label}
          </span>
        ) : (
          EMPTY_VALUE
        )}
      </Fact>
      <Fact label="Cancer type">
        <span className="capitalize">
          {cancerTypes.length ? cancerTypes.join(', ') : EMPTY_VALUE}
        </span>
      </Fact>
      <Fact label="Phase">{phases || EMPTY_VALUE}</Fact>
      {treatments && (
        <Fact label="Treatment">
          <span className="capitalize">{treatments}</span>
        </Fact>
      )}
      <Fact label="Province">{site?.province ?? EMPTY_VALUE}</Fact>
      <Fact label="City">{site?.city ?? EMPTY_VALUE}</Fact>
    </dl>
  );
}

export default TrialFacts;
