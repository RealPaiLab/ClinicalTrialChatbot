'use client';

import { useState } from 'react';

const BACKERS = [
  { file: 'open-genome.webp', name: 'Open Genome Informatics' },
  { file: 'oicr.webp', name: 'Ontario Institute for Cancer Research' },
  { file: 'gsoc.webp', name: 'Google Summer of Code' },
];

export function Backers() {
  return (
    <div className="not-prose border-fd-border my-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 rounded-xl border border-dashed px-6 py-8">
      {BACKERS.map((backer) => (
        <Logo key={backer.file} {...backer} />
      ))}
    </div>
  );
}

function Logo({ file, name }: { file: string; name: string }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span className="text-fd-muted-foreground flex flex-col items-center gap-1 text-center">
        <span className="font-display text-sm font-semibold">{name}</span>
        <span className="font-mono text-[10px]">docs/public/logos/{file}</span>
      </span>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logos/${file}`}
      alt={name}
      className="max-h-30 w-auto max-w-[360px] object-contain"
      onError={() => setMissing(true)}
    />
  );
}
