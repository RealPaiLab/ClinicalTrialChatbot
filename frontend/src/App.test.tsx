import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the hero heading and the theme toggle', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /find the right cancer trial/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});
