import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BookmarksSheet from './BookmarksSheet';
import { renderWithClient } from '@/test/render';
import { mockTrials } from '@/test/fixtures/trials';

const fetchTrial = async (nctNumber: string) => {
  const trial = mockTrials.find((candidate) => candidate.nctNumber === nctNumber);
  if (!trial) throw new Error('not found');
  return trial;
};

describe('BookmarksSheet', () => {
  it('shows the empty state when nothing is saved', () => {
    renderWithClient(
      <BookmarksSheet
        open
        onOpenChange={vi.fn()}
        bookmarkedNctNumbers={[]}
        onRemove={vi.fn()}
        onExport={vi.fn()}
        fetchTrial={fetchTrial}
      />
    );

    expect(screen.getByText(/nothing saved yet/i)).toBeInTheDocument();
  });

  it('renders a row per bookmark and removes on click', async () => {
    const onRemove = vi.fn();
    renderWithClient(
      <BookmarksSheet
        open
        onOpenChange={vi.fn()}
        bookmarkedNctNumbers={['NCT04267848']}
        onRemove={onRemove}
        onExport={vi.fn()}
        fetchTrial={fetchTrial}
      />
    );

    expect(await screen.findByText(/Immunotherapy for Advanced/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /remove from saved trials/i }));
    expect(onRemove).toHaveBeenCalledWith('NCT04267848');
  });

  it('exports the loaded trials', async () => {
    const onExport = vi.fn();
    renderWithClient(
      <BookmarksSheet
        open
        onOpenChange={vi.fn()}
        bookmarkedNctNumbers={['NCT04267848']}
        onRemove={vi.fn()}
        onExport={onExport}
        fetchTrial={fetchTrial}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: /export all as pdf/i }));
    expect(onExport).toHaveBeenCalledWith([mockTrials[0]]);
  });
});
