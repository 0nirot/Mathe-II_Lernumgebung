/**
 * Seedable PRNG & combinatorics helpers for deterministic Vitest property tests
 * and diverse random practice tasks.
 */

export interface Rng {
  next(): number; // [0, 1)
  int(min: number, max: number): number; // inclusive
  pick<T>(arr: readonly T[]): T;
  sign(): -1 | 1;
  shuffle<T>(arr: readonly T[]): T[];
}

export function createRng(seed?: number): Rng {
  let state = (seed ?? Math.floor(Math.random() * 2 ** 31)) >>> 0;
  if (state === 0) state = 0x6d2b79f5;

  function next(): number {
    // Mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    int(min: number, max: number) {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(next() * arr.length)];
    },
    sign() {
      return next() < 0.5 ? -1 : 1;
    },
    shuffle<T>(arr: readonly T[]): T[] {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}

let taskCounter = 0;
export function nextTaskId(prefix: string): string {
  taskCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${taskCounter}`;
}
