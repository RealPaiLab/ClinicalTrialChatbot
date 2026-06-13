export const ChatRole = {
  User: 'user',
  Assistant: 'assistant',
} as const;

export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export const CITATION_HREF_PREFIX = '#citation-';

export const SELECTED_TRIALS_PROMPT = 'Focus on these specific trials (by NCT number): ';

export const StreamEventType = {
  AgentResponse: 'AgentResponse',
  ChatResult: 'ChatResult',
  Error: 'error',
} as const;

export type StreamEventType = (typeof StreamEventType)[keyof typeof StreamEventType];
