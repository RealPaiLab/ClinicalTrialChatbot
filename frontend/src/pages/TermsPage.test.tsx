import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TermsPage from './TermsPage';

describe('TermsPage', () => {
  it('renders the terms markdown, including headings and bolded warnings', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /^terms of use$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /acceptable use/i })).toBeInTheDocument();
    expect(screen.getByText(/you assume all risks/i)).toBeInTheDocument();
  });

  it('shows the effective date derived from the consent version, read in UTC', () => {
    render(<TermsPage />);
    expect(screen.getByText('Effective 16 July 2026')).toBeInTheDocument();
  });

  it('renders the principal investigators as mailto links', () => {
    render(<TermsPage />);
    expect(screen.getByRole('link', { name: 'lstein@oicr.on.ca' })).toHaveAttribute(
      'href',
      'mailto:lstein@oicr.on.ca'
    );
    expect(screen.getByRole('link', { name: 'spai@oicr.on.ca' })).toHaveAttribute(
      'href',
      'mailto:spai@oicr.on.ca'
    );
  });
});
