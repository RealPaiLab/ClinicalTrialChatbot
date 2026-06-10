import { Button } from '@/components/ui/button';

function App() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Clinical Trial Chatbot</h1>
      <p className="text-muted-foreground">Frontend toolchain is ready.</p>
      <Button>Get started</Button>
    </main>
  );
}

export default App;
