/* The map legend flattened into a rule: the four site statuses, weighted by how
   common each one is. */
const STATUSES = [
  { key: 'recruiting', className: 'bg-[var(--color-navy)] grow-[5]' },
  { key: 'active', className: 'bg-[var(--color-signal)] grow-[2]' },
  { key: 'completed', className: 'bg-[#8295bb] grow-[1]' },
  { key: 'closed', className: 'bg-[#c0453a] grow-[1]' },
];

export function StatusRule() {
  return (
    <div aria-hidden className="flex h-[3px] w-full overflow-hidden rounded-full">
      {STATUSES.map((status) => (
        <span key={status.key} className={status.className} />
      ))}
    </div>
  );
}
