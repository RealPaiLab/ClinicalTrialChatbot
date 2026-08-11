import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import App from './App';

// The Turnstile gate depends on Cloudflare's script, which can't load in jsdom.
// This is a layout test, so render the gate as a transparent pass-through.
vi.mock('@/components/turnstile/TurnstileGate', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

// Same for the consent and language gates: this test is about layout.
vi.mock('@/components/consent/ConsentGate', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/components/language/LanguageGate', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

describe('App', () => {
  it('renders the chat panel, map region, summary placeholder, and theme toggle', () => {
    render(<App />);
    expect(screen.getByText('Cancer Trial Navigator')).toBeInTheDocument();
    expect(screen.getByText(/mapbox token/i)).toBeInTheDocument();
    expect(screen.getByText(/no trial selected/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /switch to (dark|light) theme/i })
    ).toBeInTheDocument();
  });
});
