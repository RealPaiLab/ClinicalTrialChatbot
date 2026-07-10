import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { CHAT_ERROR, MAX_MESSAGE_LENGTH } from '@/constants/chat';
import { createQueryClient } from '@/lib/queryClient';
import { useChat } from './useChat';

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>;
}

describe('useChat', () => {
  it('shows an error message and skips the stream when over the length limit', async () => {
    const createStream = vi.fn();
    const { result } = renderHook(() => useChat({ createStream }), { wrapper });

    await act(async () => {
      await result.current.sendMessage('a'.repeat(MAX_MESSAGE_LENGTH + 1));
    });

    expect(createStream).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.messages.at(-1)).toMatchObject({
        content: CHAT_ERROR.messageTooLong,
        isError: true,
      });
    });
  });
});
