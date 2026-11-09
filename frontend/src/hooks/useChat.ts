import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatStatus } from 'ai';
import {
  CHAT_ERROR_KEY,
  ChatRole,
  MAX_MESSAGE_LENGTH,
  SELECTED_TRIALS_PROMPT,
  StreamEventType,
} from '@/constants/chat';
import { chatError, chatErrorForCode, streamChat } from '@/services/chat';
import { TRIAL_QUERY_ROOT, trialQuery } from '@/services/trials';
import { useAppStore } from '@/store/appStore';
import type { ChatMessage } from '@/types/trial';

interface UseChatOptions {
  getTurnstileToken: () => string | null;
  verificationId: string;
}

interface UseChatResult {
  messages: ChatMessage[];
  status: ChatStatus;
  sessionId: string;
  sendMessage: (text: string, contextTrialRefs?: string[]) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/** One conversation: streams replies and puts the trials each turn returns on the map. */
export function useChat({ getTurnstileToken, verificationId }: UseChatOptions): UseChatResult {
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

  const sendMessage = async (text: string, contextTrialRefs: string[] = []) => {
    if (status === 'streaming') return;

    if (text.length > MAX_MESSAGE_LENGTH) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: ChatRole.User, content: text },
        {
          id: crypto.randomUUID(),
          role: ChatRole.Assistant,
          content: '',
          error: { key: CHAT_ERROR_KEY.messageTooLong, params: { limit: MAX_MESSAGE_LENGTH } },
        },
      ]);
      return;
    }

    const hasContext = contextTrialRefs.length > 0;
    const payload = hasContext
      ? `${text}\n\n${SELECTED_TRIALS_PROMPT}${contextTrialRefs.join(', ')}`
      : text;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: ChatRole.User,
      content: text,
      contextTrialRefs: hasContext ? contextTrialRefs : undefined,
    };

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: ChatRole.Assistant, content: '' },
    ]);
    setStatus('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const stream = streamChat({
        sessionId,
        message: payload,
        turnstileToken: getTurnstileToken(),
        verificationId,
        signal: controller.signal,
      });
      for await (const event of stream) {
        if (event.type === StreamEventType.AgentResponse) {
          patchMessage(assistantId, { content: event.data.message });
        } else if (event.type === StreamEventType.ChatResult) {
          patchMessage(assistantId, {
            content: event.data.message,
            trials: event.data.trials,
            followUpQuestions: event.data.followUpQuestions,
            observationId: event.data.observationId,
          });
          const store = useAppStore.getState();
          if (event.data.conversationTitle) {
            store.setConversationTitle(event.data.conversationTitle);
          }
          if (event.data.trials.length > 0) {
            for (const trial of event.data.trials) {
              queryClient.setQueryData(trialQuery(trial.trialRef).queryKey, trial);
            }
            store.setTrials(event.data.trials);
          }
        } else {
          patchMessage(assistantId, { content: '', error: chatErrorForCode(event.data) });
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        setMessages((prev) => prev.filter((m) => !(m.id === assistantId && m.content === '')));
      } else {
        patchMessage(assistantId, { content: '', error: chatError(error) });
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
    queryClient.removeQueries({ queryKey: TRIAL_QUERY_ROOT });
    setMessages([]);
    setStatus('ready');
    useAppStore.getState().reset();
  };

  return { messages, status, sessionId, sendMessage, stop, reset };
}
