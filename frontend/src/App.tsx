import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import '@/i18n';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { createQueryClient } from '@/lib/queryClient';
import { useAppStore } from '@/store/appStore';
import ConsentGate from '@/components/consent/ConsentGate';
import LanguageGate from '@/components/language/LanguageGate';
import TurnstileGate from '@/components/turnstile/TurnstileGate';
import HomePage from '@/pages/HomePage';
import DebugPage from '@/pages/DebugPage';
import NotFoundPage from '@/pages/NotFoundPage';
import TermsPage from '@/pages/TermsPage';
import { config } from '@/config';

const queryClient = createQueryClient();

const debugEnabled = !config.isProduction;

function App() {
  const theme = useAppStore((state) => state.theme);
  useAppLanguage();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ConsentGate>
                <TurnstileGate>
                  <LanguageGate>
                    <HomePage />
                  </LanguageGate>
                </TurnstileGate>
              </ConsentGate>
            }
          />
          <Route path="/terms" element={<TermsPage />} />
          {debugEnabled && <Route path="/debug" element={<DebugPage />} />}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-center" theme={theme} visibleToasts={4} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
