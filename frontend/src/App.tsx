import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { createQueryClient } from '@/lib/queryClient';
import { useAppStore } from '@/store/appStore';
import ConsentGate from '@/components/consent/ConsentGate';
import TurnstileGate from '@/components/turnstile/TurnstileGate';
import HomePage from '@/pages/HomePage';
import DebugPage from '@/pages/DebugPage';
import NotFoundPage from '@/pages/NotFoundPage';
import TermsPage from '@/pages/TermsPage';
import { config } from '@/config';

const queryClient = createQueryClient();

const debugEnabled = config.isDevelopment;

function App() {
  const theme = useAppStore((state) => state.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ConsentGate>
                <TurnstileGate>
                  <HomePage />
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
