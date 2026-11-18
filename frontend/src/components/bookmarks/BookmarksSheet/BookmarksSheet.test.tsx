import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BookmarksSheet from './BookmarksSheet';
import { useTrialPdfExport } from '@/hooks/useTrialPdfExport';
import { useAppStore } from '@/store/appStore';
import { renderWithClient } from '@/test/render';
import { mockTrials } from '@/test/fixtures/trials';

vi.mock('@/hooks/useTrialPdfExport', () => ({
  useTrialPdfExport: vi.fn(() => ({ exportTrials: vi.fn(), isExporting: false })),
}));

function renderSheet(bookmarkedTrialRefs: string[]) {
  useAppStore.setState({ bookmarkedTrialRefs });
  renderWithClient(<BookmarksSheet open onOpenChange={vi.fn()} />, { trials: mockTrials });
}

describe('BookmarksSheet', () => {
  it('shows the empty state when nothing is saved', () => {
    renderSheet([]);
    expect(screen.getByText(/nothing saved yet/i)).toBeInTheDocument();
  });

  it('renders a row per bookmark and removes on click', async () => {
    renderSheet(['CTC-4267848A']);

    expect(await screen.findByText(/Immunotherapy for Advanced/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /remove from saved trials/i }));
    expect(useAppStore.getState().bookmarkedTrialRefs).toEqual([]);
  });

  it('opens a saved trial on the map and in the chat context', async () => {
    renderSheet(['CTC-4267848A']);

    await userEvent.click(await screen.findByText(/Immunotherapy for Advanced/i));

    const state = useAppStore.getState();
    expect(state.trials).toEqual([mockTrials[0]]);
    expect(state.selectedTrialRef).toBe('CTC-4267848A');
    expect(state.contextTrialRefs).toEqual(['CTC-4267848A']);
  });

  it('exports the loaded trials', async () => {
    const exportTrials = vi.fn();
    vi.mocked(useTrialPdfExport).mockReturnValue({ exportTrials, isExporting: false });
    renderSheet(['CTC-4267848A']);

    await userEvent.click(await screen.findByRole('button', { name: /export all as pdf/i }));
    expect(exportTrials).toHaveBeenCalledWith([mockTrials[0]]);
  });
});
