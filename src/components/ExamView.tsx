import {
  AlertTriangle,
  Award,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  History,
  Play,
  Send,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FORMULA_SHEET_ITEMS } from '../content/modules';
import { evaluateCheckpoint, type CheckpointEvalResult } from '../core/evaluator';
import { generateTaskById } from '../core/generators';
import { useAppStore } from '../store/useAppStore';
import type { GeneratedTask, ModuleId } from '../types/learning';
import { Formula, MathText } from './MathText';
import { MatrixGridInput, SmartScalarInput, VectorGridInput } from './SmartMathInput';

interface ExamPreset {
  id: 'full' | 'mathe2' | 'cg3d' | 'single';
  title: string;
  subtitle: string;
  durationMin: number;
  taskCountLabel: string;
  description: string;
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'full',
    title: 'Vollklausur (M1–M5)',
    subtitle: '90 Minuten · 9 Aufgaben',
    durationMin: 90,
    taskCountLabel: '9 Aufgaben (M1 20 %, M2 25 %, M3 25 %, M4 20 %, M5 10 %)',
    description:
      'Realistische Gesamtprüfung ohne Taschenrechner über alle prüfungsrelevanten Themen (ohne Vektorraum).',
  },
  {
    id: 'mathe2',
    title: 'Nur Mathe II (M1–M3)',
    subtitle: '60 Minuten · 6 Aufgaben',
    durationMin: 60,
    taskCountLabel: '6 Aufgaben (Vektoren, LGS/Matrizen, Analytische Geometrie)',
    description:
      'Konzentrierter Block über Vektoralgebra, Gauß, Determinanten, Inversen, Geraden & Ebenen.',
  },
  {
    id: 'cg3d',
    title: 'Nur 3D & Computergrafik (M4–M5)',
    subtitle: '45 Minuten · 4 Aufgaben',
    durationMin: 45,
    taskCountLabel: '4 Aufgaben (2D/3D-Transformationen & Interpolation)',
    description:
      'Fokus auf homogene Matrizen, Verkettungen, 3D-Rotationen sowie lineare & bilineare Interpolation.',
  },
  {
    id: 'single',
    title: 'Einzelmodul-Kurztest',
    subtitle: '25 Minuten · 4 Aufgaben',
    durationMin: 25,
    taskCountLabel: '4 Aufgaben aus einem frei wählbaren Modul (M1–M5)',
    description:
      'Schneller Prüfungs-Check direkt nach Abschluss eines einzelnen Moduls.',
  },
];

const MODULE_POOLS: Record<Exclude<ModuleId, 'm0'>, string[]> = {
  m1: ['m1-vec-ops', 'm1-connect-norm', 'm1-dot-angle', 'm1-projection', 'm1-cross-area'],
  m2: [
    'm2-gauss-lgs',
    'm2-lgs-behavior',
    'm2-matrix-mul',
    'm2-det-2x2-inv',
    'm2-det-3x3-sarrus',
    'm2-det-4x4-laplace',
    'm2-gauss-jordan-3x3',
  ],
  m3: [
    'm3-line-2pts',
    'm3-dist-point-line',
    'm3-lines-intersect',
    'm3-dist-skew-lines',
    'm3-dist-point-plane',
    'm3-line-plane-intersect',
    'm3-plane-plane-line',
  ],
  m4: [
    'm4-linear-vs-affine',
    'm4-2d-basic-transform',
    'm4-2d-rotate-point',
    'm4-2d-chain',
    'm4-3d-transform',
    'm4-3d-axis-concept',
  ],
  m5: ['m5-linear-1d', 'm5-bilinear-2d', 'm5-concepts'],
};

