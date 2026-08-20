/** Short mark shown in the site header. */
export const appName = 'C3TMC';
/** The product's full name, as the application itself titles it. */
export const appTitle = 'Cancer Clinical Trial Navigator';
/** The assistant inside the platform. Shown in the hero. */
export const assistantName = 'Camille';
export const appTagline = 'AI clinical trial navigator';

/** Where "Try it out" goes. Internal deployment; replace with the real host. */
export const siteUrl = 'https://chat.gsoc.oicr.on.ca';

export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'RealPaiLab',
  repo: 'ClinicalTrialChatbot',
  branch: 'main',
};

export const projectFacts = {
  program: 'GSoC 2026',
  org: 'OICR',
  trials: '1,253',
  source: 'Cancer Trials Canada',
} as const;
