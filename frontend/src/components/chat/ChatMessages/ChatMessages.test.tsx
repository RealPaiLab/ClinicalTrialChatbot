import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatMessages from './ChatMessages';
import * as conversationModule from '@/components/ai-elements/conversation';
import { renderWithClient } from '@/test/render';
import { AGENT_NAME, CHAT_ERROR_KEY, ChatRole } from '@/constants/chat';
import type { ChatMessage } from '@/types/trial';
import { mockTrials } from '@/test/fixtures/trials';
import { useAppStore } from '@/store/appStore';

function renderMessages(messages: ChatMessage[], onFindMore = vi.fn()) {
  renderWithClient(
    <ChatMessages
      messages={messages}
      sessionId="s1"
      onCitationClick={vi.fn()}
      onAskAi={vi.fn()}
      onFindMore={onFindMore}
      busy={false}
    />,
    { trials: [mockTrials[0]] }
  );
}

describe('ChatMessages', () => {
  it("greets with the assistant's starter message when there are no messages", () => {
    renderMessages([]);
    expect(screen.getByText(new RegExp(`I'm ${AGENT_NAME}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/how can i help you today/i)).toBeInTheDocument();
  });

  it('renders markdown in assistant replies', () => {
    renderMessages([
      { id: 'a', role: ChatRole.User, content: 'Any breast cancer trials in Toronto?' },
      { id: 'b', role: ChatRole.Assistant, content: 'Yes, I found **one** that may fit.' },
    ]);
    expect(screen.getByText(/any breast cancer trials in toronto/i)).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('shows the trials sent as context under the user message', () => {
    renderMessages([
      {
        id: 'a',
        role: ChatRole.User,
        content: 'Am I eligible for this one?',
        contextTrialRefs: ['CTC-4267848A'],
      },
    ]);
    expect(screen.getByRole('button', { name: /show .+ on the map/i })).toBeInTheDocument();
  });

  it('folds more than two context trials into one pill that opens them', async () => {
    renderMessages([
      {
        id: 'a',
        role: ChatRole.User,
        content: 'Find more trials like these.',
        contextTrialRefs: mockTrials.slice(0, 3).map((trial) => trial.trialRef),
      },
    ]);
    expect(screen.queryByRole('button', { name: /show .+ on the map/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '3 trials' }));

    expect(await screen.findAllByRole('button', { name: /show .+ on the map/i })).toHaveLength(3);
  });

  it("puts an earlier answer's trials back on the map and asks for more like them", async () => {
    useAppStore.getState().reset();
    const onFindMore = vi.fn();
    renderMessages(
      [
        { id: 'a', role: ChatRole.User, content: 'Any breast cancer trials in Toronto?' },
        { id: 'b', role: ChatRole.Assistant, content: 'I found one.', trials: [mockTrials[0]] },
      ],
      onFindMore
    );

    await userEvent.click(screen.getByRole('button', { name: /show 1 trial on the map/i }));
    expect(useAppStore.getState().shownTurnId).toBe('b');
    expect(useAppStore.getState().resultTurns[0].question).toBe(
      'Any breast cancer trials in Toronto?'
    );
    expect(screen.getByRole('button', { name: /on the map/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /find more like these/i }));
    expect(onFindMore).toHaveBeenCalledWith([mockTrials[0].trialRef]);
  });

  it('turns a cited trial into a pill with a contact link', () => {
    renderMessages([
      { id: 'c', role: ChatRole.Assistant, content: 'This one fits: [CTC-4267848A].' },
    ]);
    expect(screen.getByRole('button', { name: /show .+ on the map/i })).toHaveTextContent(
      /Immunotherapy for Advanced/i
    );
    expect(screen.getByRole('button', { name: /contact/i })).toBeInTheDocument();
  });

  it('autoscrolls to the bottom when the LLM outputs or updates a response', () => {
    const scrollToBottom = vi.fn();
    vi.spyOn(conversationModule, 'useStickToBottomContext').mockReturnValue({
      scrollToBottom,
      isAtBottom: false,
    } as unknown as ReturnType<typeof conversationModule.useStickToBottomContext>);

    const { rerender } = renderWithClient(
      <ChatMessages
        messages={[]}
        sessionId="s1"
        onCitationClick={vi.fn()}
        onAskAi={vi.fn()}
        onFindMore={vi.fn()}
        busy={false}
      />
    );
    expect(scrollToBottom).not.toHaveBeenCalled();

    // User sends a request, assistant turn begins
    rerender(
      <ChatMessages
        messages={[
          { id: 'u1', role: ChatRole.User, content: 'Find trials' },
          { id: 'a1', role: ChatRole.Assistant, content: '' },
        ]}
        sessionId="s1"
        onCitationClick={vi.fn()}
        onAskAi={vi.fn()}
        onFindMore={vi.fn()}
        busy={true}
      />
    );
    expect(scrollToBottom).toHaveBeenCalledTimes(1);

    // LLM streams output chunk
    rerender(
      <ChatMessages
        messages={[
          { id: 'u1', role: ChatRole.User, content: 'Find trials' },
          { id: 'a1', role: ChatRole.Assistant, content: 'Here are the trials' },
        ]}
        sessionId="s1"
        onCitationClick={vi.fn()}
        onAskAi={vi.fn()}
        onFindMore={vi.fn()}
        busy={true}
      />
    );
    expect(scrollToBottom).toHaveBeenCalledTimes(2);

    // LLM outputs trials
    rerender(
      <ChatMessages
        messages={[
          { id: 'u1', role: ChatRole.User, content: 'Find trials' },
          {
            id: 'a1',
            role: ChatRole.Assistant,
            content: 'Here are the trials',
            trials: [mockTrials[0]],
          },
        ]}
        sessionId="s1"
        onCitationClick={vi.fn()}
        onAskAi={vi.fn()}
        onFindMore={vi.fn()}
        busy={false}
      />
    );
    expect(scrollToBottom).toHaveBeenCalledTimes(3);

    // Unrelated re-render without new output does not call scrollToBottom again
    rerender(
      <ChatMessages
        messages={[
          { id: 'u1', role: ChatRole.User, content: 'Find trials' },
          {
            id: 'a1',
            role: ChatRole.Assistant,
            content: 'Here are the trials',
            trials: [mockTrials[0]],
          },
        ]}
        sessionId="s1"
        onCitationClick={vi.fn()}
        onAskAi={vi.fn()}
        onFindMore={vi.fn()}
        busy={false}
      />
    );
    expect(scrollToBottom).toHaveBeenCalledTimes(3);
  });

  it('autoscrolls to the bottom when the LLM outputs an error', () => {
    const scrollToBottom = vi.fn();
    vi.spyOn(conversationModule, 'useStickToBottomContext').mockReturnValue({
      scrollToBottom,
      isAtBottom: false,
    } as unknown as ReturnType<typeof conversationModule.useStickToBottomContext>);

    renderWithClient(
      <ChatMessages
        messages={[
          { id: 'u1', role: ChatRole.User, content: 'Find trials' },
          { id: 'a1', role: ChatRole.Assistant, content: '', error: { key: CHAT_ERROR_KEY.generic } },
        ]}
        sessionId="s1"
        onCitationClick={vi.fn()}
        onAskAi={vi.fn()}
        onFindMore={vi.fn()}
        busy={false}
      />
    );
    expect(scrollToBottom).toHaveBeenCalled();
  });
});
