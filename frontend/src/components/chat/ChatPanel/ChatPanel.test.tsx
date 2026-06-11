import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatPanel from './ChatPanel';

describe('ChatPanel', () => {
  it('starts on the empty state', () => {
    render(<ChatPanel />);
    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
  });

  it('sends a message, shows the canned reply, and reports trials', async () => {
    const onTrialsChange = vi.fn();
    render(<ChatPanel onTrialsChange={onTrialsChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'breast cancer trials in Toronto');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/breast cancer trials in toronto/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/a trial that may fit/i)).toBeInTheDocument();
    });

    expect(onTrialsChange).toHaveBeenCalledTimes(1);
    expect(onTrialsChange.mock.calls[0][0][0].nctNumber).toBe('NCT04267848');
  });

  it('offers the follow-up chips after a reply', async () => {
    render(<ChatPanel />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /eligibility requirements/i })).toBeInTheDocument();
    });
  });
});
