import { BookmarkX, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent } from '@/components/ui/item';
import ActionTooltip from '@/components/common/ActionTooltip/ActionTooltip';
import BookmarkRowSkeleton from '@/components/bookmarks/BookmarkRowSkeleton/BookmarkRowSkeleton';
import TrialBadges from '@/components/bookmarks/TrialBadges/TrialBadges';
import { publicTrialId, trialTitle } from '@/lib/trial';
import type { Trial } from '@/types/trial';

interface BookmarkRowProps {
  trialRef: string;
  trial: Trial | null;
  isLoading?: boolean;
  isExporting?: boolean;
  onSelect?: (trial: Trial) => void;
  onRemove: (trialRef: string) => void;
  onExport?: (trial: Trial) => void;
}

function BookmarkRow({
  trialRef,
  trial,
  isLoading,
  isExporting,
  onSelect,
  onRemove,
  onExport,
}: BookmarkRowProps) {
  const { t } = useTranslation();
  const title = trialTitle(trial);
  const isPending = Boolean(isLoading) && !trial;

  return (
    <Item
      role="listitem"
      className="hover:bg-accent/40 items-start rounded-none px-4 py-3 focus-visible:ring-0"
    >
      <ItemContent className="gap-0">
        <button
          type="button"
          disabled={!trial}
          className="flex min-w-0 cursor-pointer flex-col items-start gap-1.5 text-left disabled:cursor-default"
          onClick={() => trial && onSelect?.(trial)}
        >
          <span className="text-eyebrow text-primary font-mono">{publicTrialId(trial)}</span>
          {isPending ? (
            <BookmarkRowSkeleton />
          ) : (
            <span className="line-clamp-2 text-sm leading-snug font-medium">{title}</span>
          )}
          {trial ? (
            <TrialBadges trial={trial} />
          ) : (
            !isPending && <span className="text-caption">{t('bookmarks.unavailable')}</span>
          )}
        </button>
      </ItemContent>

      <ItemActions className="gap-0.5">
        {onExport && (
          <ActionTooltip label={t('bookmarks.exportOne')}>
            <Button
              variant="action"
              size="icon"
              disabled={!trial || isExporting}
              aria-label={`${t('bookmarks.exportOne')} (${title})`}
              onClick={() => trial && onExport(trial)}
            >
              <FileDown />
            </Button>
          </ActionTooltip>
        )}
        <ActionTooltip label={t('bookmarks.remove')}>
          <Button
            variant="action"
            size="icon"
            disabled={isPending}
            aria-label={`${t('bookmarks.remove')} (${title})`}
            onClick={() => onRemove(trialRef)}
          >
            <BookmarkX />
          </Button>
        </ActionTooltip>
      </ItemActions>
    </Item>
  );
}

export default BookmarkRow;
