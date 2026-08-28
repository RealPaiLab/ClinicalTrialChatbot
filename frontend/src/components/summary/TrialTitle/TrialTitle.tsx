import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface TrialTitleProps {
  title: string;
  lang?: string;
}

function TrialTitle({ title, lang }: TrialTitleProps) {
  const { t } = useTranslation();
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
      <h2 className="font-display text-lg leading-snug font-semibold" lang={lang}>
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
          {expanded ? t('summary.showLess') : t('summary.showFullTitle')}
        </button>
      )}
    </>
  );
}

export default TrialTitle;