function sampleWithoutReplacement(pool: string[], count: number): string[] {
  const copy = [...pool];
  const picked: string[] = [];
  while (picked.length < count && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  while (picked.length < count) {
    picked.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return picked;
}

function buildExamTasks(
  presetId: ExamPreset['id'],
  singleMod: Exclude<ModuleId, 'm0'>
): GeneratedTask[] {
  let genIds: string[] = [];
  if (presetId === 'full') {
    genIds = [
      ...sampleWithoutReplacement(MODULE_POOLS.m1, 2),
      ...sampleWithoutReplacement(MODULE_POOLS.m2, 2),
      ...sampleWithoutReplacement(MODULE_POOLS.m3, 2),
      ...sampleWithoutReplacement(MODULE_POOLS.m4, 2),
      ...sampleWithoutReplacement(MODULE_POOLS.m5, 1),
    ];
  } else if (presetId === 'mathe2') {
    genIds = [
      ...sampleWithoutReplacement(MODULE_POOLS.m1, 2),
      ...sampleWithoutReplacement(MODULE_POOLS.m2, 2),
      ...sampleWithoutReplacement(MODULE_POOLS.m3, 2),
    ];
  } else if (presetId === 'cg3d') {
    genIds = [
      ...sampleWithoutReplacement(MODULE_POOLS.m4, 3),
      ...sampleWithoutReplacement(MODULE_POOLS.m5, 1),
    ];
  } else {
    genIds = sampleWithoutReplacement(MODULE_POOLS[singleMod], 4);
  }
  return genIds.map((gid) => generateTaskById(gid));
}

function defaultRaw(cp: GeneratedTask['checkpoints'][number]): string | string[] {
  if (cp.kind === 'vector2') return ['', ''];
  if (cp.kind === 'vector3') return ['', '', ''];
  if (cp.kind === 'matrix') {
    const len = (cp.matrixShape?.rows ?? 2) * (cp.matrixShape?.cols ?? 2);
    return Array.from({ length: len }, () => '');
  }
  return '';
}

function isFilled(val: string | string[] | undefined): boolean {
  if (!val) return false;
  if (Array.isArray(val)) return val.some((v) => v.trim().length > 0);
  return val.trim().length > 0;
}

interface EvaluatedExam {
  presetTitle: string;
  durationUsedSec: number;
  earnedPoints: number;
  maxPoints: number;
  percent: number;
  moduleBreakdown: Partial<Record<ModuleId, { earned: number; max: number }>>;
  failedGeneratorIds: string[];
  resultsByTask: Record<string, Record<string, CheckpointEvalResult>>;
}

export function ExamView() {
  const { examHistory, saveExamResult, enqueueWeaknessCards, navigate } = useAppStore();
  const [phase, setPhase] = useState<'lobby' | 'running' | 'review'>('lobby');
  const [singleModule, setSingleModule] = useState<Exclude<ModuleId, 'm0'>>('m2');
  const [activePreset, setActivePreset] = useState<ExamPreset | null>(null);
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, string | string[]>>>({});
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [showFormulaDrawer, setShowFormulaDrawer] = useState(false);
  const [formulaSide, setFormulaSide] = useState<'front' | 'back'>('front');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluatedExam | null>(null);
  const [srsEnqueued, setSrsEnqueued] = useState(false);

  const startExam = (preset: ExamPreset) => {
    const generated = buildExamTasks(preset.id, singleModule);
    setActivePreset(preset);
    setTasks(generated);
    setActiveIdx(0);
    setAnswers({});
    setTimeLeftSec(preset.durationMin * 60);
    setShowFormulaDrawer(false);
    setConfirmSubmit(false);
    setEvaluation(null);
    setSrsEnqueued(false);
    setPhase('running');
  };

  const finishExam = () => {
    if (!activePreset) return;
    const resultsByTask: Record<string, Record<string, CheckpointEvalResult>> = {};
    let earnedPoints = 0;
    let maxPoints = 0;
    const moduleBreakdown: Partial<Record<ModuleId, { earned: number; max: number }>> = {};
    const failedSet = new Set<string>();

    for (const task of tasks) {
      const taskAns = answers[task.id] ?? {};
      const taskRes: Record<string, CheckpointEvalResult> = {};
      let taskAllOk = true;

      for (const cp of task.checkpoints) {
        const raw = taskAns[cp.id] ?? defaultRaw(cp);
        const evalRes = evaluateCheckpoint(cp, raw);
        taskRes[cp.id] = evalRes;

        maxPoints += cp.points;
        const modEntry = moduleBreakdown[task.moduleId] ?? { earned: 0, max: 0 };
        modEntry.max += cp.points;
        if (evalRes.isCorrect) {
          earnedPoints += cp.points;
          modEntry.earned += cp.points;
        } else {
          taskAllOk = false;
        }
        moduleBreakdown[task.moduleId] = modEntry;
      }

      if (!taskAllOk) {
        failedSet.add(task.generatorId);
      }
      resultsByTask[task.id] = taskRes;
    }

    const percent = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    const durationUsedSec = activePreset.durationMin * 60 - timeLeftSec;
    const presetTitle =
      activePreset.id === 'single'
        ? `${activePreset.title} (${singleModule.toUpperCase()})`
        : activePreset.title;
    const failedGeneratorIds = Array.from(failedSet);

    setEvaluation({
      presetTitle,
      durationUsedSec,
      earnedPoints,
      maxPoints,
      percent,
      moduleBreakdown,
      failedGeneratorIds,
      resultsByTask,
    });
    setPhase('review');

    void saveExamResult({
      presetId: activePreset.id === 'single' ? `single-${singleModule}` : activePreset.id,
      presetTitle,
      completedAt: Date.now(),
      durationUsedSec,
      earnedPoints,
      maxPoints,
      percent,
      moduleBreakdown,
      failedGeneratorIds,
    });
  };

  // Countdown timer
  useEffect(() => {
    if (phase !== 'running') return;
    if (timeLeftSec <= 0) {
      finishExam();
      return;
    }
    const id = setTimeout(() => setTimeLeftSec((t) => t - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeftSec]);

  const formulaItems = useMemo(
    () => FORMULA_SHEET_ITEMS.filter((f) => f.side === formulaSide),
    [formulaSide]
  );

  // =========================================================================
  // LOBBY
  // =========================================================================
  if (phase === 'lobby') {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Prüfungsmodus (Klausur-Simulation ohne Taschenrechner)
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Echte Klausurbedingungen: fester Timer, keine Hinweise, keine Zwischenprüfung – aber dein aufklappbares 1-Blatt-Formelblatt und Teilpunkte pro Kontrollwert!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXAM_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  {preset.subtitle}
                </div>
                <h2 className="text-lg font-bold">{preset.title}</h2>
                <div className="text-xs font-medium text-[var(--text-main)]">
                  {preset.taskCountLabel}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {preset.description}
                </p>

                {preset.id === 'single' && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {(['m1', 'm2', 'm3', 'm4', 'm5'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSingleModule(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border cursor-pointer ${
                          singleModule === m
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => startExam(preset)}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Klausur starten
              </button>
            </div>
          ))}
        </div>

        {/* Exam History */}
        {examHistory.length > 0 && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-3 shadow-xs">
            <h2 className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Bisherige Klausur-Simulationen ({examHistory.length})
            </h2>
            <div className="divide-y divide-[var(--border-color)] text-sm">
              {examHistory.slice(0, 8).map((row) => (
                <div
                  key={row.id ?? row.completedAt}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold">{row.presetTitle}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {new Date(row.completedAt).toLocaleString('de-DE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}{' '}
                      · Dauer: {Math.max(1, Math.round(row.durationUsedSec / 60))} Min.
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {row.earnedPoints} / {row.maxPoints} Pkt.
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        row.percent >= 50
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                      }`}
                    >
                      {row.percent} %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RUNNING EXAM
  // =========================================================================
  if (phase === 'running' && activePreset) {
    const currentTask = tasks[activeIdx];
    const mm = String(Math.floor(timeLeftSec / 60)).padStart(2, '0');
    const ss = String(timeLeftSec % 60).padStart(2, '0');
    const lowTime = timeLeftSec <= 600; // last 10 minutes: calm amber highlight (Q12)

    const setCell = (taskId: string, cpId: string, val: string | string[]) => {
      setAnswers((prev) => ({
        ...prev,
        [taskId]: {
          ...(prev[taskId] ?? {}),
          [cpId]: val,
        },
      }));
    };

    const answeredTasksCount = tasks.filter((t) =>
      t.checkpoints.some((cp) => isFilled(answers[t.id]?.[cp.id]))
    ).length;

    return (
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Bar */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs sticky top-2 z-20">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)]">
              Prüfungsmodus · Keine Hilfen · Ohne Taschenrechner
            </div>
            <div className="font-bold text-base">
              {activePreset.title} ({answeredTasksCount}/{tasks.length} bearbeitet)
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFormulaDrawer((s) => !s)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                showFormulaDrawer
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                  : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <FileText className="w-4 h-4" />
              {showFormulaDrawer ? 'Formelblatt zuklappen' : '1-Blatt-Formelblatt'}
            </button>

            <div
              className={`px-3.5 py-1.5 rounded-xl font-mono text-lg font-bold border transition-colors ${
                lowTime
                  ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                  : 'bg-[var(--bg-subtle)] border-[var(--border-color)]'
              }`}
              title={lowTime ? 'Letzte 10 Minuten!' : 'Verbleibende Zeit'}
            >
              {mm}:{ss}
            </div>

            {!confirmSubmit ? (
              <button
                type="button"
                onClick={() => setConfirmSubmit(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Klausur abgeben
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={finishExam}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Jetzt endgültig abgeben!
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(false)}
                  className="px-2.5 py-2 rounded-xl border border-[var(--border-color)] text-xs cursor-pointer"
                >
                  Abbrechen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Formula Drawer (read-only A4 sheet, Q4) */}
        {showFormulaDrawer && (
          <div className="rounded-2xl border border-blue-300 dark:border-blue-800 bg-[var(--bg-card)] p-4 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Dein zugelassenes 1-Blatt-Formelblatt (nur Formeln)
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormulaSide('front')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    formulaSide === 'front'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[var(--bg-subtle)]'
                  }`}
                >
                  Vorderseite (M0–M2)
                </button>
                <button
                  type="button"
                  onClick={() => setFormulaSide('back')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    formulaSide === 'back'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[var(--bg-subtle)]'
                  }`}
                >
                  Rückseite (M3–M5)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {formulaItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-xs space-y-1"
                >
                  <div className="font-bold">{item.title}</div>
                  <div className="overflow-x-auto">
                    <Formula latex={item.latex} />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">{item.whenToUse}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Switcher Strip */}
        <div className="flex flex-wrap gap-2">
          {tasks.map((t, idx) => {
            const filled = t.checkpoints.some((cp) => isFilled(answers[t.id]?.[cp.id]));
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  idx === activeIdx
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : filled
                      ? 'border-green-400 dark:border-green-800 bg-green-50/70 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                Aufgabe {idx + 1}{' '}
                <span className="opacity-75 uppercase">({t.moduleId})</span>
              </button>
            );
          })}
        </div>

        {/* Active Exam Task */}
        {currentTask && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  Aufgabe {activeIdx + 1} / {tasks.length}
                </span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {currentTask.topicLabel} ·{' '}
                  {currentTask.checkpoints.reduce((s, c) => s + c.points, 0)} Punkte
                </span>
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Rechne auf Schmierpapier und trage die Kontrollwerte ein.
              </span>
            </div>

            <div className="text-[15px] leading-relaxed">
              <MathText text={currentTask.prompt} />
            </div>

            {currentTask.mistakeLines && currentTask.mistakeLines.length > 0 && (
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] p-4 space-y-2">
                {currentTask.mistakeLines.map((line) => (
                  <div
                    key={line.id}
                    className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm"
                  >
                    <MathText text={line.text} />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {currentTask.checkpoints.map((cp) => {
                const val = answers[currentTask.id]?.[cp.id];
                return (
                  <div
                    key={cp.id}
                    className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-semibold">
                        <MathText text={cp.label} />
                      </label>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {cp.points} {cp.points === 1 ? 'Punkt' : 'Punkte'}
                      </span>
                    </div>

                    {cp.kind === 'scalar' && (
                      <SmartScalarInput
                        value={typeof val === 'string' ? val : ''}
                        onChange={(v) => setCell(currentTask.id, cp.id, v)}
                        unit={cp.unit}
                      />
                    )}
                    {(cp.kind === 'vector2' || cp.kind === 'vector3') && (
                      <VectorGridInput
                        dim={cp.kind === 'vector2' ? 2 : 3}
                        values={Array.isArray(val) ? val : []}
                        onChange={(v) => setCell(currentTask.id, cp.id, v)}
                      />
                    )}
                    {cp.kind === 'matrix' && cp.matrixShape && (
                      <MatrixGridInput
                        rows={cp.matrixShape.rows}
                        cols={cp.matrixShape.cols}
                        values={Array.isArray(val) ? val : []}
                        onChange={(v) => setCell(currentTask.id, cp.id, v)}
                      />
                    )}
                    {(cp.kind === 'choice' || cp.kind === 'mistake-line') && cp.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {cp.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCell(currentTask.id, cp.id, opt.id)}
                            className={`p-2.5 rounded-lg border text-sm text-left cursor-pointer ${
                              val === opt.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)]'
                            }`}
                          >
                            <MathText text={opt.label} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-medium disabled:opacity-40 hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                ← Vorherige Aufgabe
              </button>
              {activeIdx < tasks.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveIdx((i) => Math.min(tasks.length - 1, i + 1))}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Nächste Aufgabe →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(true)}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Klausur abgeben ✓
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // REVIEW & PARTIAL CREDIT BREAKDOWN
  // =========================================================================
  if (phase === 'review' && evaluation) {
    const passed = evaluation.percent >= 50;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Result Banner */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Award className="w-4 h-4" />
                Klausur-Auswertung (Teilpunkte-System)
              </div>
              <h1 className="text-2xl font-bold">{evaluation.presetTitle}</h1>
              <p className="text-xs text-[var(--text-muted)]">
                Bearbeitungszeit: {Math.max(1, Math.round(evaluation.durationUsedSec / 60))} Min.
              </p>
            </div>

            <div className="text-right">
              <div
                className={`text-4xl font-extrabold ${
                  passed
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {evaluation.percent} %
              </div>
              <div className="text-sm font-semibold">
                {evaluation.earnedPoints} / {evaluation.maxPoints} Punkte ·{' '}
                {passed ? 'Bestanden ✓' : 'Noch weiter trainieren'}
              </div>
            </div>
          </div>

          {/* Module Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {Object.entries(evaluation.moduleBreakdown).map(([modId, stat]) => {
              if (!stat) return null;
              const pct = stat.max > 0 ? Math.round((stat.earned / stat.max) * 100) : 0;
              return (
                <div
                  key={modId}
                  className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase">
                    <span>{modId}</span>
                    <span>{pct} %</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {stat.earned} / {stat.max} Punkte
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions: Enqueue weaknesses into SRS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-color)]">
            {evaluation.failedGeneratorIds.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={srsEnqueued}
                  onClick={async () => {
                    await enqueueWeaknessCards(evaluation.failedGeneratorIds);
                    setSrsEnqueued(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-green-600 text-white text-xs font-semibold cursor-pointer"
                >
                  <Brain className="w-4 h-4" />
                  {srsEnqueued
                    ? `${evaluation.failedGeneratorIds.length} Schwächen ins SRS übernommen ✓`
                    : `Schwächen (${evaluation.failedGeneratorIds.length}) direkt ins SRS übernehmen`}
                </button>
                {srsEnqueued && (
                  <button
                    type="button"
                    onClick={() => navigate({ view: 'srs' })}
                    className="px-3.5 py-2 rounded-xl border border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                  >
                    Jetzt im SRS trainieren →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Alle Aufgaben dieser Klausur fehlerfrei gelöst!
              </div>
            )}

            <button
              type="button"
              onClick={() => setPhase('lobby')}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] text-xs font-semibold cursor-pointer"
            >
              Neue Klausur wählen
            </button>
          </div>
        </div>

        {/* Detailed Task-by-Task Solutions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Musterlösungen & Teilpunkte im Detail</h2>
          {tasks.map((task, idx) => {
            const taskRes = evaluation.resultsByTask[task.id] ?? {};
            const taskEarned = task.checkpoints.reduce(
              (s, cp) => s + (taskRes[cp.id]?.isCorrect ? cp.points : 0),
              0
            );
            const taskMax = task.checkpoints.reduce((s, cp) => s + cp.points, 0);

            return (
              <div
                key={task.id}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-sm">
                    Aufgabe {idx + 1}: {task.topicLabel}{' '}
                    <span className="uppercase text-xs text-[var(--text-muted)]">
                      ({task.moduleId})
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      taskEarned === taskMax
                        ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                        : taskEarned > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                    }`}
                  >
                    {taskEarned} / {taskMax} Punkte
                  </span>
                </div>

                <div className="text-sm">
                  <MathText text={task.prompt} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {task.checkpoints.map((cp) => {
                    const res = taskRes[cp.id];
                    const ok = res?.isCorrect;
                    const rawVal = answers[task.id]?.[cp.id];
                    const rawDisplay = Array.isArray(rawVal)
                      ? rawVal.join(', ')
                      : (rawVal ?? '—');
                    return (
                      <div
                        key={cp.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          ok
                            ? 'border-green-300 dark:border-green-800 bg-green-50/40 dark:bg-green-950/20'
                            : 'border-red-300 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="inline-flex items-center gap-1">
                            {ok ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                            )}
                            <MathText text={cp.label} />
                          </span>
                          <span>
                            {ok ? cp.points : 0}/{cp.points} Pkt.
                          </span>
                        </div>
                        <div className="text-[var(--text-muted)]">
                          Deine Eingabe: <span className="font-mono">{rawDisplay || '—'}</span>
                        </div>
                        <div>
                          Musterlösung: <Formula latex={cp.solutionLatex} />
                        </div>
                        {!ok && res?.diagnosticMessage && (
                          <div className="text-amber-800 dark:text-amber-300 flex items-start gap-1 pt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <MathText text={res.diagnosticMessage} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] text-xs space-y-1">
                  <div className="font-bold text-[var(--text-muted)]">Rechenweg:</div>
                  {task.fullSolutionSteps.map((step, sIdx) => (
                    <div key={sIdx}>
                      <MathText text={step} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
