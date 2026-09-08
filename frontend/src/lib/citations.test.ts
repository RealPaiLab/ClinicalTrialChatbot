import { describe, expect, it } from 'vitest';
import {
  extractTrialRefs,
  linkifyCitations,
  linkifyContacts,
  linkifyDefinitions,
} from './citations';
import {
  CITATION_HREF_PREFIX,
  CONTACT_HREF_PREFIX,
  DEFINITION_HREF_PREFIX,
} from '@/constants/chat';

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

describe('linkifyContacts', () => {
  it('appends a contact link after a sentence citing a trial', () => {
    expect(linkifyContacts('Try [CTC-4267848A] today.')).toBe(
      `Try [CTC-4267848A] today. [contact](${CONTACT_HREF_PREFIX}CTC-4267848A)`
    );
  });

  it('gives each trial one link, on the first sentence citing it', () => {
    const result = linkifyContacts(
      'One is [CTC-4267848A] here. Another is [CTC-3520491B]! And [CTC-4267848A] again.'
    );
    expect(result).toBe(
      `One is [CTC-4267848A] here. [contact](${CONTACT_HREF_PREFIX}CTC-4267848A) ` +
        `Another is [CTC-3520491B]! [contact](${CONTACT_HREF_PREFIX}CTC-3520491B) ` +
        'And [CTC-4267848A] again.'
    );
  });

  it('turns a standalone [contact:REF] token into a link, with no title citation', () => {
    const result = linkifyContacts('You can reach the team here: [contact:CTC-4267848A]');
    expect(result).toBe(
      `You can reach the team here: [contact](${CONTACT_HREF_PREFIX}CTC-4267848A)`
    );
    expect(linkifyCitations(result)).toBe(result);
  });

  it('does not also append a derived link when the sentence carries an explicit token', () => {
    expect(linkifyContacts('Reach [CTC-4267848A] here: [contact:CTC-4267848A].')).toBe(
      `Reach [CTC-4267848A] here: [contact](${CONTACT_HREF_PREFIX}CTC-4267848A).`
    );
  });

  it('leaves sentences without a citation untouched', () => {
    expect(linkifyContacts('Nothing to cite here.')).toBe('Nothing to cite here.');
  });

  it('runs before linkifyCitations without disturbing it', () => {
    expect(linkifyCitations(linkifyContacts('See [CTC-4267848A].'))).toBe(
      `See [CTC-4267848A](${CITATION_HREF_PREFIX}CTC-4267848A). ` +
        `[contact](${CONTACT_HREF_PREFIX}CTC-4267848A)`
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
