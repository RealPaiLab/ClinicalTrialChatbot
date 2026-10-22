import { cn } from '@/lib/utils';

const ARCS = [
  { d: 'M30.64 25.71 A40 40 0 0 1 -11.70 38.25', className: 'stroke-highlight', delay: '0ms' },
  { d: 'M-15.63 36.82 A40 40 0 0 1 -39.95 2.09', className: 'stroke-current', delay: '120ms' },
  { d: 'M-39.95 -2.09 A40 40 0 0 1 -15.63 -36.82', className: 'stroke-highlight', delay: '240ms' },
  { d: 'M-11.70 -38.25 A40 40 0 0 1 30.64 -25.71', className: 'stroke-current', delay: '360ms' },
] as const;

const PIN = 'M38 -32 C33 -38 27 -42 27 -48 A11 11 0 1 1 49 -48 C49 -42 43 -38 38 -32 Z';

interface CamilleIconProps {
  className?: string;
}

/** Four-phase Camille mark; ink follows `currentColor` and it animates when a parent `group` is hovered. */
function CamilleIcon({ className }: CamilleIconProps) {
  return (
    <svg aria-hidden viewBox="0 0 123 123" className={cn('w-auto shrink-0', className)}>
      <g transform="translate(60.5 72)">
        {ARCS.map((arc) => (
          <path
            key={arc.d}
            d={arc.d}
            fill="none"
            strokeWidth={14}
            className={cn(arc.className, 'motion-safe:group-hover:animate-camille-lit')}
            style={{ animationDelay: arc.delay }}
          />
        ))}
        <g className="motion-safe:group-hover:animate-camille-hop origin-bottom [transform-box:fill-box]">
          <path d={PIN} className="fill-highlight" />
          <circle cx={38} cy={-48} r={4} className="fill-header" />
        </g>
      </g>
    </svg>
  );
}

export default CamilleIcon;
