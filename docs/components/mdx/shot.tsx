'use client';

import { useState } from 'react';

export function Shot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [missing, setMissing] = useState(false);
  const path = src.replace(/^\//, '');

  return (
    <figure className="not-prose my-8">
      <div className="border-fd-border bg-fd-card overflow-hidden rounded-xl border shadow-[0_18px_45px_-30px_rgba(22,32,63,0.5)]">
        {missing ? (
          <div className="text-fd-muted-foreground flex aspect-[16/9] flex-col items-center justify-center gap-2 text-center">
            <span className="eyebrow">Screenshot</span>
            <span className="font-mono text-[11px]">docs/public/{path}</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/${path}`}
            alt={alt}
            className="block h-auto w-full"
            onError={() => setMissing(true)}
          />
        )}
      </div>
      {caption ? (
        <figcaption className="text-fd-muted-foreground mt-3 border-l-2 border-[var(--color-signal)] pl-3 text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
