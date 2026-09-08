import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const VISIBLE_COUNT = 2;

interface FactValuesProps {
  values: string[];
  separator?: string;
  className?: string;
}

function FactValues({ values, separator = ', ', className }: FactValuesProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hidden = values.length - VISIBLE_COUNT;
  const shown = hidden > 0 && !expanded ? values.slice(0, VISIBLE_COUNT) : values;

  return (
    <>
      <span className={className}>{shown.join(separator)}</span>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="text-caption text-muted-foreground hover:text-primary block w-fit cursor-pointer transition-colors"
        >
          {expanded ? t('summary.showLess') : t('summary.showMore', { n: hidden })}
        </button>
      )}
    </>
  );
}

export default FactValues;
