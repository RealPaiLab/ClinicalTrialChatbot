import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppHeader from './AppHeader';
import { renderWithClient } from '@/test/render';

const props = {
  dark: false,
  bookmarkCount: 0,
  onOpenBookmarks: vi.fn(),
  onStartTour: vi.fn(),
  onToggleTheme: vi.fn(),
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderHeader() {
  renderWithClient(<AppHeader {...props} />);
}

describe('AppHeader data badge', () => {
  it('shows the published date once the server supplies one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ published_at: '2026-09-02T13:04:22Z' }))
    );

    renderHeader();

    await waitFor(() => expect(screen.getByText(/2 SEPT 2026/i)).toBeInTheDocument());
  });

  it('shows no date while the request is still in flight', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {}))
    );

    renderHeader();

    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
  });

  it('shows no date when the request fails, rather than a stale one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 }))
    );

    renderHeader();

    await waitFor(() => expect(screen.queryByText(/2026/)).not.toBeInTheDocument());
  });
});
