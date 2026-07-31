export type TextBlock = { type: 'paragraph' | 'bullet'; text: string };

const BULLET_PATTERN = /^\s*[*-]\s+/;

/** Unescape the backslash-escaped brackets the trial feed ships. */
function clean(line: string): string {
  return line.replace(/\\([[\]])/g, '$1').trim();
}

/**
 * Trial criteria arrive as light markdown: `*` bullets separated by blank
 * lines. The PDF renderer has no markdown support, so flatten to blocks.
 */
export function parseTextBlocks(text: string | null): TextBlock[] {
  if (!text) return [];

  return text
    .split('\n')
    .map((line) => {
      const isBullet = BULLET_PATTERN.test(line);
      return {
        type: isBullet ? ('bullet' as const) : ('paragraph' as const),
        text: clean(isBullet ? line.replace(BULLET_PATTERN, '') : line),
      };
    })
    .filter((block) => block.text.length > 0);
}
