import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { debugTrialsQuery, type DebugSearchParams } from '@/services/debug';
import TrialTable from '@/components/debug/TrialTable/TrialTable';

const PAGE_SIZE = 10;

const ANY_STATUS = 'any';

const STATUS_OPTIONS = Object.entries(TRIAL_STATUS).map(([value, config]) => ({
  value,
  label: config.label,
}));

type Mode = 'lexical' | 'semantic';

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

interface FilterFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function FilterField({ label, value, onChange, placeholder }: FilterFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-eyebrow text-muted-foreground">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </label>
  );
}

function DebugPage() {
  const [cancerTypes, setCancerTypes] = useState('');
  const [locations, setLocations] = useState('');
  const [status, setStatus] = useState<string>(ANY_STATUS);
  const [phases, setPhases] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('lexical');
  const [criteria, setCriteria] = useState<DebugSearchParams>({});
  const [page, setPage] = useState(0);

  const params: DebugSearchParams = {
    ...criteria,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data: trials = [], isFetching, isError } = useQuery(debugTrialsQuery(params));

  const runSearch = () => {
    setPage(0);
    setCriteria({
      cancerTypes: splitList(cancerTypes),
      locations: splitList(locations),
      statuses: status === ANY_STATUS ? [] : [status],
      phases: splitList(phases),
      query: mode === 'lexical' ? text : undefined,
      semantic: mode === 'semantic' ? text : undefined,
    });
  };

  const hasNextPage = trials.length === PAGE_SIZE;

  return (
    <div className="text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <header className="bg-header text-header-foreground border-border after:bg-amber relative flex h-12 shrink-0 items-center justify-between border-b px-4 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:content-['']">
        <div className="flex items-center gap-3">
          <span className="text-eyebrow">Trial Inspector</span>
          <span className="text-muted-foreground text-xs">internal · agent parity</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Chat
          </Link>
        </Button>
      </header>

      <div className="border-border bg-card/40 shrink-0 border-b px-4 py-3">
        <div className="grid gap-3 md:grid-cols-4">
          <FilterField
            label="Cancer types"
            value={cancerTypes}
            onChange={setCancerTypes}
            placeholder="Breast Cancer, Lung Cancer"
          />
          <FilterField
            label="Locations"
            value={locations}
            onChange={setLocations}
            placeholder="Toronto, Ontario"
          />
          <div className="flex flex-col gap-1">
            <span className="text-eyebrow text-muted-foreground">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_STATUS}>Any status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FilterField
            label="Phases"
            value={phases}
            onChange={setPhases}
            placeholder="PHASE2, PHASE3"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-eyebrow text-muted-foreground">Mode</span>
            <div className="border-border flex overflow-hidden rounded-md border">
              {(['lexical', 'semantic'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={cn(
                    'h-8 px-3 text-xs capitalize transition-colors',
                    mode === option
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && runSearch()}
            placeholder={
              mode === 'lexical'
                ? 'Free-text keyword search (optional)'
                : 'Describe the patient in English (semantic)'
            }
            className="h-8 min-w-64 flex-1 text-sm"
          />
          <Button size="sm" onClick={runSearch} disabled={isFetching}>
            <Search className="size-4" />
            Search
          </Button>
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-auto px-4 py-3">
        {isError ? (
          <p className="text-destructive text-sm">Search failed. Is the backend running?</p>
        ) : trials.length === 0 && page === 0 && !isFetching ? (
          <p className="text-muted-foreground text-sm">No trials match these filters.</p>
        ) : (
          <>
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
              <span>
                {trials.length} on this page · page {page + 1}
              </span>
              {isFetching && <span>· loading…</span>}
            </div>
            <div className="border-border overflow-hidden rounded-lg border shadow-sm">
              <TrialTable trials={trials} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || isFetching}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="text-muted-foreground px-2 text-xs tabular-nums">
                Page {page + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default DebugPage;
