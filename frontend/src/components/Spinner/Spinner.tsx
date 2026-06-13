import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const DOTS13_FRAMES = ['⣼', '⣹', '⢻', '⠿', '⡟', '⣏', '⣧', '⣶'];
const DOTS13_INTERVAL = 80;

interface SpinnerProps {
  frames?: string[];
  interval?: number;
  className?: string;
}

function Spinner({ frames = DOTS13_FRAMES, interval = DOTS13_INTERVAL, className }: SpinnerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((current) => (current + 1) % frames.length), interval);
    return () => clearInterval(id);
  }, [frames.length, interval]);

  return (
    <span aria-hidden className={cn('font-mono leading-none', className)}>
      {frames[index]}
    </span>
  );
}

export default Spinner;
