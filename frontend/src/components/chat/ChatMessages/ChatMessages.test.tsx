import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatMessages from './ChatMessages';
import { renderWithClient } from '@/test/render';
import { ChatRole } from '@/constants/chat';
import type { ChatMessage } from '@/types/trial';
import { mockTrials } from '@/test/fixtures/trials';

const fetchTrial = vi.fn().mockResolvedValue(mockTrials[0]);

describe('ChatMessages', () => {
  it('shows the empty state when there are no messages', () => {
    renderWithClient(<ChatMessages messages={[]} sessionId="s1" fetchTrial={fetchTrial} />);
    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
  });

  it('renders user and assistant message content', () => {
    const messages: ChatMessage[] = [
      { id: 'a', role: ChatRole.User, content: 'Any breast cancer trials in Toronto?' },
      { id: 'b', role: ChatRole.Assistant, content: 'Yes, I found **one** that may fit.' },
    ];
    renderWithClient(<ChatMessages messages={messages} sessionId="s1" fetchTrial={fetchTrial} />);
    expect(screen.getByText(/any breast cancer trials in toronto/i)).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('renders inline trial citations and reports clicks', async () => {
    const onCitationClick = vi.fn();
    const messages: ChatMessage[] = [
      { id: 'c', role: ChatRole.Assistant, content: 'This one fits: [NCT04267848].' },
    ];
    renderWithClient(
      <ChatMessages
        messages={messages}
        sessionId="s1"
        fetchTrial={fetchTrial}
        onCitationClick={onCitationClick}
      />
    );

    const citation = await screen.findByRole('button', {
      name: /show trial nct04267848 on the map/i,
    });
    await userEvent.click(citation);
    expect(onCitationClick).toHaveBeenCalledWith('NCT04267848');
  });
});
