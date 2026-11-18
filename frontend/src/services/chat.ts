import { CHAT_ERROR_KEY, CHAT_ERROR_KEY_BY_CODE } from '@/constants/chat';
import { ApiError, apiFetch, camelize } from '@/services/api';
import type { ChatError, StreamEvent } from '@/types/trial';

const CHAT_PATH = '/chat/stream';
const SSE_DATA_PREFIX = 'data:';

export function chatError(error: unknown): ChatError {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return error.retryAfter !== undefined && error.retryAfter > 0
        ? { key: CHAT_ERROR_KEY.rateLimitedRetry, params: { seconds: error.retryAfter } }
        : { key: CHAT_ERROR_KEY.rateLimited };
    }
    if (error.status === 502 || error.status === 503 || error.status === 504) {
      return { key: CHAT_ERROR_KEY.unavailable };
    }
    if (error.status >= 500) return { key: CHAT_ERROR_KEY.serverError };
    return { key: CHAT_ERROR_KEY.generic };
  }
  if (error instanceof TypeError) return { key: CHAT_ERROR_KEY.network };
  return { key: CHAT_ERROR_KEY.generic };
}

export function chatErrorForCode(code: string): ChatError {
  return { key: CHAT_ERROR_KEY_BY_CODE[code] ?? CHAT_ERROR_KEY.generic };
}

export interface StreamChatParams {
  sessionId: string;
  message: string;
  turnstileToken?: string | null;
  verificationId?: string;
  signal?: AbortSignal;
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
      if (payload) yield camelize<StreamEvent>(JSON.parse(payload));
      newline = buffer.indexOf('\n');
    }
  }

  const payload = dataPayload(buffer.trim());
  if (payload) yield camelize<StreamEvent>(JSON.parse(payload));
}

export async function* streamChat({
  sessionId,
  message,
  turnstileToken,
  verificationId,
  signal,
}: StreamChatParams): AsyncGenerator<StreamEvent> {
  const response = await apiFetch(CHAT_PATH, {
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

  if (!response.body) throw new ApiError(CHAT_PATH, response.status);
  yield* parseEventStream(response.body);
}
