const SWATCHES = [
  { name: 'Deep Navy', hex: '#2F3F7B', role: 'primary' },
  { name: 'Signal Yellow', hex: '#FBD813', role: 'accent' },
  { name: 'Light Blue', hex: '#91ABDA', role: 'ring' },
  { name: 'Ink Navy', hex: '#16203F', role: 'foreground' },
  { name: 'Night', hex: '#000518', role: 'dark base' },
] as const;

export function Palette() {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {SWATCHES.map(({ name, hex, role }) => (
        <div
          key={hex}
          className="border-fd-border group overflow-hidden rounded-lg border transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_-18px_rgba(22,32,63,0.65)] motion-reduce:transform-none motion-reduce:transition-none"
        >
          <div
            className="h-14 transition-[height] duration-300 ease-out group-hover:h-20 motion-reduce:transition-none"
            style={{ background: hex }}
          />
          <div className="p-2.5">
            <div className="text-[13px] font-medium">{name}</div>
            <div className="text-fd-muted-foreground font-mono text-[11px]">{hex}</div>
            <div className="text-fd-muted-foreground mt-0.5 text-[11px]">{role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
