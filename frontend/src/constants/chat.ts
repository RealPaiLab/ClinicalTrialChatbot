export const ChatRole = {
  User: 'user',
  Assistant: 'assistant',
} as const;

export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export const CITATION_HREF_PREFIX = '#citation-';

export const DEFINITION_HREF_PREFIX = '#define-';

export const SELECTED_TRIALS_PROMPT = 'Focus on these specific trials (by NCT number): ';

export const ASK_AI_PROMPT_PREFIX = 'What does ';

export const ASK_AI_PROMPT_SUFFIX = ' mean?';

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
  generic: 'Something went wrong. Please try again.',
} as const;

export const CHAT_ERROR_BY_CODE: Record<string, string> = {
  usage_limit: CHAT_ERROR.usageLimit,
  model_unavailable: CHAT_ERROR.unavailable,
  model_error: CHAT_ERROR.modelError,
  generic: CHAT_ERROR.generic,
};

export const StreamEventType = {
  AgentResponse: 'AgentResponse',
  ChatResult: 'ChatResult',
  Error: 'error',
} as const;

export type StreamEventType = (typeof StreamEventType)[keyof typeof StreamEventType];
