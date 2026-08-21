/* A repeating tile rather than one stretched path: a single path scaled to the
   viewport width smears the stroke to an uneven weight on wide screens. */
const TILE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='28' viewBox='0 0 56 28'><path d='M0 21 L14 7 L28 21 L42 7 L56 21' fill='none' stroke='%23FBD813' stroke-width='3.5' stroke-linejoin='miter' stroke-linecap='square'/></svg>";

export function ZigzagSeam({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        height: 28,
        backgroundImage: `url("${TILE}")`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
      }}
    />
  );
}
