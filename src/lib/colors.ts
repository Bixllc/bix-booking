const PALETTE = [
  'bg-amber-200 text-amber-900',
  'bg-indigo-200 text-indigo-900',
  'bg-rose-200 text-rose-900',
  'bg-sky-200 text-sky-900',
  'bg-emerald-200 text-emerald-900',
  'bg-purple-200 text-purple-900',
]

export function colorForId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}
