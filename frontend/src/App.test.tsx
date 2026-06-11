import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the chat panel, remaining placeholders, and the theme toggle', () => {
    render(<App />);
    expect(screen.getByText('Trial Navigator')).toBeInTheDocument();
    expect(screen.getByText(/map panel/i)).toBeInTheDocument();
    expect(screen.getByText(/trial summary/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});
