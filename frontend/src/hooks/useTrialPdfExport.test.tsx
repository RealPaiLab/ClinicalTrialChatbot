import type { ReactElement, ReactNode } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTrialPdfExport } from './useTrialPdfExport';
import { mockTrials } from '@/test/fixtures/trials';
import { clientWrapper } from '@/test/render';

const documents = vi.hoisted(() => [] as ReactElement[]);

vi.mock('@react-pdf/renderer', () => {
  const passthrough = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    pdf: (element: ReactElement) => {
      documents.push(element);
      return { toBlob: async () => new Blob(['pdf'], { type: 'application/pdf' }) };
    },
    Font: { register: vi.fn(), registerHyphenationCallback: vi.fn() },
    StyleSheet: { create: <T,>(sheet: T) => sheet },
    Document: passthrough,
    Page: passthrough,
    View: passthrough,
    Text: passthrough,
    Link: passthrough,
  };
});

const click = vi.fn();

async function exportTrial() {
  const { result } = renderHook(() => useTrialPdfExport(), { wrapper: clientWrapper() });
  await act(async () => {
    await result.current.exportTrials([mockTrials[0]]);
  });
  return result;
}

beforeEach(() => {
  documents.length = 0;
  click.mockClear();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(click);
  URL.createObjectURL = vi.fn(() => 'blob:pdf');
  URL.revokeObjectURL = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ published_at: '2026-09-02T13:04:22Z' }))
  );
});

describe('useTrialPdfExport', () => {
  it('renders the trial into a PDF and downloads it', async () => {
    const result = await exportTrial();

    expect(click).toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
    render(documents[0]);
    expect(screen.getByText(mockTrials[0].officialTitleEn as string)).toBeInTheDocument();
  });

  it('stamps the document with the published date, in English', async () => {
    await exportTrial();

    render(documents[0]);
    expect(screen.getByText(/trial data last checked 2 sept 2026/i)).toBeInTheDocument();
  });

  it('exports without a date rather than failing when freshness is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 }))
    );

    await exportTrial();

    expect(click).toHaveBeenCalled();
    render(documents[0]);
    expect(screen.queryByText(/trial data last checked/i)).not.toBeInTheDocument();
  });
});
