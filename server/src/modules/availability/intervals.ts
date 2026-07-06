export interface Interval {
  start: number // epoch ms
  end: number // epoch ms
}

/** Merges overlapping/adjacent intervals in a single list. */
function normalize(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].filter((i) => i.end > i.start).sort((a, b) => a.start - b.start)
  const out: Interval[] = []
  for (const i of sorted) {
    const last = out[out.length - 1]
    if (last && i.start <= last.end) {
      last.end = Math.max(last.end, i.end)
    } else {
      out.push({ ...i })
    }
  }
  return out
}

/** Set intersection of two interval lists. */
export function intersectIntervals(a: Interval[], b: Interval[]): Interval[] {
  const A = normalize(a)
  const B = normalize(b)
  const out: Interval[] = []
  let i = 0
  let j = 0
  while (i < A.length && j < B.length) {
    const start = Math.max(A[i].start, B[j].start)
    const end = Math.min(A[i].end, B[j].end)
    if (start < end) out.push({ start, end })
    if (A[i].end < B[j].end) i++
    else j++
  }
  return out
}

/** Set subtraction: base minus every interval in `remove`. */
export function subtractIntervals(base: Interval[], remove: Interval[]): Interval[] {
  const R = normalize(remove)
  let result = normalize(base)
  for (const r of R) {
    const next: Interval[] = []
    for (const b of result) {
      if (r.end <= b.start || r.start >= b.end) {
        next.push(b)
        continue
      }
      if (r.start > b.start) next.push({ start: b.start, end: Math.min(r.start, b.end) })
      if (r.end < b.end) next.push({ start: Math.max(r.end, b.start), end: b.end })
    }
    result = next
  }
  return result
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end
}
