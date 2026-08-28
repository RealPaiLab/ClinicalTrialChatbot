import { CITATION_HREF_PREFIX, DEFINITION_HREF_PREFIX } from '@/constants/chat';

const TRIAL_REF_PATTERN = /CTC-[0-9A-HJ-NP-TV-Z]{8}/g;
const TRIAL_REF_BRACKET = /\[(CTC-[0-9A-HJ-NP-TV-Z]{8})\]/g;
// [[term||short definition]] — term holds no `||` or brackets; definition runs to `]]`.
const DEFINITION_PATTERN = /\[\[([^[\]|]+?)\|\|([\s\S]+?)\]\]/g;

export function extractTrialRefs(text: string): string[] {
  return [...new Set(text.match(TRIAL_REF_PATTERN) ?? [])];
}

export function linkifyCitations(text: string): string {
  return text.replace(TRIAL_REF_BRACKET, `[$1](${CITATION_HREF_PREFIX}$1)`);
}

// Rewrite inline term definitions into Markdown links carrying the definition in
export function linkifyDefinitions(text: string): string {
  return text.replace(DEFINITION_PATTERN, (_match, term: string, definition: string) => {
    const label = term.trim();
    const href = `${DEFINITION_HREF_PREFIX}${encodeURIComponent(definition.trim())}`;
    return `[${label}](${href})`;
  });
}
