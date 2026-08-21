import type { ReactNode } from 'react';

const TONES = {
  guard: { fill: '#fdeb8a', stroke: '#c9a800', text: '#16203f' },
  refuse: { fill: '#f7d7d1', stroke: '#c07260', text: '#5a2018' },
  step: { fill: '#2f3f7b', stroke: '#16203f', text: '#ffffff' },
  edge: { fill: '#91abda', stroke: '#2f3f7b', text: '#16203f' },
  tool: { fill: '#eef2f9', stroke: '#5d6b8a', text: '#16203f' },
} as const;

export function Swatch({
  tone,
  children,
}: {
  tone: keyof typeof TONES;
  children: ReactNode;
}) {
  const { fill, stroke, text } = TONES[tone];

  return (
    <strong
      className="inline-block rounded border px-1.5 py-0.5 text-sm leading-none font-semibold"
      style={{ backgroundColor: fill, borderColor: stroke, color: text }}
    >
      {children}
    </strong>
  );
}
