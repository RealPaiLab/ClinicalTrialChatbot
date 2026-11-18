import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dataFreshnessQuery } from '@/services/dataFreshness';
import type { Trial } from '@/types/trial';

function fileNameFor(trials: Trial[]): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return trials.length === 1 ? `${trials[0].trialRef}-${stamp}.pdf` : `saved-trials-${stamp}.pdf`;
}

function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** A PDF without the data date beats no PDF. */
async function fetchDataPublishedAt(queryClient: QueryClient): Promise<string | null> {
  try {
    return (await queryClient.ensureQueryData(dataFreshnessQuery())).publishedAt;
  } catch {
    return null;
  }
}

export function useTrialPdfExport() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  // The renderer and its fonts are a large chunk, so they load on first export, not with the app.
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
        const dataPublishedAt = await fetchDataPublishedAt(queryClient);
        const blob = await pdf(
          <TrialPdfDocument trials={trials} dataPublishedAt={dataPublishedAt} />
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
