import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { EXPORT_TOAST } from '@/constants/bookmarks';
import type { Trial } from '@/types/trial';

function fileNameFor(trials: Trial[]): string {
  const stamp = new Date().toISOString().slice(0, 10);
  if (trials.length === 1 && trials[0].nctNumber) {
    return `${trials[0].nctNumber}-${stamp}.pdf`;
  }
  return `saved-trials-${stamp}.pdf`;
}

function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function useTrialPdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  // The renderer and its fonts are a large chunk, so they load on first export
  // rather than with the app.
  const exportTrials = useCallback(async (trials: Trial[]) => {
    if (trials.length === 0) return;

    setIsExporting(true);
    toast.info(EXPORT_TOAST.preparing);

    try {
      const [{ pdf }, { registerPdfFonts }, { default: TrialPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/export/pdf/fonts'),
        import('@/components/export/pdf/TrialPdfDocument'),
      ]);

      registerPdfFonts();
      const blob = await pdf(<TrialPdfDocument trials={trials} />).toBlob();
      download(blob, fileNameFor(trials));
      toast.success(EXPORT_TOAST.ready);
    } catch {
      toast.error(EXPORT_TOAST.failed, { description: EXPORT_TOAST.failedHint });
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportTrials, isExporting };
}
