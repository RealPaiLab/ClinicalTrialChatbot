import { CITATION_HREF_PREFIX } from '@/constants/chat';

const NCT_PATTERN = /NCT\d{8}/g;
const NCT_BRACKET = /\[(NCT\d{8})\]/g;

export function extractNctNumbers(text: string): string[] {
  return [...new Set(text.match(NCT_PATTERN) ?? [])];
}

export function linkifyCitations(text: string): string {
  return text.replace(NCT_BRACKET, `[$1](${CITATION_HREF_PREFIX}$1)`);
}
