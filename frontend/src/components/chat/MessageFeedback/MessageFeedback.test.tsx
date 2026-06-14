import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MessageFeedback from './MessageFeedback';
import { renderWithClient } from '@/test/render';

const base = { sessionId: 's1', observationId: 'obs-1' };

describe('MessageFeedback', () => {
  it('records the score immediately when a thumb is clicked', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithClient(<MessageFeedback {...base} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Helpful' }));

    expect(onSubmit).toHaveBeenCalledWith({ sessionId: 's1', observationId: 'obs-1', score: 1 });
  });

  it('submits the comment and suggested NCT chips with the score', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithClient(<MessageFeedback {...base} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));
    await userEvent.type(screen.getByPlaceholderText(/comment/i), 'missed one');
    await userEvent.type(screen.getByPlaceholderText(/nct/i), 'nct0001{Enter}');
    await userEvent.type(screen.getByPlaceholderText(/nct/i), 'NCT0002{Enter}');

    expect(screen.getByText('NCT0001')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(onSubmit).toHaveBeenLastCalledWith({
      sessionId: 's1',
      observationId: 'obs-1',
      score: 0,
      comment: 'missed one',
      suggestedNctNumbers: ['NCT0001', 'NCT0002'],
    });
  });

  it('removes a suggested NCT chip', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithClient(<MessageFeedback {...base} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));
    await userEvent.type(screen.getByPlaceholderText(/nct/i), 'NCT0001{Enter}');
    expect(screen.getByText('NCT0001')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /remove nct0001/i }));
    expect(screen.queryByText('NCT0001')).not.toBeInTheDocument();
  });
});
