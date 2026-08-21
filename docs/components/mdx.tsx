import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Backers } from '@/components/mdx/backers';
import { Mermaid } from '@/components/mdx/mermaid';
import { Palette } from '@/components/mdx/palette';
import { PanelMap } from '@/components/mdx/panel-map';
import { Shot } from '@/components/mdx/shot';
import { Swatch } from '@/components/mdx/swatch';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Backers,
    Mermaid,
    Palette,
    PanelMap,
    Shot,
    Swatch,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
