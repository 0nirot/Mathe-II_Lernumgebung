import { describe, expect, it } from 'vitest';
import {
  computeNextSrsState,
  createInitialSrsState,
  formatIntervalLabel,
  isCardDue,
} from '../srs';

describe('SM-2 Spaced Repetition', () => {
  const T0 = 1_700_000_000_000;
  const DAY = 24 * 60 * 60 * 1000;

  it('progresses intervals 1d -> 6d -> round(6 * EF) on rating Gut (4)', () => {
    let s = createInitialSrsState('c1', T0);
    expect(isCardDue(s, T0)).toBe(true);

    s = computeNextSrsState(s, 4, T0);
    expect(s.repetitions).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.easeFactor).toBe(2.5);
    expect(s.nextReviewAt).toBe(T0 + 1 * DAY);
    expect(isCardDue(s, T0 + 1000)).toBe(false);
    expect(isCardDue(s, T0 + DAY)).toBe(true);

    s = computeNextSrsState(s, 4, T0 + DAY);
    expect(s.repetitions).toBe(2);
    expect(s.intervalDays).toBe(6);

    s = computeNextSrsState(s, 4, T0 + 7 * DAY);
    expect(s.repetitions).toBe(3);
    expect(s.intervalDays).toBe(15); // round(6 * 2.5)
  });

  it('resets repetitions and counts lapse on rating Nochmal (0)', () => {
    let s = createInitialSrsState('c2', T0);
    s = computeNextSrsState(s, 4, T0);
    s = computeNextSrsState(s, 4, T0 + DAY);
    expect(s.repetitions).toBe(2);

    s = computeNextSrsState(s, 0, T0 + 7 * DAY);
    expect(s.repetitions).toBe(0);
    expect(s.intervalDays).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.easeFactor).toBe(2.3);
    expect(s.nextReviewAt).toBe(T0 + 7 * DAY + 10 * 60 * 1000);
  });

  it('never drops easeFactor below 1.3 even after repeated lapses', () => {
    let s = createInitialSrsState('c3', T0);
    for (let i = 0; i < 20; i++) {
      s = computeNextSrsState(s, 0, T0 + i * 1000);
    }
    expect(s.easeFactor).toBe(1.3);
  });

  it('accelerates interval and raises easeFactor on Leicht (5)', () => {
    let s = createInitialSrsState('c4', T0);
    s = computeNextSrsState(s, 5, T0);
    expect(s.intervalDays).toBe(4);
    expect(s.easeFactor).toBe(2.65);
    expect(formatIntervalLabel(s.intervalDays)).toBe('4 Tage');
    expect(formatIntervalLabel(0)).toBe('10 Min.');
    expect(formatIntervalLabel(1)).toBe('1 Tag');
  });
});
