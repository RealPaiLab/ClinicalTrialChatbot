const REGIONS = [
  {
    index: '01',
    name: 'Chat panel',
    role: 'The conversation, and every citation in it',
    href: '#chat-panel',
    area: 'chat',
  },
  {
    index: '02',
    name: 'Map panel',
    role: 'Every site of every trial in the answer',
    href: '#map-panel',
    area: 'map',
  },
  {
    index: '03',
    name: 'Summary panel',
    role: 'One selected trial, in full',
    href: '#summary-panel',
    area: 'summary',
  },
] as const;

const AREA_CLASS = {
  chat: 'row-span-2',
  map: '',
  summary: '',
} as const;

export function PanelMap() {
  return (
    <figure className="not-prose border-fd-border bg-fd-card my-8 rounded-xl border p-3 sm:p-4">
      <div className="border-fd-border text-fd-muted-foreground mb-3 flex h-8 items-center justify-between rounded-lg border border-dashed px-3 text-[11px] tracking-[0.14em] uppercase">
        <span>App header</span>
        <span>Guided tour · theme</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[37fr_63fr] sm:grid-rows-[2fr_1fr]">
        {REGIONS.map((region) => (
          <a
            key={region.index}
            href={region.href}
            className={`${AREA_CLASS[region.area]} border-fd-border bg-fd-background hover:border-fd-primary group flex min-h-28 flex-col justify-between rounded-lg border p-4 no-underline transition-colors sm:min-h-36`}
          >
            <span className="text-signal font-mono text-xs font-semibold">{region.index}</span>
            <span>
              <span className="text-fd-foreground group-hover:text-fd-primary block font-semibold">
                {region.name}
              </span>
              <span className="text-fd-muted-foreground block text-sm">{region.role}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="border-fd-border text-fd-muted-foreground mt-3 flex h-8 items-center rounded-lg border border-dashed px-3 text-[11px] tracking-[0.14em] uppercase">
        App footer
      </div>

      <figcaption className="border-signal text-fd-muted-foreground mt-4 border-l-2 pl-3 text-sm">
        One screen, three panels, each one resizable by dragging the divider between them.
      </figcaption>
    </figure>
  );
}
