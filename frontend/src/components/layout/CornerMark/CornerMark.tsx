import { cn } from '@/lib/utils';

interface CornerMarkProps {
  className: string;
}

/** Hand-drawn corner mark hugging a top-right edge: two strokes that cross in a small square. */
function CornerMark({ className }: CornerMarkProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 240"
      fill="none"
      strokeLinecap="round"
      className={cn('pointer-events-none absolute -z-10 size-[240px]', className)}
    >
      <path d="M8 11C70 10 150 9 236 7" className="stroke-highlight/70" strokeWidth="1.4" />
      <path d="M70 18C120 17 170 16 232 15" className="stroke-highlight/40" strokeWidth="1" />
      <path d="M229 4C230 70 231 150 233 236" className="stroke-highlight/70" strokeWidth="1.4" />
      <path d="M222 40C223 100 224 160 226 226" className="stroke-highlight/40" strokeWidth="1" />
      <path
        d="M216 3C222 2 229 1 238 0C238 7 237 13 239 21L220 23C219 16 219 9 216 3Z"
        className="fill-highlight/20 stroke-highlight/70"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default CornerMark;
