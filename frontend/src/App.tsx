import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const swatches = [
  { name: 'background', className: 'bg-background border' },
  { name: 'card', className: 'bg-card border' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'foreground', className: 'bg-foreground' },
];

const statuses = [
  { name: 'Recruiting', className: 'bg-recruiting' },
  { name: 'Active', className: 'bg-active' },
  { name: 'Completed', className: 'bg-completed' },
  { name: 'Closed', className: 'bg-closed' },
];

function App() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <main className="grain bg-background text-foreground min-h-screen">
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:px-10">
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-5">
            <span className="text-eyebrow text-primary">Clinical Trial Navigator</span>
            <h1 className="text-display max-w-2xl text-balance">
              Find the right cancer trial, in plain language.
            </h1>
            <p className="text-subhead text-muted-foreground max-w-xl">
              A warm, editorial interface pairing Bricolage Grotesque display with Hanken Grotesk
              body, set on espresso and cream.
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? <Sun /> : <Moon />}
          </Button>
        </header>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <section className="flex flex-col gap-4">
            <span className="text-eyebrow text-muted-foreground">Palette</span>
            <div className="flex flex-wrap gap-4">
              {swatches.map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-1.5">
                  <div className={`size-14 rounded-lg ${s.className}`} />
                  <span className="text-caption text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>

            <span className="text-eyebrow text-muted-foreground mt-4">Trial status</span>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <span
                  key={s.name}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white ${s.className}`}
                >
                  <span className="size-1.5 rounded-full bg-white/90" />
                  {s.name}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-card flex flex-col gap-4 rounded-xl border p-6">
            <span className="text-eyebrow text-muted-foreground">Type scale</span>
            <p className="text-display">Aa</p>
            <p className="text-headline">Headline, tightly tracked</p>
            <p className="text-title">Card title in Bricolage</p>
            <p className="text-subhead text-muted-foreground">
              Subhead and lead paragraphs read in Hanken Grotesk.
            </p>
            <p className="text-sm">
              Body copy stays highly legible for patients. Trial identifiers render in mono:{' '}
              <span className="font-mono text-sm">NCT04267848</span>.
            </p>
          </section>
        </div>

        <section className="mt-12 flex flex-col gap-4">
          <span className="text-eyebrow text-muted-foreground">Components</span>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Match me to trials</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Badge>Breast cancer</Badge>
            <Badge variant="secondary">Phase II</Badge>
            <Badge variant="outline">Quebec</Badge>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
