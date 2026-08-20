import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Backers } from '@/components/mdx/backers';
import { Mermaid } from '@/components/mdx/mermaid';
import { Shot } from '@/components/mdx/shot';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Backers,
    Mermaid,
    Shot,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
