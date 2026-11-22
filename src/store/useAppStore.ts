import { create } from 'zustand';
import {
  computeNextSrsState,
  createInitialSrsState,
  type SrsRating,
  type SrsState,
} from '../core/srs';
import type { LessonStatus, ModuleId } from '../types/learning';
import {
  db,
  type DiagnosticResultRow,
  type ExamHistoryRow,
  type LessonProgressRow,
  type SkillStatRow,
} from './db';

export type ActiveRoute =
  | { view: 'dashboard' }
  | { view: 'diagnostic-m0' }
  | { view: 'module'; moduleId: ModuleId }
  | { view: 'lesson'; lessonId: string }
  | { view: 'drills' }
  | { view: 'srs' }
  | { view: 'exam' }
  | { view: 'formula-sheet' };

interface AppState {
  hydrated: boolean;
  theme: 'light' | 'dark';
  route: ActiveRoute;
  lessonProgress: Record<string, LessonProgressRow>;
  skillStats: Record<string, SkillStatRow>;
  diagnosticResults: Record<string, DiagnosticResultRow>;
  formulaCopied: Record<string, boolean>;
  srsQueue: Record<string, SrsState>;
  examHistory: ExamHistoryRow[];

  hydrate: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  toggleTheme: () => Promise<void>;
  navigate: (route: ActiveRoute) => void;
  updateLessonProgress: (lessonId: string, status: LessonStatus, currentPhase: number) => Promise<void>;
  recordSkillAttempt: (generatorId: string, isCorrect: boolean, errorType?: string) => Promise<void>;
  saveDiagnosticResults: (rows: DiagnosticResultRow[]) => Promise<void>;
  toggleFormulaCopied: (formulaId: string) => Promise<void>;
  reviewSrsCard: (
    cardId: string,
    rating: SrsRating,
    extra?: { generatorId?: string; customLabel?: string }
  ) => Promise<void>;
  enqueueWeaknessCards: (generatorIds: string[]) => Promise<void>;
  saveExamResult: (row: Omit<ExamHistoryRow, 'id'>) => Promise<void>;
  exportBackupJson: () => Promise<string>;
  importBackupJson: (jsonText: string) => Promise<void>;
}

