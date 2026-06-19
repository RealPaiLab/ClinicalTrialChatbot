const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface SubmitFeedbackParams {
  sessionId: string;
  observationId: string;
  score: 0 | 1;
  comment?: string;
  suggestedNctNumbers?: string[];
}

export async function submitFeedback(
  { sessionId, observationId, score, comment, suggestedNctNumbers }: SubmitFeedbackParams,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      observation_id: observationId,
      score,
      comment: comment || null,
      suggested_nct_numbers: suggestedNctNumbers ?? [],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Feedback submission failed with status ${response.status}`);
  }
}
