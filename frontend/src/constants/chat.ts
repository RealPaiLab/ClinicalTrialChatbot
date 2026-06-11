export const ChatRole = {
  User: 'user',
  Assistant: 'assistant',
} as const;

export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export const CITATION_HREF_PREFIX = '#citation-';

export const StreamEventType = {
  AgentResponse: 'AgentResponse',
  ChatResult: 'ChatResult',
  Error: 'error',
} as const;

export type StreamEventType = (typeof StreamEventType)[keyof typeof StreamEventType];
