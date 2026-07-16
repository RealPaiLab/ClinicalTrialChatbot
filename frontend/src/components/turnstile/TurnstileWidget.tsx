import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string | null) => void;
  onFailed: () => void;
}

function TurnstileWidget({ siteKey, onToken, onFailed }: TurnstileWidgetProps) {
  const [interactive, setInteractive] = useState(false);

  const fail = () => {
    setInteractive(false);
    onFailed();
  };

  return (
    <Turnstile
      siteKey={siteKey}
      options={{ appearance: 'interaction-only', theme: 'auto' }}
      scriptOptions={{ onError: fail }}
      onSuccess={(token) => {
        setInteractive(false);
        onToken(token);
      }}
      onBeforeInteractive={() => setInteractive(true)}
      onAfterInteractive={() => setInteractive(false)}
      onExpire={() => onToken(null)}
      onError={fail}
      onTimeout={fail}
      onUnsupported={fail}
      className={
        interactive
          ? 'bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'
          : 'fixed right-4 bottom-4 z-50'
      }
    />
  );
}

export default TurnstileWidget;
