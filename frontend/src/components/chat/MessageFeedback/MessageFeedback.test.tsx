import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MessageFeedback from './MessageFeedback';
import { submitFeedback } from '@/services/feedback';
import { renderWithClient } from '@/test/render';

vi.mock('@/services/feedback', () => ({ submitFeedback: vi.fn() }));

const config = vi.hoisted(() => ({ isProduction: false }));
vi.mock('@/config', () => ({ config }));

const base = { sessionId: 's1', observationId: 'obs-1' };

beforeEach(() => {
  config.isProduction = false;
  vi.mocked(submitFeedback).mockReset().mockResolvedValue(undefined);
});

describe('MessageFeedback', () => {
  it('records the score immediately when a thumb is clicked', async () => {
    renderWithClient(<MessageFeedback {...base} />);

    await userEvent.click(screen.getByRole('button', { name: 'Helpful' }));

    expect(submitFeedback).toHaveBeenCalledWith({
      sessionId: 's1',
      observationId: 'obs-1',
      score: 1,
    });
  });

  it('submits the comment and suggested NCT chips with the score', async () => {
    renderWithClient(<MessageFeedback {...base} />);

    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));
    await userEvent.type(screen.getByPlaceholderText(/comment/i), 'missed one');
    await userEvent.type(screen.getByPlaceholderText(/nct/i), 'nct0001{Enter}');
    await userEvent.type(screen.getByPlaceholderText(/nct/i), 'NCT0002{Enter}');

    expect(screen.getByText('NCT0001')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(submitFeedback).toHaveBeenLastCalledWith({
      sessionId: 's1',
      observationId: 'obs-1',
      score: 0,
      comment: 'missed one',
      suggestedNctNumbers: ['NCT0001', 'NCT0002'],
    });
  });

  it('sends only the score, with no detail fields, in production', async () => {
    config.isProduction = true;
    renderWithClient(<MessageFeedback {...base} />);

    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));

    expect(submitFeedback).toHaveBeenCalledWith({
      sessionId: 's1',
      observationId: 'obs-1',
      score: 0,
    });
    expect(screen.queryByPlaceholderText(/comment/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/nct/i)).not.toBeInTheDocument();
    expect(screen.getByText(/thanks for the feedback/i)).toBeInTheDocument();
  });

  it('removes a suggested NCT chip', async () => {
    renderWithClient(<MessageFeedback {...base} />);

    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));
    await userEvent.type(screen.getByPlaceholderText(/nct/i), 'NCT0001{Enter}');
    expect(screen.getByText('NCT0001')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /remove nct0001/i }));
    expect(screen.queryByText('NCT0001')).not.toBeInTheDocument();
  });

  it('lets the user score again when sending the score fails', async () => {
    vi.mocked(submitFeedback).mockRejectedValueOnce(new Error('offline'));
    config.isProduction = true;
    renderWithClient(<MessageFeedback {...base} />);

    await userEvent.click(screen.getByRole('button', { name: 'Helpful' }));

    expect(screen.queryByText(/thanks for the feedback/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Helpful' })).toBeEnabled();
  });

  it('keeps the details open to retry when sending them fails', async () => {
    renderWithClient(<MessageFeedback {...base} />);
    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));
    vi.mocked(submitFeedback).mockRejectedValueOnce(new Error('offline'));

    await userEvent.type(screen.getByPlaceholderText(/comment/i), 'missed one');
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(screen.getByPlaceholderText(/comment/i)).toHaveValue('missed one');
    expect(screen.queryByText(/thanks for the feedback/i)).not.toBeInTheDocument();
  });
});
