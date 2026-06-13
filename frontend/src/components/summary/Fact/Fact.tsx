import type { ReactNode } from 'react';

interface FactProps {
  label: string;
  children: ReactNode;
}

function Fact({ label, children }: FactProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-eyebrow text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default Fact;
