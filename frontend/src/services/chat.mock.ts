import { ChatRole, StreamEventType } from '@/constants/chat';
import type { StreamEvent } from '@/types/trial';
import { mockConversation } from '@/test/fixtures/trials';

const CHUNK_DELAY_MS = 28;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function* streamMockChat(
  _text: string,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent> {
  const reply = mockConversation.find((message) => message.role === ChatRole.Assistant);
  const message = reply?.content ?? '';
  const words = message.split(' ');

  let accumulated = '';
  for (const word of words) {
    if (signal?.aborted) return;
    accumulated = accumulated ? `${accumulated} ${word}` : word;
    await delay(CHUNK_DELAY_MS);
    yield {
      type: StreamEventType.AgentResponse,
      data: { message: accumulated, usedNctNumbers: [], followUpQuestions: [] },
    };
  }

  if (signal?.aborted) return;
  yield {
    type: StreamEventType.ChatResult,
    data: {
      message,
      trials: reply?.trials ?? [],
      followUpQuestions: reply?.followUpQuestions ?? [],
    },
  };
}
