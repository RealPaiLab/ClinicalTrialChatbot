const NCT_PATTERN = /NCT\d{8}/g;

export function extractNctNumbers(text: string): string[] {
  return [...new Set(text.match(NCT_PATTERN) ?? [])];
}
