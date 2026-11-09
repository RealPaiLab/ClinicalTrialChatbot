import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TrialCitation from './TrialCitation';
import { renderWithClient } from '@/test/render';
import { mockTrials } from '@/test/fixtures/trials';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TrialCitation', () => {
  it('shows a trial the chat already returned, without refetching, and reports clicks', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const onSelect = vi.fn();
    renderWithClient(<TrialCitation trialRef="CTC-4267848A" onSelect={onSelect} />, {
      trials: [mockTrials[0]],
    });

    const pill = screen.getByRole('button', { name: /show .+ on the map/i });
    expect(pill).toHaveTextContent(/Immunotherapy for Advanced/i);

    await userEvent.click(pill);
    expect(onSelect).toHaveBeenCalledWith('CTC-4267848A');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches a cited trial the chat did not return', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () =>
      Response.json({
        trial_ref: 'CTC-4267848A',
        nct_number: 'NCT04267848',
        short_title_en: 'Fetched On Detect',
        sites: [],
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    renderWithClient(<TrialCitation trialRef="CTC-4267848A" onSelect={vi.fn()} />);

    expect(await screen.findByText(/fetched on detect/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain('/trials/CTC-4267848A');
  });
});
