import {
  CITATION_HREF_PREFIX,
  CONTACT_HREF_PREFIX,
  DEFINITION_HREF_PREFIX,
} from '@/constants/chat';

const TRIAL_REF_PATTERN = /CTC-[0-9A-HJ-NP-TV-Z]{8}/g;
const TRIAL_REF_BRACKET = /\[(CTC-[0-9A-HJ-NP-TV-Z]{8})\]/g;
// A sentence (no terminator or newline inside) that cites at least one trial.
const CITING_SENTENCE = /[^.!?\n]*\[CTC-[0-9A-HJ-NP-TV-Z]{8}\][^.!?\n]*[.!?]/g;
// [contact:CTC-…] — the agent asking for the contact pill on its own, with no
// trial citation attached. Distinct from [CTC-…], so it never renders a title.
const CONTACT_TOKEN = /\[contact:(CTC-[0-9A-HJ-NP-TV-Z]{8})\]/g;
// [[term||short definition]] — term holds no `||` or brackets; definition runs to `]]`.
const DEFINITION_PATTERN = /\[\[([^[\]|]+?)\|\|([\s\S]+?)\]\]/g;

export function extractTrialRefs(text: string): string[] {
  return [...new Set(text.match(TRIAL_REF_PATTERN) ?? [])];
}

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

// Rewrite inline term definitions into Markdown links carrying the definition in
export function linkifyDefinitions(text: string): string {
  return text.replace(DEFINITION_PATTERN, (_match, term: string, definition: string) => {
    const label = term.trim();
    const href = `${DEFINITION_HREF_PREFIX}${encodeURIComponent(definition.trim())}`;
    return `[${label}](${href})`;
  });
}
