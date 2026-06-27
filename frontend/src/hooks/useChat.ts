import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatStatus } from 'ai';
import { ChatRole, SELECTED_TRIALS_PROMPT, StreamEventType } from '@/constants/chat';
import { chatErrorMessage, streamChat } from '@/services/chat';
import type { ChatMessage, StreamEvent, Trial } from '@/types/trial';

type CreateStream = (text: string, signal?: AbortSignal) => AsyncGenerator<StreamEvent>;

interface UseChatOptions {
  createStream?: CreateStream;
  onTrialsChange?: (trials: Trial[]) => void;
}

interface UseChatResult {
  messages: ChatMessage[];
  status: ChatStatus;
  sessionId: string;
  sendMessage: (text: string, contextNctNumbers?: string[]) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useChat({ createStream, onTrialsChange }: UseChatOptions = {}): UseChatResult {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const abortRef = useRef<AbortController | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());

  const patchMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((message) => (message.id === id ? { ...message, ...patch } : message))
    );
  };

  const sendMessage = async (text: string, contextNctNumbers?: string[]) => {
    if (status === 'streaming') return;

    const stream =
      createStream ?? ((message, signal) => streamChat({ sessionId, message, signal }));

    const payload =
      contextNctNumbers && contextNctNumbers.length > 0
        ? `${text}\n\n${SELECTED_TRIALS_PROMPT}${contextNctNumbers.join(', ')}`
        : text;

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: ChatRole.User, content: text },
      { id: assistantId, role: ChatRole.Assistant, content: '' },
    ]);
    setStatus('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const event of stream(payload, controller.signal)) {
        if (event.type === StreamEventType.AgentResponse) {
          patchMessage(assistantId, { content: event.data.message });
        } else if (event.type === StreamEventType.ChatResult) {
          patchMessage(assistantId, {
            content: event.data.message,
            trials: event.data.trials,
            followUpQuestions: event.data.followUpQuestions,
            observationId: event.data.observationId,
          });
          if (event.data.trials.length > 0) {
            for (const trial of event.data.trials) {
              if (trial.nctNumber) queryClient.setQueryData(['trial', trial.nctNumber], trial);
            }
            onTrialsChange?.(event.data.trials);
          }
        } else {
          patchMessage(assistantId, { content: event.data });
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        setMessages((prev) => prev.filter((m) => !(m.id === assistantId && m.content === '')));
      } else {
        patchMessage(assistantId, { content: chatErrorMessage(error), isError: true });
      }
    } finally {
      setStatus('ready');
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSessionId(crypto.randomUUID());
    queryClient.removeQueries({ queryKey: ['trial'] });
    setMessages([]);
    setStatus('ready');
    onTrialsChange?.([]);
  };

  return { messages, status, sessionId, sendMessage, stop, reset };
}
