import { useCallback, useMemo, useState, type ReactNode } from 'react';
import Spinner from '@/components/Spinner/Spinner';
import { Button } from '@/components/ui/button';
import { config } from '@/config';
import { getVerificationId } from '@/lib/verification';
import { TurnstileContext, type TurnstileContextValue } from './TurnstileContext';
import TurnstileWidget from './TurnstileWidget';

interface TurnstileGateProps {
  children: ReactNode;
}

function TurnstileGate({ children }: TurnstileGateProps) {
  const enabled = Boolean(config.turnstileSiteKey);
  const [verificationId] = useState(getVerificationId);
  const [token, setToken] = useState<string | null>(null);
  const [verified, setVerified] = useState(!enabled);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const handleToken = useCallback((next: string | null) => {
    setToken(next);
    if (next) {
      setVerified(true);
      setFailed(false);
    }
  }, []);

  const handleFailed = useCallback(() => setFailed(true), []);

  const reset = useCallback(() => {
    if (!enabled) return;
    setToken(null);
    setVerified(false);
    setFailed(false);
    setAttempt((n) => n + 1);
  }, [enabled]);

  const retry = useCallback(() => {
    setFailed(false);
    setToken(null);
    setVerified(false);
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo<TurnstileContextValue>(
    () => ({ enabled, ready: verified, token, verificationId, reset }),
    [enabled, verified, token, verificationId, reset]
  );

  return (
    <TurnstileContext.Provider value={value}>
      {enabled && !verified && (
        <TurnstileWidget
          key={attempt}
          siteKey={config.turnstileSiteKey}
          onToken={handleToken}
          onFailed={handleFailed}
        />
      )}
      {verified ? (
        children
      ) : (
        <div className="bg-background text-foreground flex h-screen w-screen flex-col items-center justify-center gap-4 px-6 text-center">
          {failed ? (
            <>
              <p className="text-title">We couldn't verify you</p>
              <p className="text-caption text-muted-foreground max-w-sm">
                Something went wrong while verifying you. Please try again.
              </p>
              <Button onClick={retry}>Try again</Button>
            </>
          ) : (
            <>
              <Spinner className="text-primary text-2xl" />
              <p className="text-caption text-muted-foreground">Checking if you're human...</p>
            </>
          )}
        </div>
      )}
    </TurnstileContext.Provider>
  );
}

export default TurnstileGate;
