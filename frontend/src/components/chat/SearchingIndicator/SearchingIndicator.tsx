import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '@/components/Spinner/Spinner';

const ROTATE_INTERVAL_MS = 5000;

const SEARCH_KEYS = [
  'searching.trials',
  'searching.criteria',
  'searching.sites',
  'searching.phases',
  'searching.gathering',
] as const;

type SearchKey = (typeof SEARCH_KEYS)[number];

function pickKey(exclude?: SearchKey): SearchKey {
  const pool = exclude ? SEARCH_KEYS.filter((key) => key !== exclude) : SEARCH_KEYS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function SearchingIndicator() {
  const { t } = useTranslation();
  const [key, setKey] = useState<SearchKey>(() => pickKey());

  useEffect(() => {
    const id = setInterval(() => setKey((current) => pickKey(current)), ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs tracking-tight">
      <Spinner className="text-amber text-base" />
      <span role="status" aria-live="polite">
        {t(key)}
      </span>
    </div>
  );
}

export default SearchingIndicator;
