import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createQueryClient } from '@/lib/queryClient';
import TurnstileGate from '@/components/turnstile/TurnstileGate';
import HomePage from '@/pages/HomePage';
import DebugPage from '@/pages/DebugPage';
import { config } from '@/config';

const queryClient = createQueryClient();

const debugEnabled = config.enableDebugPage;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <TurnstileGate>
                <HomePage />
              </TurnstileGate>
            }
          />
          {debugEnabled && <Route path="/debug" element={<DebugPage />} />}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
