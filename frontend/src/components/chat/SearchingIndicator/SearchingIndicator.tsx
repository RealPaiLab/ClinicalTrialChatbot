import { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner/Spinner';

const ROTATE_INTERVAL_MS = 5000;

const SEARCH_MESSAGES = [
  'Searching clinical trials…',
  'Matching your details to eligibility criteria…',
  'Scanning recruiting sites near you…',
  'Reviewing trial phases and treatments…',
  'Gathering the most relevant trials…',
];

function pickMessage(exclude?: string): string {
  const pool = exclude ? SEARCH_MESSAGES.filter((message) => message !== exclude) : SEARCH_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function SearchingIndicator() {
  const [message, setMessage] = useState(() => pickMessage());

  useEffect(() => {
    const id = setInterval(() => setMessage((current) => pickMessage(current)), ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs tracking-tight">
      <Spinner className="text-primary text-base" />
      <span role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}

export default SearchingIndicator;
