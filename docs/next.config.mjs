import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// GitHub Pages serves a project site from /<repo>, so the base path is set at
// build time by the workflow and left empty for `pnpm dev`.
const basePath = process.env.DOCS_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  // The repository already has a root CLAUDE.md; do not generate a second one here.
  agentRules: false,
  basePath,
  trailingSlash: true,
  // The dev server otherwise refuses /_next/* requests whose Host is not
  // localhost, which breaks previewing through a tunnel. Dev only; the
  // exported site is static and has no such check.
  allowedDevOrigins: ['*.trycloudflare.com', '*.cfargotunnel.com', '*.ngrok-free.app'],
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default withMDX(config);
