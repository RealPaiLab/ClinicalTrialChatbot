import camelcaseKeys from 'camelcase-keys';
import type { StreamEvent } from '@/types/trial';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const SSE_DATA_PREFIX = 'data:';

export interface StreamChatParams {
  sessionId: string;
  message: string;
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
  signal,
}: StreamChatParams): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ session_id: sessionId, user_message: message }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  yield* parseEventStream(response.body);
}
