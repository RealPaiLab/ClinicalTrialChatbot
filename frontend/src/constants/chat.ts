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
  updatedOn: TRIAL_DATA_UPDATED_ON,
} as const;

export const CITATION_HREF_PREFIX = '#citation-';

export const DEFINITION_HREF_PREFIX = '#define-';

export const CONTACT_HREF_PREFIX = '#contact-';

export const SELECTED_TRIALS_PROMPT = 'Focus on these specific trials (by NCT number): ';

export const ASK_AI_PROMPT_PREFIX = 'What does ';

export const ASK_AI_PROMPT_SUFFIX = ' mean?';

export const MAX_MESSAGE_LENGTH = 1000;

export const CHAT_ERROR_KEY = {
  rateLimited: 'errors.rateLimited',
  rateLimitedRetry: 'errors.rateLimitedRetry',
  unavailable: 'errors.unavailable',
  serverError: 'errors.serverError',
  network: 'errors.network',
  usageLimit: 'errors.usageLimit',
  modelError: 'errors.modelError',
  turnstileFailed: 'errors.turnstileFailed',
  generic: 'errors.generic',
  messageTooLong: 'errors.messageTooLong',
} as const;

export type ChatErrorKey = (typeof CHAT_ERROR_KEY)[keyof typeof CHAT_ERROR_KEY];

export const CHAT_ERROR_KEY_BY_CODE: Record<string, ChatErrorKey> = {
  usage_limit: CHAT_ERROR_KEY.usageLimit,
  model_unavailable: CHAT_ERROR_KEY.unavailable,
  model_error: CHAT_ERROR_KEY.modelError,
  turnstile_failed: CHAT_ERROR_KEY.turnstileFailed,
  generic: CHAT_ERROR_KEY.generic,
};

export const StreamEventType = {
  AgentResponse: 'AgentResponse',
  ChatResult: 'ChatResult',
  Error: 'error',
} as const;

export type StreamEventType = (typeof StreamEventType)[keyof typeof StreamEventType];
