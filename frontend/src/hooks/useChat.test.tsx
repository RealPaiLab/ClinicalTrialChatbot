import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CHAT_ERROR_KEY, MAX_MESSAGE_LENGTH } from '@/constants/chat';
import { streamChat } from '@/services/chat';
import { clientWrapper } from '@/test/render';
import { useChat } from './useChat';

vi.mock('@/services/chat', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/chat')>()),
  streamChat: vi.fn(),
}));

describe('useChat', () => {
  it('shows an error message and skips the stream when over the length limit', async () => {
    const { result } = renderHook(
      () => useChat({ getTurnstileToken: () => null, verificationId: '' }),
      { wrapper: clientWrapper() }
    );

    await act(async () => {
      await result.current.sendMessage('a'.repeat(MAX_MESSAGE_LENGTH + 1));
    });

    expect(streamChat).not.toHaveBeenCalled();
    expect(result.current.messages.at(-1)?.error).toEqual({
      key: CHAT_ERROR_KEY.messageTooLong,
      params: { limit: MAX_MESSAGE_LENGTH },
    });
  });
});
