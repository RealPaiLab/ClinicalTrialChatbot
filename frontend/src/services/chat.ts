import camelcaseKeys from 'camelcase-keys';
import { config } from '@/config';
import { CHAT_ERROR, CHAT_ERROR_BY_CODE } from '@/constants/chat';
import type { StreamEvent } from '@/types/trial';

const API_BASE = config.apiBaseUrl;
const SSE_DATA_PREFIX = 'data:';

function parseRetryAfter(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

export class ChatRequestError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor(status: number, retryAfter?: number) {
    super(`Chat request failed with status ${status}`);
    this.name = 'ChatRequestError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function chatErrorMessage(error: unknown): string {
  if (error instanceof ChatRequestError) {
    if (error.status === 429) {
      return error.retryAfter !== undefined && error.retryAfter > 0
        ? `You're sending messages too quickly. Please wait ${error.retryAfter}s and try again.`
        : CHAT_ERROR.rateLimited;
    }
    if (error.status === 502 || error.status === 503 || error.status === 504) {
      return CHAT_ERROR.unavailable;
    }
    if (error.status >= 500) return CHAT_ERROR.serverError;
    return CHAT_ERROR.generic;
  }
  if (error instanceof TypeError) return CHAT_ERROR.network;
  return CHAT_ERROR.generic;
}

export function chatErrorForCode(code: string): string {
  return CHAT_ERROR_BY_CODE[code] ?? CHAT_ERROR.generic;
}

export interface StreamChatParams {
  sessionId: string;
  message: string;
  turnstileToken?: string | null;
  verificationId?: string;
  signal?: AbortSignal;
}

function parseEvent(json: string): StreamEvent {
  const parsed = JSON.parse(json) as Record<string, unknown>;
  return camelcaseKeys(parsed, { deep: true }) as unknown as StreamEvent;
}

function dataPayload(line: string): string | null {
  if (!line.startsWith(SSE_DATA_PREFIX)) return null;
  return line.slice(SSE_DATA_PREFIX.length).trim();
}

export async function* parseEventStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline = buffer.indexOf('\n');
    while (newline !== -1) {
      const payload = dataPayload(buffer.slice(0, newline).trimEnd());
      buffer = buffer.slice(newline + 1);
      if (payload) yield parseEvent(payload);
      newline = buffer.indexOf('\n');
    }
  }

  const payload = dataPayload(buffer.trim());
  if (payload) yield parseEvent(payload);
}

export async function* streamChat({
  sessionId,
  message,
  turnstileToken,
  verificationId,
  signal,
}: StreamChatParams): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      session_id: sessionId,
      user_message: message,
      ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
      ...(verificationId ? { verification_id: verificationId } : {}),
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
    throw new ChatRequestError(response.status, retryAfter);
  }

  yield* parseEventStream(response.body);
}
