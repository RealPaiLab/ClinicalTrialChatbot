import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatMessages from './ChatMessages';
import { renderWithClient } from '@/test/render';
import { AGENT_NAME, ChatRole } from '@/constants/chat';
import type { ChatMessage } from '@/types/trial';
import { mockTrials } from '@/test/fixtures/trials';

function renderMessages(messages: ChatMessage[]) {
  renderWithClient(
    <ChatMessages messages={messages} sessionId="s1" onCitationClick={vi.fn()} onAskAi={vi.fn()} />,
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

  it('turns a cited trial into a pill with a contact link', () => {
    renderMessages([
      { id: 'c', role: ChatRole.Assistant, content: 'This one fits: [CTC-4267848A].' },
    ]);
    expect(screen.getByRole('button', { name: /show .+ on the map/i })).toHaveTextContent(
      /Immunotherapy for Advanced/i
    );
    expect(screen.getByRole('button', { name: /contact/i })).toBeInTheDocument();
  });
});
