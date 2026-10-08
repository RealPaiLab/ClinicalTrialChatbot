import { AGENT_NAME } from '@/constants/chat';

// Rays of the OICR-style sunburst: angle in degrees, length as a share of the panel, tone token.
const RAYS = [
  { angle: -4, length: 'h-36', tone: 'bg-highlight/70' },
  { angle: -18, length: 'h-24', tone: 'bg-foreground/10' },
  { angle: -32, length: 'h-40', tone: 'bg-active/80' },
  { angle: -46, length: 'h-28', tone: 'bg-foreground/8' },
  { angle: -60, length: 'h-36', tone: 'bg-highlight/50' },
  { angle: -74, length: 'h-24', tone: 'bg-foreground/10' },
  { angle: -88, length: 'h-32', tone: 'bg-active/55' },
] as const;

function ConsentArtwork() {
  return (
    <div className="bg-secondary text-foreground relative isolate overflow-hidden sm:flex sm:flex-col sm:justify-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
        {RAYS.map((ray) => (
          <span
            key={ray.angle}
            style={{ transform: `rotate(${ray.angle}deg)` }}
            className={`${ray.tone} ${ray.length} absolute -right-4 -bottom-4 w-4 origin-bottom`}
          />
        ))}
        <div className="bg-secondary absolute -right-12 -bottom-12 size-28 rounded-full" />
        <div className="border-foreground/10 absolute -right-12 -bottom-12 size-28 rounded-full border-[10px]" />
      </div>

      <div className="relative px-6 py-6 sm:-translate-y-4 sm:px-8 sm:py-0">
        <p className="text-muted-foreground hidden text-sm font-semibold sm:block">Introducing</p>
        <p className="font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-none font-extrabold tracking-[-0.03em] uppercase sm:mt-2">
          {AGENT_NAME}
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-snug font-semibold sm:mt-4 sm:text-base">
          The Cancer Trial Chatbot
        </p>
        <p className="text-eyebrow bg-foreground/8 mt-4 inline-block rounded-full px-3 py-1 font-bold sm:mt-6 sm:px-4 sm:py-1.5">
          Pre-Release Version
        </p>
        <p className="text-muted-foreground mt-6 hidden max-w-[16rem] text-[11px] leading-relaxed sm:block">
          A project from the Ontario Institute for Cancer Research.
        </p>
      </div>

      <div aria-hidden className="bg-highlight absolute inset-x-0 bottom-0 h-1" />
    </div>
  );
}

export default ConsentArtwork;
