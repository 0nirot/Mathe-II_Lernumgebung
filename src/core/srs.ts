export type SrsRating = 0 | 3 | 4 | 5; // 0 = Nochmal, 3 = Schwer, 4 = Gut, 5 = Leicht

export interface SrsState {
  cardId: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: number; // timestamp ms
  lastReviewedAt: number;
  lapses: number;
  /** Optional metadata for dynamically generated weakness cards */
  generatorId?: string;
  customLabel?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const TEN_MIN_MS = 10 * 60 * 1000;

export function createInitialSrsState(
  cardId: string,
  nowMs = Date.now(),
  extra?: { generatorId?: string; customLabel?: string }
): SrsState {
  return {
    cardId,
    repetitions: 0,
    intervalDays: 0,
    easeFactor: 2.5,
    nextReviewAt: nowMs,
    lastReviewedAt: 0,
    lapses: 0,
    ...extra,
  };
}

/**
 * SM-2 Spaced Repetition update tailored for exam prep:
 * - 0 (Nochmal): reset repetitions to 0, due again in 10 min, EF - 0.2 (min 1.3)
 * - 3 (Schwer):  short interval, EF - 0.15 (min 1.3)
 * - 4 (Gut):     standard SM-2 (1d -> 6d -> interval * EF)
 * - 5 (Leicht):  accelerated interval, EF + 0.15
 */
export function computeNextSrsState(
  prev: SrsState,
  rating: SrsRating,
  nowMs = Date.now()
): SrsState {
  let { repetitions, intervalDays, easeFactor, lapses } = prev;

  if (rating === 0) {
    repetitions = 0;
    intervalDays = 0;
    lapses += 1;
    easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
    return {
      ...prev,
      repetitions,
      intervalDays,
      easeFactor,
      lapses,
      lastReviewedAt: nowMs,
      nextReviewAt: nowMs + TEN_MIN_MS,
    };
  }

  if (rating === 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * 1.2));
    }
    repetitions += 1;
    easeFactor = Math.max(1.3, Number((easeFactor - 0.15).toFixed(2)));
  } else if (rating === 4) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * easeFactor));
    }
    repetitions += 1;
  } else {
    // rating === 5 (Leicht)
    if (repetitions === 0) {
      intervalDays = 4;
    } else if (repetitions === 1) {
      intervalDays = 8;
    } else {
      intervalDays = Math.max(intervalDays + 2, Math.round(intervalDays * easeFactor * 1.3));
    }
    repetitions += 1;
    easeFactor = Number((easeFactor + 0.15).toFixed(2));
  }

  return {
    ...prev,
    repetitions,
    intervalDays,
    easeFactor,
    lapses,
    lastReviewedAt: nowMs,
    nextReviewAt: nowMs + intervalDays * DAY_MS,
  };
}

export function isCardDue(state: SrsState | undefined, nowMs = Date.now()): boolean {
  if (!state) return true; // unseen card is ready to learn
  return state.nextReviewAt <= nowMs;
}

export function formatIntervalLabel(days: number): string {
  if (days <= 0) return '10 Min.';
  if (days === 1) return '1 Tag';
  return `${days} Tage`;
}
