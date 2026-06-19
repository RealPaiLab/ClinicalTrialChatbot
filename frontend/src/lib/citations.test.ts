import { describe, expect, it } from 'vitest';
import { extractNctNumbers, linkifyCitations, linkifyDefinitions } from './citations';
import { CITATION_HREF_PREFIX, DEFINITION_HREF_PREFIX } from '@/constants/chat';

describe('extractNctNumbers', () => {
  it('extracts bracketed and bare NCT numbers', () => {
    const text = 'See [NCT04267848] and also NCT03520491 for details.';
    expect(extractNctNumbers(text)).toEqual(['NCT04267848', 'NCT03520491']);
  });

  it('deduplicates repeated references and preserves first-seen order', () => {
    const text = '[NCT04267848] then [NCT03520491], and [NCT04267848] again.';
    expect(extractNctNumbers(text)).toEqual(['NCT04267848', 'NCT03520491']);
  });

  it('returns an empty array when there are no references', () => {
    expect(extractNctNumbers('No trials mentioned here.')).toEqual([]);
  });
});

describe('linkifyCitations', () => {
  it('turns bracketed NCT references into citation links', () => {
    expect(linkifyCitations('Try [NCT04267848] today.')).toBe(
      `Try [NCT04267848](${CITATION_HREF_PREFIX}NCT04267848) today.`
    );
  });
});

describe('linkifyDefinitions', () => {
  it('turns [[term||definition]] into a link carrying the encoded definition', () => {
    const definition = 'cancer that has spread to other parts of the body';
    expect(linkifyDefinitions(`It is [[metastatic||${definition}]] disease.`)).toBe(
      `It is [metastatic](${DEFINITION_HREF_PREFIX}${encodeURIComponent(definition)}) disease.`
    );
  });

  it('handles multiple definitions and trims surrounding whitespace', () => {
    const result = linkifyDefinitions(
      '[[ phase 1 study || an early trial ]] and [[ECOG||a fitness score]]'
    );
    expect(result).toBe(
      `[phase 1 study](${DEFINITION_HREF_PREFIX}${encodeURIComponent('an early trial')}) and ` +
        `[ECOG](${DEFINITION_HREF_PREFIX}${encodeURIComponent('a fitness score')})`
    );
  });

  it('leaves text without markup untouched', () => {
    expect(linkifyDefinitions('No definitions here.')).toBe('No definitions here.');
  });
});
