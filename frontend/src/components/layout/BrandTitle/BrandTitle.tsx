import { useTranslation } from 'react-i18next';
import { AGENT_NAME } from '@/constants/chat';
import { cn } from '@/lib/utils';

interface BrandTitleProps {
  className?: string;
  taglineClassName?: string;
}

/** The two-row product title: name with the pre-release badge, over the tagline. */
function BrandTitle({ className, taglineClassName }: BrandTitleProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className="font-display text-lg leading-none font-extrabold tracking-[-0.03em]">
          {AGENT_NAME}
        </span>
        <span className="text-eyebrow text-primary bg-primary/10 rounded-full px-1.5 py-px text-[0.5rem] font-bold whitespace-nowrap">
          {t('app.preRelease')}
        </span>
      </div>
      <span className={cn('text-muted-foreground text-xs leading-tight', taglineClassName)}>
        {t('app.tagline')}
      </span>
    </div>
  );
}

export default BrandTitle;
