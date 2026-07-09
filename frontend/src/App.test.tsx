import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

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
