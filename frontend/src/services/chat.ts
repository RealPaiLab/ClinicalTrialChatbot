import camelcaseKeys from 'camelcase-keys';
import type { StreamEvent } from '@/types/trial';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface StreamChatParams {
  sessionId: string;
  message: string;
  signal?: AbortSignal;
}

function parseEvent(line: string): StreamEvent {
  const parsed = JSON.parse(line) as Record<string, unknown>;
  return camelcaseKeys(parsed, { deep: true }) as unknown as StreamEvent;
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
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) yield parseEvent(trimmed);
    }
  }

  const tail = buffer.trim();
  if (tail) yield parseEvent(tail);
}

export async function* streamChat({
  sessionId,
  message,
  signal,
}: StreamChatParams): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, user_message: message }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  yield* parseEventStream(response.body);
}
