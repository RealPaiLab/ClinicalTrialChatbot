import { Plus } from 'lucide-react';

// Scattered marks. Amber is the "active" trial status and navy/blue is "recruiting",
// so the confetti is built from the same tokens the map pins use.
const DOTS = [
  { top: '16%', left: '44%', tone: 'bg-primary/70', size: 'size-2', glow: '' },
  {
    top: '24%',
    left: '30%',
    tone: 'bg-amber',
    size: 'size-1.5',
    glow: 'shadow-[0_0_10px_3px] shadow-amber/60',
  },
  {
    top: '30%',
    left: '62%',
    tone: 'bg-amber',
    size: 'size-1',
    glow: 'shadow-[0_0_8px_2px] shadow-amber/50',
  },
  { top: '62%', left: '78%', tone: 'bg-primary/80', size: 'size-2.5', glow: '' },
  {
    top: '70%',
    left: '18%',
    tone: 'bg-amber',
    size: 'size-1',
    glow: 'shadow-[0_0_8px_2px] shadow-amber/50',
  },
  {
    top: '46%',
    left: '88%',
    tone: 'bg-amber',
    size: 'size-1.5',
    glow: 'shadow-[0_0_9px_2px] shadow-amber/50',
  },
] as const;

function ConsentArtwork() {
  return (
    <div className="bg-secondary relative isolate hidden overflow-hidden sm:flex sm:flex-col sm:justify-center">
      {/* Warm top-left to cool bottom-right, the panel's whole mood in one wash. */}
      <div
        aria-hidden
        className="from-amber/30 to-primary/45 absolute inset-0 bg-gradient-to-br via-transparent"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Ring outlines: concentric at the cool corner, one arc catching the warm one. */}
        <div className="border-foreground/10 absolute -top-10 left-4 size-40 rounded-full border" />
        <div className="border-primary/20 absolute -right-16 -bottom-20 size-72 rounded-full border" />
        <div className="border-primary/15 absolute -right-4 -bottom-8 size-52 rounded-full border" />

        {/* Dot grid + plus marks, the quiet "map graticule" texture. */}
        <div className="absolute top-12 right-6 h-14 w-20 [background-image:radial-gradient(circle,var(--primary)_1.2px,transparent_1.2px)] [background-size:13px_13px] opacity-30" />
        <Plus className="text-primary/40 absolute top-[9%] right-[12%] size-3" />
        <Plus className="text-primary/30 absolute bottom-[8%] left-[14%] size-3" />

        {DOTS.map((dot) => (
          <span
            key={`${dot.top}-${dot.left}`}
            style={{ top: dot.top, left: dot.left }}
            className={`${dot.tone} ${dot.size} ${dot.glow} absolute rounded-full`}
          />
        ))}
      </div>

      <div className="relative translate-y-8 px-8">
        <p className="text-foreground font-display text-[clamp(2.75rem,5.5vw,4rem)] leading-none font-extrabold tracking-[-0.045em]">
          C3TMC
        </p>
        <p className="text-foreground/70 mt-5 text-base leading-snug">
          Canadian Cancer Clinical Trials
          <br />
          Map and Chatbot
        </p>
        <div aria-hidden className="bg-foreground/25 mt-8 h-px w-14" />
        <p className="text-eyebrow text-primary bg-primary/10 mt-6 inline-block rounded-full px-4 py-1.5 font-bold">
          Alpha
        </p>
      </div>
    </div>
  );
}

export default ConsentArtwork;
