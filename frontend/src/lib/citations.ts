import { CITATION_HREF_PREFIX, DEFINITION_HREF_PREFIX } from '@/constants/chat';

const NCT_PATTERN = /NCT\d{8}/g;
const NCT_BRACKET = /\[(NCT\d{8})\]/g;
// [[term||short definition]] — term holds no `||` or brackets; definition runs to `]]`.
const DEFINITION_PATTERN = /\[\[([^[\]|]+?)\|\|([\s\S]+?)\]\]/g;

export function extractNctNumbers(text: string): string[] {
  return [...new Set(text.match(NCT_PATTERN) ?? [])];
}

export function linkifyCitations(text: string): string {
  return text.replace(NCT_BRACKET, `[$1](${CITATION_HREF_PREFIX}$1)`);
}

// Rewrite inline term definitions into Markdown links carrying the definition in
export function linkifyDefinitions(text: string): string {
  return text.replace(DEFINITION_PATTERN, (_match, term: string, definition: string) => {
    const label = term.trim();
    const href = `${DEFINITION_HREF_PREFIX}${encodeURIComponent(definition.trim())}`;
    return `[${label}](${href})`;
  });
}
