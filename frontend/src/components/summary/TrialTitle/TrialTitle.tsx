import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const SHOW_MORE_LABEL = 'Show full title';
const SHOW_LESS_LABEL = 'Show less';

interface TrialTitleProps {
  title: string;
}

function TrialTitle({ title }: TrialTitleProps) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const element = titleRef.current;
    if (!element || expanded) return;

    const measure = () => setClamped(element.scrollHeight > element.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <>
      <h2 className="font-display text-lg leading-snug font-semibold">
        <span
          ref={titleRef}
          title={expanded ? undefined : title}
          className={cn('block', !expanded && 'line-clamp-2')}
        >
          {title}
        </span>
      </h2>
      {clamped && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="text-caption text-muted-foreground hover:text-primary w-fit cursor-pointer transition-colors"
        >
          {expanded ? SHOW_LESS_LABEL : SHOW_MORE_LABEL}
        </button>
      )}
    </>
  );
}

export default TrialTitle;