function applyThemeClass(theme: 'light' | 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  theme: 'light',
  route: { view: 'dashboard' },
  lessonProgress: {},
  skillStats: {},
  diagnosticResults: {},
  formulaCopied: {},
  srsQueue: {},
  examHistory: [],

  hydrate: async () => {
    try {
      const [progressRows, statRows, diagRows, formulaRows, themeRow, srsRows, examRows] =
        await Promise.all([
          db.lessonProgress.toArray(),
          db.skillStats.toArray(),
          db.diagnosticResults.toArray(),
          db.formulaChecks.toArray(),
          db.settings.get('theme'),
          db.srsQueue.toArray(),
          db.examHistory.orderBy('completedAt').reverse().toArray(),
        ]);

      const theme: 'light' | 'dark' = themeRow?.value === 'dark' ? 'dark' : 'light';
      applyThemeClass(theme);

      const lessonProgress: Record<string, LessonProgressRow> = {};
      for (const r of progressRows) lessonProgress[r.lessonId] = r;

      const skillStats: Record<string, SkillStatRow> = {};
      for (const r of statRows) skillStats[r.generatorId] = r;

      const diagnosticResults: Record<string, DiagnosticResultRow> = {};
      for (const r of diagRows) diagnosticResults[r.skillKey] = r;

      const formulaCopied: Record<string, boolean> = {};
      for (const r of formulaRows) formulaCopied[r.formulaId] = r.copied;

      const srsQueue: Record<string, SrsState> = {};
      for (const r of srsRows) srsQueue[r.cardId] = r;

      set({
        hydrated: true,
        theme,
        lessonProgress,
        skillStats,
        diagnosticResults,
        formulaCopied,
        srsQueue,
        examHistory: examRows,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setTheme: async (theme) => {
    applyThemeClass(theme);
    set({ theme });
    await db.settings.put({ key: 'theme', value: theme });
  },

  toggleTheme: async () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    await get().setTheme(next);
  },

  navigate: (route) => set({ route }),

  updateLessonProgress: async (lessonId, status, currentPhase) => {
    const existing = get().lessonProgress[lessonId];
    const finalStatus: LessonStatus =
      existing?.status === 'completed' ? 'completed' : status;
    const row: LessonProgressRow = {
      lessonId,
      status: finalStatus,
      currentPhase,
      updatedAt: Date.now(),
    };
    await db.lessonProgress.put(row);
    set((s) => ({
      lessonProgress: { ...s.lessonProgress, [lessonId]: row },
    }));
  },

  recordSkillAttempt: async (generatorId, isCorrect, errorType) => {
    const prev = get().skillStats[generatorId] ?? {
      generatorId,
      attempts: 0,
      correct: 0,
      lastPracticedAt: 0,
      recentErrors: [],
    };
    const nextErrors =
      !isCorrect && errorType
        ? [errorType, ...prev.recentErrors].slice(0, 10)
        : prev.recentErrors;
    const updated: SkillStatRow = {
      generatorId,
      attempts: prev.attempts + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      lastPracticedAt: Date.now(),
      recentErrors: nextErrors,
    };
    await db.skillStats.put(updated);
    set((s) => ({
      skillStats: { ...s.skillStats, [generatorId]: updated },
    }));
  },

  saveDiagnosticResults: async (rows) => {
    await db.diagnosticResults.bulkPut(rows);
    const map: Record<string, DiagnosticResultRow> = { ...get().diagnosticResults };
    for (const r of rows) map[r.skillKey] = r;
    set({ diagnosticResults: map });
  },

  toggleFormulaCopied: async (formulaId) => {
    const next = !get().formulaCopied[formulaId];
    await db.formulaChecks.put({ formulaId, copied: next });
    set((s) => ({
      formulaCopied: { ...s.formulaCopied, [formulaId]: next },
    }));
  },

  reviewSrsCard: async (cardId, rating, extra) => {
    const now = Date.now();
    const existing =
      get().srsQueue[cardId] ?? createInitialSrsState(cardId, now, extra);
    const next = computeNextSrsState(existing, rating, now);
    await db.srsQueue.put(next);
    set((s) => ({
      srsQueue: { ...s.srsQueue, [cardId]: next },
    }));
  },

  enqueueWeaknessCards: async (generatorIds) => {
    const now = Date.now();
    const unique = Array.from(new Set(generatorIds));
    const updates: SrsState[] = [];
    const nextMap = { ...get().srsQueue };

    for (const gid of unique) {
      const cardId = `weak:${gid}`;
      const existing = nextMap[cardId];
      const state: SrsState = existing
        ? { ...existing, nextReviewAt: now, generatorId: gid }
        : createInitialSrsState(cardId, now, { generatorId: gid });
      updates.push(state);
      nextMap[cardId] = state;
    }

    if (updates.length > 0) {
      await db.srsQueue.bulkPut(updates);
      set({ srsQueue: nextMap });
    }
  },

  saveExamResult: async (row) => {
    const id = await db.examHistory.add(row);
    const fullRow: ExamHistoryRow = { ...row, id };
    set((s) => ({
      examHistory: [fullRow, ...s.examHistory],
    }));
  },

  exportBackupJson: async () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      lessonProgress: await db.lessonProgress.toArray(),
      skillStats: await db.skillStats.toArray(),
      diagnosticResults: await db.diagnosticResults.toArray(),
      formulaChecks: await db.formulaChecks.toArray(),
      srsQueue: await db.srsQueue.toArray(),
      examHistory: await db.examHistory.toArray(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackupJson: async (jsonText) => {
    const data = JSON.parse(jsonText);
    if (!data || typeof data !== 'object') throw new Error('Ungültiges Backup-Format');
    if (Array.isArray(data.lessonProgress)) await db.lessonProgress.bulkPut(data.lessonProgress);
    if (Array.isArray(data.skillStats)) await db.skillStats.bulkPut(data.skillStats);
    if (Array.isArray(data.diagnosticResults)) {
      await db.diagnosticResults.bulkPut(data.diagnosticResults);
    }
    if (Array.isArray(data.formulaChecks)) await db.formulaChecks.bulkPut(data.formulaChecks);
    if (Array.isArray(data.srsQueue)) await db.srsQueue.bulkPut(data.srsQueue);
    if (Array.isArray(data.examHistory)) await db.examHistory.bulkPut(data.examHistory);
    await get().hydrate();
  },
}));
