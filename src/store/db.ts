import Dexie, { type Table } from 'dexie';
import type { SrsState } from '../core/srs';
import type { LessonStatus, ModuleId } from '../types/learning';

export interface LessonProgressRow {
  lessonId: string;
  status: LessonStatus;
  currentPhase: number; // 0..5
  updatedAt: number;
}

export interface SkillStatRow {
  generatorId: string;
  attempts: number;
  correct: number;
  lastPracticedAt: number;
  recentErrors: string[];
}

export interface DiagnosticResultRow {
  skillKey: string;
  lessonId: string;
  skillName: string;
  passed: boolean;
  checkedAt: number;
}

export interface FormulaCheckRow {
  formulaId: string;
  copied: boolean;
}

export interface SettingRow {
  key: string;
  value: string;
}

export interface ExamHistoryRow {
  id?: number;
  presetId: string;
  presetTitle: string;
  completedAt: number;
  durationUsedSec: number;
  earnedPoints: number;
  maxPoints: number;
  percent: number;
  moduleBreakdown: Partial<Record<ModuleId, { earned: number; max: number }>>;
  failedGeneratorIds: string[];
}

class MatheLernDB extends Dexie {
  lessonProgress!: Table<LessonProgressRow, string>;
  skillStats!: Table<SkillStatRow, string>;
  diagnosticResults!: Table<DiagnosticResultRow, string>;
  formulaChecks!: Table<FormulaCheckRow, string>;
  settings!: Table<SettingRow, string>;
  srsQueue!: Table<SrsState, string>;
  examHistory!: Table<ExamHistoryRow, number>;

  constructor() {
    super('MatheLernumgebungDB');
    this.version(1).stores({
      lessonProgress: 'lessonId, status',
      skillStats: 'generatorId, lastPracticedAt',
      diagnosticResults: 'skillKey, lessonId',
      formulaChecks: 'formulaId',
      settings: 'key',
    });
    this.version(2).stores({
      lessonProgress: 'lessonId, status',
      skillStats: 'generatorId, lastPracticedAt',
      diagnosticResults: 'skillKey, lessonId',
      formulaChecks: 'formulaId',
      settings: 'key',
      srsQueue: 'cardId, nextReviewAt',
      examHistory: '++id, completedAt, presetId',
    });
  }
}

export const db = new MatheLernDB();
