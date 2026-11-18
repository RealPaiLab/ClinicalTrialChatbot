import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppHeader from './AppHeader';
import { renderWithClient } from '@/test/render';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AppHeader data badge', () => {
  it('shows the published date once the server supplies one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ published_at: '2026-09-02T13:04:22Z', sources: [] }))
    );

    renderWithClient(<AppHeader onOpenBookmarks={vi.fn()} onStartTour={vi.fn()} />);

    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
    expect(await screen.findByText(/2 SEPT 2026/i)).toBeInTheDocument();
  });
});
