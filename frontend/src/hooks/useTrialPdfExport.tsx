import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PDF_DATA_DATE_LOCALE, formatDataDate } from '@/lib/dataDate';
import { dataFreshnessQuery } from '@/services/dataFreshness';
import type { Trial } from '@/types/trial';

function fileNameFor(trials: Trial[]): string {
  const stamp = new Date().toISOString().slice(0, 10);
  if (trials.length === 1 && trials[0].trialRef) {
    return `${trials[0].trialRef}-${stamp}.pdf`;
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

/** The PDF renders stored English text, so its date stays English too. */
async function fetchDataUpdatedOn(queryClient: QueryClient): Promise<string | null> {
  try {
    const { publishedAt } = await queryClient.ensureQueryData(dataFreshnessQuery());
    return publishedAt === null ? null : formatDataDate(publishedAt, PDF_DATA_DATE_LOCALE);
  } catch {
    return null;
  }
}

export function useTrialPdfExport() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  // The renderer and its fonts are a large chunk, so they load on first export
  // rather than with the app.
  const exportTrials = useCallback(
    async (trials: Trial[]) => {
      if (trials.length === 0) return;

      setIsExporting(true);
      toast.info(t('export.preparing'));

      try {
        const [{ pdf }, { registerPdfFonts }, { default: TrialPdfDocument }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('@/components/export/pdf/fonts'),
          import('@/components/export/pdf/TrialPdfDocument'),
        ]);

        registerPdfFonts();
        const dataUpdatedOn = await fetchDataUpdatedOn(queryClient);
        const blob = await pdf(
          <TrialPdfDocument trials={trials} dataUpdatedOn={dataUpdatedOn} />
        ).toBlob();
        download(blob, fileNameFor(trials));
        toast.success(t('export.ready'));
      } catch {
        toast.error(t('export.failed'), { description: t('export.failedHint') });
      } finally {
        setIsExporting(false);
      }
    },
    [t, queryClient]
  );

  return { exportTrials, isExporting };
}
