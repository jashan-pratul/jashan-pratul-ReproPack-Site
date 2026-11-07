/**
 * Bounded session buffer. When capacity is exceeded the oldest events are
 * evicted first (FIFO), mirroring ReproPack's automatic retention limit.
 */

export interface BoundedPushResult<T> {
  items: T[];
  evicted: number;
}

export function pushBounded<T>(items: readonly T[], incoming: readonly T[], capacity: number): BoundedPushResult<T> {
  if (!Number.isFinite(capacity) || capacity <= 0) {
    return { items: [], evicted: items.length + incoming.length };
  }
  const total = items.length + incoming.length;
  if (total <= capacity) return { items: [...items, ...incoming], evicted: 0 };
  const evicted = total - capacity;
  const merged = [...items, ...incoming];
  return { items: merged.slice(evicted), evicted };
}

export type BufferLevel = "ok" | "high" | "full";

export function bufferLevel(size: number, capacity: number): BufferLevel {
  if (size >= capacity) return "full";
  if (size / capacity >= 0.8) return "high";
  return "ok";
}
