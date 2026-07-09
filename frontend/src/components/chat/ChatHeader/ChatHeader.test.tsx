import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatHeader from './ChatHeader';

describe('ChatHeader', () => {
  it('renders the title', () => {
    render(<ChatHeader />);
    expect(screen.getByText('Cancer Trial Navigator')).toBeInTheDocument();
  });

  it('triggers a new conversation when the button is clicked', async () => {
    const onNewConversation = vi.fn();
    render(<ChatHeader onNewConversation={onNewConversation} />);

    await userEvent.click(screen.getByRole('button', { name: /new conversation/i }));
    expect(onNewConversation).toHaveBeenCalledTimes(1);
  });
});
