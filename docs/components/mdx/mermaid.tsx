'use client';

import { use, useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

/* The app palette, restated for Mermaid's theme variables so diagrams read as
   part of the product rather than as default Mermaid output. */
const light = {
  background: '#ffffff',
  primaryColor: '#e7edf8',
  primaryTextColor: '#16203f',
  primaryBorderColor: '#2f3f7b',
  secondaryColor: '#f7f9fc',
  tertiaryColor: '#eef2f9',
  lineColor: '#5d6b8a',
  textColor: '#16203f',
  noteBkgColor: '#fff8d0',
  noteTextColor: '#16203f',
  noteBorderColor: '#fbd813',
} as const;

const dark = {
  background: '#000518',
  primaryColor: '#101b3c',
  primaryTextColor: '#e6ecf8',
  primaryBorderColor: '#7e9ce6',
  secondaryColor: '#070d24',
  tertiaryColor: '#0b1330',
  lineColor: '#9fb0d2',
  textColor: '#e6ecf8',
  noteBkgColor: '#2a2506',
  noteTextColor: '#e6ecf8',
  noteBorderColor: '#fbd813',
} as const;

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));
  const isDark = resolvedTheme === 'dark';

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'var(--font-sans)',
    theme: 'base',
    flowchart: {
      nodeSpacing: 45,
      rankSpacing: 80,
      padding: 12,
      curve: 'basis',
    },
    themeVariables: {
      fontSize: '15px',
      ...(isDark ? dark : light),
    },
    themeCSS: `
      margin: 0 auto;
      .nodeLabel, .edgeLabel, .cluster-label { font-family: var(--font-sans); }
      .edgeLabel, .edgeLabel foreignObject div { background: transparent; }
      .edgeLabel p { margin: 0; padding: 2px 6px; border-radius: 4px; background: var(--color-fd-card); }
      .cluster rect { rx: 8; }
    `,
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () => mermaid.render(id, chart.replaceAll('\\n', '\n')))
  );

  return (
    <div
      className="not-prose bg-fd-card border-fd-border my-8 overflow-x-auto rounded-lg border p-4 [&>svg]:mx-auto xl:-mx-8"
      ref={(container) => {
        if (container) bindFunctions?.(container);
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
