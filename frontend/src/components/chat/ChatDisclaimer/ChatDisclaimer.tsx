import { useTranslation } from 'react-i18next';

function ChatDisclaimer() {
  const { t } = useTranslation();

  return (
    <p className="text-muted-foreground text-center text-[0.7rem] leading-tight">
      {t('chat.disclaimer')} {t('data.shortNotice')}
    </p>
  );
}

export default ChatDisclaimer;
