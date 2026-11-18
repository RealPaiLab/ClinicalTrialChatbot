import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TrialSummaryPanel from './TrialSummaryPanel';
import { AGENT_NAME } from '@/constants/chat';
import { siteKey } from '@/lib/trial';
import { useAppStore } from '@/store/appStore';
import { mockTrials } from '@/test/fixtures/trials';
import { renderWithClient } from '@/test/render';
import type { Trial } from '@/types/trial';

function renderSelected(trial: Trial | null, siteKey: string | null = null) {
  useAppStore.setState({
    trials: trial ? [trial] : [],
    selectedTrialRef: trial?.trialRef ?? null,
    selectedSiteKey: siteKey,
  });
  return renderWithClient(<TrialSummaryPanel onClose={vi.fn()} />);
}

describe('TrialSummaryPanel', () => {
  it('shows the empty state when no trial is selected', () => {
    renderSelected(null);
    expect(screen.getByText(/no trial selected/i)).toBeInTheDocument();
  });

  it('renders the official title, facts, description, and criteria', () => {
    renderSelected(mockTrials[0]);
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

  it('describes the site a map pin chose rather than the primary one', () => {
    const montreal = mockTrials[0].sites.find((site) => site.city === 'Montreal');
    renderSelected(mockTrials[0], montreal ? siteKey(montreal) : null);
    expect(screen.getByText('Montreal')).toBeInTheDocument();
    expect(screen.queryByText('Toronto')).not.toBeInTheDocument();
  });

  it('holds back fact values past the second until asked', async () => {
    renderSelected({
      ...mockTrials[0],
      treatmentTypeNames: ['immunotherapy', 'chemotherapy', 'radiation', 'surgery'],
    });

    expect(screen.getByText('immunotherapy, chemotherapy')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /show 2 more/i }));
    expect(screen.getByText('immunotherapy, chemotherapy, radiation, surgery')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /show less/i }));
    expect(screen.getByText('immunotherapy, chemotherapy')).toBeInTheDocument();
  });

  it('adds the trial to the chat context, then shows it as added', async () => {
    renderSelected(mockTrials[0]);
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`ask ${AGENT_NAME} about this trial`, 'i') })
    );
    expect(useAppStore.getState().contextTrialRefs).toEqual(['CTC-4267848A']);
    expect(screen.getByRole('button', { name: /added to your chat/i })).toBeDisabled();
  });

  it('toggles the bookmark and reflects the saved state', async () => {
    renderSelected(mockTrials[0]);

    await userEvent.click(screen.getByRole('button', { name: /save this trial/i }));
    expect(useAppStore.getState().bookmarkedTrialRefs).toEqual(['CTC-4267848A']);
    expect(screen.getByRole('button', { name: /remove from saved trials/i })).toBeInTheDocument();
  });
});
