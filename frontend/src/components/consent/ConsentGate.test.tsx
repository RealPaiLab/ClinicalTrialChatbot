import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import ConsentGate from './ConsentGate';

function renderGate() {
  return render(
    <ConsentGate>
      <p>protected app</p>
    </ConsentGate>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('ConsentGate', () => {
  it('withholds the app until the terms are agreed to, and remembers the agreement', async () => {
    const { unmount } = renderGate();
    expect(screen.queryByText('protected app')).not.toBeInTheDocument();

    const agree = screen.getByRole('button', { name: /^continue$/i });
    expect(agree).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(agree);
    expect(screen.getByText('protected app')).toBeInTheDocument();

    unmount();
    renderGate();
    expect(screen.getByText('protected app')).toBeInTheDocument();
  });

  it('links to the terms page in a new tab', () => {
    renderGate();
    const link = screen.getByRole('link', { name: /terms and conditions/i });
    expect(link).toHaveAttribute('href', '/terms');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
