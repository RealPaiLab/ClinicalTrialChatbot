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
});
