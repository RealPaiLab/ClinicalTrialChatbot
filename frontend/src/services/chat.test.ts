import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ChatRequestError,
  chatErrorForCode,
  chatErrorMessage,
  parseEventStream,
  streamChat,
} from './chat';
import { CHAT_ERROR, StreamEventType } from '@/constants/chat';
import type { StreamEvent } from '@/types/trial';
import { createSseStream, mockWireStreamLines } from '@/test/fixtures/trials';

async function collect(stream: AsyncGenerator<StreamEvent>): Promise<StreamEvent[]> {
  const events: StreamEvent[] = [];
  for await (const event of stream) {
    events.push(event);
  }
  return events;
}

describe('parseEventStream', () => {
  it('maps snake_case wire events into camelCase domain events in order', async () => {
    const events = await collect(parseEventStream(createSseStream(mockWireStreamLines)));

    expect(events.map((e) => e.type)).toEqual([
      StreamEventType.AgentResponse,
      StreamEventType.AgentResponse,
      StreamEventType.ChatResult,
    ]);

    const second = events[1];
    if (second.type !== StreamEventType.AgentResponse) throw new Error('expected AgentResponse');
    expect(second.data.usedNctNumbers).toEqual(['NCT04267848']);
    expect(second.data.followUpQuestions).toEqual(['What are the eligibility requirements?']);

    const final = events[2];
    if (final.type !== StreamEventType.ChatResult) throw new Error('expected ChatResult');
    const trial = final.data.trials[0];
    expect(trial.nctNumber).toBe('NCT04267848');
    expect(trial.shortTitleEn).toContain('Triple-Negative');
    expect(trial.treatmentTypeNames).toEqual(['immunotherapy', 'chemotherapy']);
    expect(trial.sites[0].cancerTypeNames).toEqual(['breast cancer']);
    expect(trial.sites[0].lat).toBeCloseTo(43.6592);
  });

  it('reassembles events split across small byte chunks', async () => {
    const events = await collect(parseEventStream(createSseStream(mockWireStreamLines, 7)));
    expect(events).toHaveLength(3);
    expect(events[2].type).toBe(StreamEventType.ChatResult);
  });
});

describe('streamChat', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the session id and user message, then yields mapped events', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(createSseStream(mockWireStreamLines), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const events = await collect(streamChat({ sessionId: 'session-1', message: 'hello' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/chat/stream');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ session_id: 'session-1', user_message: 'hello' });
    expect(events).toHaveLength(3);
  });

  it('throws a ChatRequestError carrying the status and Retry-After', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('slow down', { status: 429, headers: { 'Retry-After': '12' } })
        )
    );
    await expect(collect(streamChat({ sessionId: 's', message: 'm' }))).rejects.toMatchObject({
      status: 429,
      retryAfter: 12,
    });
  });
});

describe('chatErrorMessage', () => {
  it('returns a rate-limit message for 429, with the retry delay when present', () => {
    expect(chatErrorMessage(new ChatRequestError(429))).toBe(CHAT_ERROR.rateLimited);
    expect(chatErrorMessage(new ChatRequestError(429, 12))).toContain('12s');
  });

  it('distinguishes unavailable (5xx gateway) from generic server errors', () => {
    expect(chatErrorMessage(new ChatRequestError(503))).toBe(CHAT_ERROR.unavailable);
    expect(chatErrorMessage(new ChatRequestError(500))).toBe(CHAT_ERROR.serverError);
  });

  it('treats a failed fetch (TypeError) as a network error', () => {
    expect(chatErrorMessage(new TypeError('Failed to fetch'))).toBe(CHAT_ERROR.network);
  });

  it('falls back to a generic message for unknown errors and 4xx', () => {
    expect(chatErrorMessage(new ChatRequestError(400))).toBe(CHAT_ERROR.generic);
    expect(chatErrorMessage(new Error('boom'))).toBe(CHAT_ERROR.generic);
  });
});

describe('chatErrorForCode', () => {
  it('maps known backend error codes to copy', () => {
    expect(chatErrorForCode('model_unavailable')).toBe(CHAT_ERROR.unavailable);
    expect(chatErrorForCode('model_error')).toContain('rephrasing');
  });

  it('falls back to generic for an unknown code', () => {
    expect(chatErrorForCode('something_new')).toBe(CHAT_ERROR.generic);
  });
});
