import { useState } from 'react';
import { ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MessageAction, MessageActions } from '@/components/ai-elements/message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { config } from '@/config';
import { cn } from '@/lib/utils';
import { submitFeedback } from '@/services/feedback';

const SELECTED_THUMB = 'bg-primary/15 text-primary hover:bg-primary/15 disabled:opacity-100';

interface MessageFeedbackProps {
  sessionId: string;
  observationId: string;
  onSubmit?: typeof submitFeedback;
  showDetails?: boolean;
}

function MessageFeedback({
  sessionId,
  observationId,
  onSubmit = submitFeedback,
  showDetails = config.isDevelopment,
}: MessageFeedbackProps) {
  const { t } = useTranslation();
  const [score, setScore] = useState<0 | 1 | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [nctNumbers, setNctNumbers] = useState<string[]>([]);
  const [nctDraft, setNctDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const send = async (
    value: 0 | 1,
    extra: { comment?: string; suggestedNctNumbers?: string[] }
  ) => {
    setSubmitting(true);
    try {
      await onSubmit({ sessionId, observationId, score: value, ...extra });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScore = (value: 0 | 1) => {
    setScore(value);
    setExpanded(showDetails);
    setSubmitted(!showDetails);
    void send(value, {});
  };

  const addNct = () => {
    const value = nctDraft.trim().toUpperCase();
    setNctDraft('');
    if (!value) return;
    setNctNumbers((prev) => (prev.includes(value) ? prev : [...prev, value]));
  };

  const removeNct = (value: string) => {
    setNctNumbers((prev) => prev.filter((nct) => nct !== value));
  };

  const handleSubmitDetails = async () => {
    if (score === null) return;
    await send(score, {
      comment: comment.trim() || undefined,
      suggestedNctNumbers: nctNumbers,
    });
    setSubmitted(true);
    setExpanded(false);
  };

  return (
    <div className="mt-1 flex flex-col gap-2">
      <MessageActions data-tour="feedback" className="w-fit">
        <MessageAction
          tooltip={t('feedback.helpful')}
          aria-pressed={score === 1}
          disabled={score !== null || submitting}
          onClick={() => handleScore(1)}
          className={cn(score === 1 && SELECTED_THUMB)}
        >
          <ThumbsUp className="size-4" />
        </MessageAction>
        <MessageAction
          tooltip={t('feedback.notHelpful')}
          aria-pressed={score === 0}
          disabled={score !== null || submitting}
          onClick={() => handleScore(0)}
          className={cn(score === 0 && SELECTED_THUMB)}
        >
          <ThumbsDown className="size-4" />
        </MessageAction>
        {submitted && (
          <span className="text-caption text-muted-foreground">{t('feedback.submitted')}</span>
        )}
      </MessageActions>

      {showDetails && (
        <Collapsible open={expanded && !submitted} onOpenChange={setExpanded}>
          <CollapsibleContent>
            <div className="bg-card flex w-full max-w-xs flex-col gap-2 rounded-lg border p-2.5 shadow-sm">
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t('feedback.commentPlaceholder')}
                className="min-h-12 text-sm"
              />
              <div className="flex flex-col gap-1">
                <Input
                  value={nctDraft}
                  onChange={(event) => setNctDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addNct();
                    }
                  }}
                  placeholder={t('feedback.nctPlaceholder')}
                  className="font-mono text-sm"
                />
                <p className="text-caption text-muted-foreground">{t('feedback.nctHint')}</p>
              </div>
              {nctNumbers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {nctNumbers.map((nct) => (
                    <Badge
                      key={nct}
                      variant="secondary"
                      className="gap-1 py-0.5 pr-1 pl-2 font-mono"
                    >
                      <span>{nct}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${nct}`}
                        onClick={() => removeNct(nct)}
                        className="size-4 rounded-full hover:bg-transparent"
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              <Button
                type="button"
                size="sm"
                disabled={submitting}
                onClick={handleSubmitDetails}
                className="self-end"
              >
                {t('feedback.submit')}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export default MessageFeedback;
