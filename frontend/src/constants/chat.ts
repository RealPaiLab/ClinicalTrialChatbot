export const AGENT_NAME = 'Camille';

export const ChatRole = {
  User: 'user',
  Assistant: 'assistant',
} as const;

export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

const TRIAL_DATA_UPDATED_AT = new Date('2026-05-12T00:00:00Z');

const TRIAL_DATA_UPDATED_ON = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(TRIAL_DATA_UPDATED_AT);

export const TRIAL_DATA = {
  lastUpdatedLabel: `Data last updated ${TRIAL_DATA_UPDATED_ON.toUpperCase()}`,
  shortNotice: 'Trial data reflects the status as of the last update.',
  detailedNotice: `Trial data was last updated on ${TRIAL_DATA_UPDATED_ON} and may be out of date. Please reach out to your care team for more details.`,
} as const;

export const CITATION_HREF_PREFIX = '#citation-';

export const DEFINITION_HREF_PREFIX = '#define-';

export const SELECTED_TRIALS_PROMPT = 'Focus on these specific trials (by NCT number): ';

export const ASK_AI_PROMPT_PREFIX = 'What does ';

export const ASK_AI_PROMPT_SUFFIX = ' mean?';

export const MAX_MESSAGE_LENGTH = 1000;

export const FEEDBACK = {
  helpfulLabel: 'Helpful',
  notHelpfulLabel: 'Not helpful',
  commentPlaceholder: 'Comment (optional)',
  nctPlaceholder: 'NCT the agent should have used',
  nctHint: 'Press Enter to add each NCT number.',
  submitLabel: 'Submit',
  submittedLabel: 'Thanks for the feedback',
} as const;

export const CHAT_ERROR = {
  rateLimited: "You're sending messages too quickly. Please wait a moment and try again.",
  unavailable: 'The assistant is temporarily unavailable. Please try again shortly.',
  serverError: 'Something went wrong on our end. Please try again in a moment.',
  network: "Couldn't reach the server. Check your connection and try again.",
  usageLimit: 'This conversation reached its processing limit. Please start a new message.',
  modelError: "I couldn't complete that request. Please try rephrasing.",
  turnstileFailed: "We couldn't verify that you're human. Please refresh the page and try again.",
  generic: 'Something went wrong. Please try again.',
  messageTooLong: `Your message is too long. Please keep it under ${MAX_MESSAGE_LENGTH.toLocaleString()} characters and try again.`,
} as const;

export const CHAT_ERROR_BY_CODE: Record<string, string> = {
  usage_limit: CHAT_ERROR.usageLimit,
  model_unavailable: CHAT_ERROR.unavailable,
  model_error: CHAT_ERROR.modelError,
  turnstile_failed: CHAT_ERROR.turnstileFailed,
  generic: CHAT_ERROR.generic,
};

export const StreamEventType = {
  AgentResponse: 'AgentResponse',
  ChatResult: 'ChatResult',
  Error: 'error',
} as const;

export type StreamEventType = (typeof StreamEventType)[keyof typeof StreamEventType];
