import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SelectedTrials from './SelectedTrials';
import { mockTrials } from '@/test/fixtures/trials';

describe('SelectedTrials', () => {
  it('renders nothing when there are no trials', () => {
    const { container } = render(<SelectedTrials trials={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a chip per trial and removes on click', async () => {
    const onRemove = vi.fn();
    render(<SelectedTrials trials={[mockTrials[0]]} onRemove={onRemove} />);

    expect(screen.getByText(/Immunotherapy for Advanced/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /remove nct04267848 from context/i }));
    expect(onRemove).toHaveBeenCalledWith('NCT04267848');
  });
});
