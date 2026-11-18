import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const FRAMES = ['⣼', '⣹', '⢻', '⠿', '⡟', '⣏', '⣧', '⣶'];
const FRAME_MS = 80;

function Spinner({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((current) => (current + 1) % FRAMES.length), FRAME_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span aria-hidden className={cn('font-mono leading-none', className)}>
      {FRAMES[index]}
    </span>
  );
}

export default Spinner;
