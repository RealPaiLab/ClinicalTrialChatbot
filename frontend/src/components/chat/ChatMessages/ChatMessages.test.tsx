import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatMessages from './ChatMessages';
import { ChatRole } from '@/constants/chat';
import type { ChatMessage } from '@/types/trial';

describe('ChatMessages', () => {
  it('shows the empty state when there are no messages', () => {
    render(<ChatMessages messages={[]} />);
    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
  });

  it('renders user and assistant message content', () => {
    const messages: ChatMessage[] = [
      { id: 'a', role: ChatRole.User, content: 'Any breast cancer trials in Toronto?' },
      { id: 'b', role: ChatRole.Assistant, content: 'Yes, I found one that may fit.' },
    ];
    render(<ChatMessages messages={messages} />);
    expect(screen.getByText(/any breast cancer trials in toronto/i)).toBeInTheDocument();
    expect(screen.getByText(/i found one that may fit/i)).toBeInTheDocument();
  });
});
