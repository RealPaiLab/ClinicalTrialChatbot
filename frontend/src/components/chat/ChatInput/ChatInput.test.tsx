import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatInput from './ChatInput';

describe('ChatInput', () => {
  it('sends trimmed text on submit', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    await userEvent.type(screen.getByRole('textbox'), '  trials near me  ');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSend).toHaveBeenCalledWith('trials near me');
  });

  it('sends on Enter', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    await userEvent.type(screen.getByRole('textbox'), 'hello{Enter}');
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('does not send empty input', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('calls onStop instead of onSend while streaming', async () => {
    const onSend = vi.fn();
    const onStop = vi.fn();
    render(<ChatInput onSend={onSend} onStop={onStop} status="streaming" />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSend).not.toHaveBeenCalled();
  });
});
