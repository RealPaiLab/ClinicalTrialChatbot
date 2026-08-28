import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TrialCitation from './TrialCitation';
import { renderWithClient } from '@/test/render';
import { mockTrials } from '@/test/fixtures/trials';

describe('TrialCitation', () => {
  it('fetches and renders the trial title, and reports clicks', async () => {
    const onSelect = vi.fn();
    const fetchTrial = vi.fn().mockResolvedValue(mockTrials[0]);
    renderWithClient(
      <TrialCitation trialRef="CTC-4267848A" fetchTrial={fetchTrial} onSelect={onSelect} />
    );

    const trigger = await screen.findByRole('button', {
      name: /show .+ on the map/i,
    });
    expect(await screen.findByText(/Immunotherapy for Advanced/i)).toBeInTheDocument();
    expect(fetchTrial).toHaveBeenCalledWith('CTC-4267848A', expect.anything());

    await userEvent.click(trigger);
    expect(onSelect).toHaveBeenCalledWith('CTC-4267848A');
  });
});
