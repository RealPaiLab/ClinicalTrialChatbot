import { describe, expect, it } from 'vitest';
import { extractNctNumbers, linkifyCitations } from './citations';
import { CITATION_HREF_PREFIX } from '@/constants/chat';

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
