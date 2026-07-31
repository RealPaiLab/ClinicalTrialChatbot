import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTrialPdfExport } from './useTrialPdfExport';
import { mockTrials } from '@/test/fixtures/trials';

const toBlob = vi.fn(async () => new Blob(['pdf'], { type: 'application/pdf' }));

vi.mock('@react-pdf/renderer', () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return {
    pdf: () => ({ toBlob }),
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
  it('renders a blob and downloads it under the trial name', async () => {
    const click = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(click);
    URL.createObjectURL = vi.fn(() => 'blob:pdf');
    URL.revokeObjectURL = vi.fn();

    const { result } = renderHook(() => useTrialPdfExport());

    await act(async () => {
      await result.current.exportTrials([mockTrials[0]]);
    });

    await waitFor(() => expect(toBlob).toHaveBeenCalled());
    expect(click).toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
  });

  it('does nothing without trials', async () => {
    const { result } = renderHook(() => useTrialPdfExport());

    await act(async () => {
      await result.current.exportTrials([]);
    });

    expect(result.current.isExporting).toBe(false);
  });
});
