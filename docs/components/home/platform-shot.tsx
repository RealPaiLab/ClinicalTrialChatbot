'use client';

import { useState } from 'react';
import { siteUrl } from '@/lib/shared';

const SHOT = 'platform.png';

export function PlatformShot() {
  const [missing, setMissing] = useState(false);
  const host = siteUrl.replace(/^https?:\/\//, '');

  return (
    <figure className="overflow-hidden rounded-xl border-2 border-[#b9c7e2] bg-fd-card shadow-[0_24px_60px_-30px_rgba(22,32,63,0.55)] dark:border-[#1b264c]">
      <div className="border-fd-border flex items-center gap-3 border-b bg-[#ccd7ec] px-3 py-2.5 dark:bg-[#101b3c]">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#c0453a]" />
          <span className="size-2.5 rounded-full bg-[var(--color-signal)]" />
          <span className="size-2.5 rounded-full bg-[#3f9e74]" />
        </span>
        <span className="text-fd-muted-foreground rounded bg-white/70 px-3 py-0.5 font-mono text-[11px] dark:bg-black/30">
          {host}
        </span>
      </div>

      {missing ? (
        <div className="border-fd-border/70 text-fd-muted-foreground m-3 flex aspect-[16/10] flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-center">
          <span className="eyebrow">Screenshot</span>
          <span className="font-mono text-[11px]">docs/public/{SHOT}</span>
        </div>
      ) : (
        /* No fixed aspect ratio, so the frame takes the screenshot's own shape
           and shows all of it with no letterbox band. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/${SHOT}`}
          alt="The C3TMC platform: chat on the left, map and trial summary on the right."
          className="block h-auto w-full"
          onError={() => setMissing(true)}
        />
      )}
    </figure>
  );
}
