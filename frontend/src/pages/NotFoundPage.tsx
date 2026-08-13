import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-background text-foreground grain relative flex h-screen w-screen items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="bg-primary/20 pointer-events-none absolute size-[36rem] max-w-[90vw] rounded-full blur-[120px]"
      />

      <p
        aria-hidden
        className="text-primary/10 font-display pointer-events-none absolute text-[clamp(12rem,42vw,26rem)] leading-none font-bold tracking-[-0.05em] select-none"
      >
        404
      </p>

      <div className="relative flex flex-col items-center gap-5 text-center">
        <p className="text-eyebrow text-primary animate-in fade-in duration-700">
          {t('notFound.eyebrow')}
        </p>
        <h1 className="text-display animate-in fade-in slide-in-from-bottom-2 max-w-xl duration-700">
          {t('notFound.title')}
        </h1>
        <div className="bg-primary/40 h-px w-16" />
        <Button asChild size="lg" className="animate-in fade-in duration-1000">
          <Link to="/">{t('notFound.action')}</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
