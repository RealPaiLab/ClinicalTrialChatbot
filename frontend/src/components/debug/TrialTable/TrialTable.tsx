import { Fragment, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageResponse } from '@/components/ai-elements/message';
import TrialFacts from '@/components/summary/TrialFacts/TrialFacts';
import TrialCriteria from '@/components/summary/TrialCriteria/TrialCriteria';
import StatusLabel from '@/components/trial/StatusLabel/StatusLabel';
import {
  deriveTrialStatus,
  formatPhases,
  normalizeStatus,
  sitePlace,
  trialTitle,
  uniqueCancerTypes,
} from '@/lib/trial';
import { cn } from '@/lib/utils';
import type { Trial } from '@/types/trial';

interface TrialTableProps {
  trials: Trial[];
}

function StatusCell({ trial }: { trial: Trial }) {
  const status = deriveTrialStatus(trial);
  if (status) return <StatusLabel status={status} className="text-xs" />;
  const raw = trial.sites[0]?.state;
  return <span className="text-muted-foreground text-xs">{raw ?? '—'}</span>;
}

function CancerTypesCell({ trial }: { trial: Trial }) {
  const types = uniqueCancerTypes(trial);
  if (types.length === 0) return <span className="text-muted-foreground">—</span>;
  const shown = types.slice(0, 2);
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((type) => (
        <Badge key={type} variant="secondary" className="max-w-[10rem] truncate">
          {type}
        </Badge>
      ))}
      {types.length > shown.length && (
        <Badge variant="outline">+{types.length - shown.length}</Badge>
      )}
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  const status = normalizeStatus(state);
  return (
    <Badge variant="secondary" className="gap-1.5">
      {status ? (
        <StatusLabel status={status} />
      ) : (
        <>
          <span className="bg-muted-foreground size-2 rounded-full" />
          {state}
        </>
      )}
    </Badge>
  );
}

function SitesList({ trial }: { trial: Trial }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-eyebrow text-muted-foreground">Sites ({trial.sites.length})</p>
      <ul className="flex flex-col gap-1.5">
        {trial.sites.map((site, index) => {
          const place = sitePlace(site);
          return (
            <li
              key={`${site.nameEn}-${index}`}
              className="flex flex-wrap items-center gap-x-1.5 text-sm"
            >
              <span className="font-medium">{site.nameEn}</span>
              {place && <span className="text-muted-foreground">· {place}</span>}
              {site.state && <StatusBadge state={site.state} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TrialDetail({ trial }: { trial: Trial }) {
  return (
    <div className="bg-muted/30 flex flex-col gap-5 p-4 break-words whitespace-normal">
      <TrialFacts trial={trial} />
      {trial.descriptionEn && (
        <MessageResponse className="text-muted-foreground text-sm leading-relaxed">
          {trial.descriptionEn}
        </MessageResponse>
      )}
      <TrialCriteria trial={trial} />
      {trial.sites.length > 0 && <SitesList trial={trial} />}
    </div>
  );
}

function TrialTable({ trials }: TrialTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (trialRef: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(trialRef)) next.delete(trialRef);
      else next.add(trialRef);
      return next;
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>NCT</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Phases</TableHead>
          <TableHead>Cancer types</TableHead>
          <TableHead className="text-right">Sites</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trials.map((trial) => {
          const isOpen = expanded.has(trial.trialRef);
          return (
            <Fragment key={trial.trialRef}>
              <TableRow
                aria-expanded={isOpen}
                onClick={() => toggle(trial.trialRef)}
                className="cursor-pointer"
              >
                <TableCell>
                  <ChevronRight
                    className={cn(
                      'text-muted-foreground size-4 transition-transform',
                      isOpen && 'rotate-90'
                    )}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{trial.trialRef}</TableCell>
                <TableCell className="max-w-[22rem] whitespace-normal">
                  {trialTitle(trial)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {trial.phases.length ? formatPhases(trial.phases) : '—'}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <CancerTypesCell trial={trial} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{trial.sites.length}</TableCell>
                <TableCell>
                  <StatusCell trial={trial} />
                </TableCell>
              </TableRow>
              {isOpen && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <TrialDetail trial={trial} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default TrialTable;
