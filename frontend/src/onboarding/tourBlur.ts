const STAGE_PADDING = 6;

export interface TourBlur {
  update: (rect: DOMRect | null) => void;
  destroy: () => void;
}

export function createTourBlur(): TourBlur {
  const host = document.createElement('div');
  host.className = 'ctc-tour-blur';
  const panel = document.createElement('div');
  panel.className = 'ctc-tour-blur-panel';
  host.appendChild(panel);
  const ring = document.createElement('div');
  ring.className = 'ctc-tour-blur-ring';
  host.appendChild(ring);
  document.body.appendChild(host);

  const update = (rect: DOMRect | null) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Hole rectangle (collapsed to a point when there is no target).
    const left = rect ? Math.round(Math.max(0, rect.left - STAGE_PADDING)) : 0;
    const top = rect ? Math.round(Math.max(0, rect.top - STAGE_PADDING)) : 0;
    const right = rect ? Math.round(Math.min(vw, rect.right + STAGE_PADDING)) : 0;
    const bottom = rect ? Math.round(Math.min(vh, rect.bottom + STAGE_PADDING)) : 0;

    panel.style.clipPath = `polygon(0px 0px, 0px ${vh}px, ${left}px ${vh}px, ${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px, ${left}px ${vh}px, ${vw}px ${vh}px, ${vw}px 0px)`;

    if (!rect) {
      ring.style.opacity = '0';
      return;
    }
    ring.style.opacity = '1';
    ring.style.top = `${top}px`;
    ring.style.left = `${left}px`;
    ring.style.width = `${right - left}px`;
    ring.style.height = `${bottom - top}px`;
  };

  const destroy = () => {
    // Fade the whole backdrop out before removing it.
    host.style.opacity = '0';
    window.setTimeout(() => host.remove(), 300);
  };

  return { update, destroy };
}
