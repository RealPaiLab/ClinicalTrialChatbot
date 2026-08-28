import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ChatRequestError,
  chatError,
  chatErrorForCode,
  parseEventStream,
  streamChat,
} from './chat';
import { CHAT_ERROR_KEY, StreamEventType } from '@/constants/chat';
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
    expect(second.data.usedTrialRefs).toEqual(['CTC-4267848A']);
    expect(second.data.followUpQuestions).toEqual(['What are the eligibility requirements?']);

    const final = events[2];
    if (final.type !== StreamEventType.ChatResult) throw new Error('expected ChatResult');
    const trial = final.data.trials[0];
    expect(trial.trialRef).toBe('CTC-4267848A');
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

describe('chatError', () => {
  it('returns a rate-limit key for 429, carrying the retry delay when present', () => {
    expect(chatError(new ChatRequestError(429))).toEqual({ key: CHAT_ERROR_KEY.rateLimited });
    expect(chatError(new ChatRequestError(429, 12))).toEqual({
      key: CHAT_ERROR_KEY.rateLimitedRetry,
      params: { seconds: 12 },
    });
  });

  it('distinguishes unavailable (5xx gateway) from generic server errors', () => {
    expect(chatError(new ChatRequestError(503)).key).toBe(CHAT_ERROR_KEY.unavailable);
    expect(chatError(new ChatRequestError(500)).key).toBe(CHAT_ERROR_KEY.serverError);
  });

  it('treats a failed fetch (TypeError) as a network error', () => {
    expect(chatError(new TypeError('Failed to fetch')).key).toBe(CHAT_ERROR_KEY.network);
  });

  it('falls back to a generic key for unknown errors and 4xx', () => {
    expect(chatError(new ChatRequestError(400)).key).toBe(CHAT_ERROR_KEY.generic);
    expect(chatError(new Error('boom')).key).toBe(CHAT_ERROR_KEY.generic);
  });
});

describe('chatErrorForCode', () => {
  it('maps known backend error codes to keys', () => {
    expect(chatErrorForCode('model_unavailable').key).toBe(CHAT_ERROR_KEY.unavailable);
    expect(chatErrorForCode('model_error').key).toBe(CHAT_ERROR_KEY.modelError);
  });

  it('falls back to generic for an unknown code', () => {
    expect(chatErrorForCode('something_new').key).toBe(CHAT_ERROR_KEY.generic);
  });
});
