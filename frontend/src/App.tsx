import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createQueryClient } from '@/lib/queryClient';
import HomePage from '@/pages/HomePage';
import DebugPage from '@/pages/DebugPage';

const queryClient = createQueryClient();

const debugEnabled = import.meta.env.VITE_ENABLE_DEBUG_PAGE === 'true';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {debugEnabled && <Route path="/debug" element={<DebugPage />} />}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
