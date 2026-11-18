/** Resolves after the next paint, once a React commit has been laid out and its transitions have started. */
export function afterPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Resolves once the finite animations and transitions under `root` finish; at once when none run, as with reduced motion. */
export async function animationsSettled(root: Element | Document = document): Promise<void> {
  await afterPaint();
  const animations =
    root instanceof Document ? root.getAnimations() : root.getAnimations({ subtree: true });
  const finite = animations.filter(
    (animation) => animation.effect?.getTiming().iterations !== Infinity
  );
  await Promise.allSettled(finite.map((animation) => animation.finished));
}
