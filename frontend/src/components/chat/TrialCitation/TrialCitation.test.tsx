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
      <TrialCitation nctNumber="NCT04267848" fetchTrial={fetchTrial} onSelect={onSelect} />
    );

    const trigger = await screen.findByRole('button', {
      name: /show trial nct04267848 on the map/i,
    });
    expect(await screen.findByText(/Immunotherapy for Advanced/i)).toBeInTheDocument();
    expect(fetchTrial).toHaveBeenCalledWith('NCT04267848', expect.anything());

    await userEvent.click(trigger);
    expect(onSelect).toHaveBeenCalledWith('NCT04267848');
  });
});
