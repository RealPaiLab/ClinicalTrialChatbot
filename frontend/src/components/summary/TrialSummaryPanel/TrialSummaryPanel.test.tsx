import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TrialSummaryPanel from './TrialSummaryPanel';
import { mockTrials } from '@/test/fixtures/trials';

describe('TrialSummaryPanel', () => {
  it('shows the empty state when no trial is selected', () => {
    render(<TrialSummaryPanel trial={null} />);
    expect(screen.getByText(/no trial selected/i)).toBeInTheDocument();
  });

  it('renders the official title, facts, description, and criteria', () => {
    render(<TrialSummaryPanel trial={mockTrials[0]} />);
    expect(
      screen.getByRole('heading', { name: /a phase ii study of pembrolizumab/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Recruiting')).toBeInTheDocument();
    expect(screen.getByText('breast cancer')).toBeInTheDocument();
    expect(screen.getByText('Phase 2')).toBeInTheDocument();
    expect(screen.getByText('Toronto')).toBeInTheDocument();
    expect(screen.getByText('Ontario')).toBeInTheDocument();
    expect(screen.getByText(/adding immunotherapy/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /who can join/i })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<TrialSummaryPanel trial={mockTrials[0]} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('adds the trial to context when the AI button is clicked', async () => {
    const onAddToContext = vi.fn();
    render(<TrialSummaryPanel trial={mockTrials[0]} onAddToContext={onAddToContext} />);
    await userEvent.click(screen.getByRole('button', { name: /ask camille about this trial/i }));
    expect(onAddToContext).toHaveBeenCalledWith('NCT04267848');
  });

  it('disables the AI button once the trial is in context', () => {
    render(<TrialSummaryPanel trial={mockTrials[0]} onAddToContext={vi.fn()} isInContext />);
    expect(screen.getByRole('button', { name: /added to your chat/i })).toBeDisabled();
  });
});
