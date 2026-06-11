import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatHeader from './ChatHeader';

describe('ChatHeader', () => {
  it('renders the title and tagline', () => {
    render(<ChatHeader />);
    expect(screen.getByText('Trial Navigator')).toBeInTheDocument();
    expect(screen.getByText(/plain language/i)).toBeInTheDocument();
  });
});
