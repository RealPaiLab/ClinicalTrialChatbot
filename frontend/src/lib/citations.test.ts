import { describe, expect, it } from 'vitest';
import { extractTrialRefs, linkifyCitations, linkifyDefinitions } from './citations';
import { CITATION_HREF_PREFIX, DEFINITION_HREF_PREFIX } from '@/constants/chat';

describe('extractTrialRefs', () => {
  it('extracts bracketed and bare NCT numbers', () => {
    const text = 'See [CTC-4267848A] and also CTC-3520491B for details.';
    expect(extractTrialRefs(text)).toEqual(['CTC-4267848A', 'CTC-3520491B']);
  });

  it('deduplicates repeated references and preserves first-seen order', () => {
    const text = '[CTC-4267848A] then [CTC-3520491B], and [CTC-4267848A] again.';
    expect(extractTrialRefs(text)).toEqual(['CTC-4267848A', 'CTC-3520491B']);
  });

  it('returns an empty array when there are no references', () => {
    expect(extractTrialRefs('No trials mentioned here.')).toEqual([]);
  });
});

describe('linkifyCitations', () => {
  it('turns bracketed NCT references into citation links', () => {
    expect(linkifyCitations('Try [CTC-4267848A] today.')).toBe(
      `Try [CTC-4267848A](${CITATION_HREF_PREFIX}CTC-4267848A) today.`
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
