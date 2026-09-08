import { describe, expect, it } from 'vitest';
import { parseTextBlocks } from './textBlocks';

describe('parseTextBlocks', () => {
  it('returns nothing for empty input', () => {
    expect(parseTextBlocks(null)).toEqual([]);
    expect(parseTextBlocks('')).toEqual([]);
  });

  it('splits paragraphs from bullets and drops blank lines', () => {
    const blocks = parseTextBlocks('Inclusion Criteria\n\n* Adults 18+\n- Measurable disease');

    expect(blocks).toEqual([
      { type: 'paragraph', text: 'Inclusion Criteria' },
      { type: 'bullet', text: 'Adults 18+' },
      { type: 'bullet', text: 'Measurable disease' },
    ]);
  });

  it('unescapes the brackets the trial feed ships', () => {
    expect(parseTextBlocks("* disease \\[described as 'metastatic'\\]")).toEqual([
      { type: 'bullet', text: "disease [described as 'metastatic']" },
    ]);
  });
});
