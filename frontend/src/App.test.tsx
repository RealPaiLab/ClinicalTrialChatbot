import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the heading and the get-started button', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /clinical trial chatbot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });
});
