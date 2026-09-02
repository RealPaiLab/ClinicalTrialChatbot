import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTrialPdfExport } from './useTrialPdfExport';
import { mockTrials } from '@/test/fixtures/trials';
import { clientWrapper } from '@/test/render';

const toBlob = vi.fn(async () => new Blob(['pdf'], { type: 'application/pdf' }));
const rendered = vi.fn();

vi.mock('@react-pdf/renderer', () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return {
    pdf: (element: { props: unknown }) => {
      rendered(element.props);
      return { toBlob };
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

describe('useTrialPdfExport', () => {
  beforeEach(() => {
    rendered.mockClear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ published_at: '2026-09-02T13:04:22Z' }))
    );
  });

  it('renders a blob and downloads it under the trial name', async () => {
    const click = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(click);
    URL.createObjectURL = vi.fn(() => 'blob:pdf');
    URL.revokeObjectURL = vi.fn();

    const { result } = renderHook(() => useTrialPdfExport(), { wrapper: clientWrapper() });

    await act(async () => {
      await result.current.exportTrials([mockTrials[0]]);
    });

    await waitFor(() => expect(toBlob).toHaveBeenCalled());
    expect(click).toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
  });

  it('stamps the document with the published date, in English', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:pdf');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(vi.fn());

    const { result } = renderHook(() => useTrialPdfExport(), { wrapper: clientWrapper() });

    await act(async () => {
      await result.current.exportTrials([mockTrials[0]]);
    });

    expect(rendered).toHaveBeenCalledWith(
      expect.objectContaining({ dataUpdatedOn: '2 Sept 2026' })
    );
  });

  it('exports without a date rather than failing when freshness is unavailable', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:pdf');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(vi.fn());
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 }))
    );

    const { result } = renderHook(() => useTrialPdfExport(), { wrapper: clientWrapper() });

    await act(async () => {
      await result.current.exportTrials([mockTrials[0]]);
    });

    expect(rendered).toHaveBeenCalledWith(expect.objectContaining({ dataUpdatedOn: null }));
  });

  it('does nothing without trials', async () => {
    const { result } = renderHook(() => useTrialPdfExport(), { wrapper: clientWrapper() });

    await act(async () => {
      await result.current.exportTrials([]);
    });

    expect(result.current.isExporting).toBe(false);
  });
});
