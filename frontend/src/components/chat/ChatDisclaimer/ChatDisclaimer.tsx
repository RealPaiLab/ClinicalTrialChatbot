import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/useIsMobile';

function ChatDisclaimer() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const text = `${t('chat.disclaimer')} ${t('data.shortNotice')}`;

  if (!isMobile) {
    return <p className="text-muted-foreground text-center text-[0.7rem] leading-tight">{text}</p>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-muted-foreground mx-auto h-8">
          <Info data-icon="inline-start" />
          {t('mobile.aboutAnswers')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('mobile.aboutAnswers')}</DialogTitle>
          <DialogDescription className="leading-relaxed">{text}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ChatDisclaimer;
