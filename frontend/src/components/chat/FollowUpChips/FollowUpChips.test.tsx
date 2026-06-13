import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FollowUpChips from './FollowUpChips';

describe('FollowUpChips', () => {
  it('renders nothing when there are no questions', () => {
    const { container } = render(<FollowUpChips questions={[]} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onSelect with the clicked question', async () => {
    const onSelect = vi.fn();
    render(
      <FollowUpChips
        questions={['Are there trials in Montreal?', 'What is immunotherapy?']}
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /trials in montreal/i }));
    expect(onSelect).toHaveBeenCalledWith('Are there trials in Montreal?');
  });
});
