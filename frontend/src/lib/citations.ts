import {
  CITATION_HREF_PREFIX,
  CONTACT_HREF_PREFIX,
  DEFINITION_HREF_PREFIX,
} from '@/constants/chat';

// One prefix per source (mirrors backend schemas/trial_ref.py REF_PREFIXES).
const TRIAL_REF = '(?:CTC|ULC)-[0-9A-HJ-NP-TV-Z]{8}';
const TRIAL_REF_PATTERN = new RegExp(TRIAL_REF, 'g');
const TRIAL_REF_BRACKET = new RegExp(`\\[(${TRIAL_REF})\\]`, 'g');
// A sentence (no terminator or newline inside) that cites at least one trial.
const CITING_SENTENCE = new RegExp(`[^.!?\\n]*\\[${TRIAL_REF}\\][^.!?\\n]*[.!?]`, 'g');
// [contact:CTC-…]: the agent asking for the contact pill alone, so it never renders a title.
const CONTACT_TOKEN = new RegExp(`\\[contact:(${TRIAL_REF})\\]`, 'g');
// [[term||short definition]]: term holds no `||` or brackets; definition runs to `]]`.
const DEFINITION_PATTERN = /\[\[([^[\]|]+?)\|\|([\s\S]+?)\]\]/g;

export function linkifyCitations(text: string): string {
  return text.replace(TRIAL_REF_BRACKET, `[$1](${CITATION_HREF_PREFIX}$1)`);
}

export function linkifyContacts(text: string): string {
  const seen = new Set<string>();
  const link = (ref: string) => `[contact](${CONTACT_HREF_PREFIX}${ref})`;
  const explicit = text.replace(CONTACT_TOKEN, (_match, ref: string) => {
    seen.add(ref);
    return link(ref);
  });
  return explicit.replace(CITING_SENTENCE, (sentence) => {
    const ref = sentence.match(TRIAL_REF_PATTERN)?.[0];
    if (!ref || seen.has(ref)) return sentence;
    seen.add(ref);
    return `${sentence} ${link(ref)}`;
  });
}

/** Rewrites [[term||definition]] into a Markdown link whose href carries the definition. */
export function linkifyDefinitions(text: string): string {
  return text.replace(DEFINITION_PATTERN, (_match, term: string, definition: string) => {
    const label = term.trim();
    const href = `${DEFINITION_HREF_PREFIX}${encodeURIComponent(definition.trim())}`;
    return `[${label}](${href})`;
  });
}

/** Turns an agent reply's tokens into links; contacts go first, before citations consume the brackets they key on. */
export function linkifyMessage(text: string): string {
  return linkifyDefinitions(linkifyCitations(linkifyContacts(text)));
}
