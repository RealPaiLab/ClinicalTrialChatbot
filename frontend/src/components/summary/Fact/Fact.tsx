import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FactProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function Fact({ label, children, className }: FactProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <dt className="text-eyebrow text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default Fact;
