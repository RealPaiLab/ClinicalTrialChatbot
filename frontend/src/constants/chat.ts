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

export const StreamEventType = {
  AgentResponse: 'AgentResponse',
  ChatResult: 'ChatResult',
  Error: 'error',
} as const;

export type StreamEventType = (typeof StreamEventType)[keyof typeof StreamEventType];
