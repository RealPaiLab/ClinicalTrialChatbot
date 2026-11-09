import { apiPost } from '@/services/api';

export interface SubmitFeedbackParams {
  sessionId: string;
  observationId: string;
  score: 0 | 1;
  comment?: string;
  suggestedNctNumbers?: string[];
}

export async function submitFeedback({
  sessionId,
  observationId,
  score,
  comment,
  suggestedNctNumbers,
}: SubmitFeedbackParams): Promise<void> {
  await apiPost('/feedback', {
    session_id: sessionId,
    observation_id: observationId,
    score,
    comment: comment || null,
    suggested_nct_numbers: suggestedNctNumbers ?? [],
  });
}
