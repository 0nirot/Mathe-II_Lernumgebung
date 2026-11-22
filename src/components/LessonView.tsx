import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  Info,
  Lightbulb,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FORMULA_SHEET_ITEMS } from '../content/modules';
import { generateTaskById } from '../core/generators';
import { useAppStore } from '../store/useAppStore';
import type { GeneratedTask, LessonDefinition } from '../types/learning';
import { Formula, MathText } from './MathText';
import { TaskCard } from './TaskCard';
import { CrossProduct3DViz } from './viz/CrossProduct3DViz';
import { Geo3DStageViz, SkewLines3DViz } from './viz/Geo3DStages';
import {
  Bilinear2DGridViz,
  Interp1DBoardViz,
  ResizingArtifactsViz,
} from './viz/InterpolationViz';
import { Line2DViz } from './viz/Line2DViz';
import {
  DetArea2DViz,
  FalkSchemaViz,
  GaussWorkbenchViz,
  SarrusLaplaceViz,
} from './viz/M2Workbenches';
import {
  Transform2DLabViz,
  Transform3DCubeViz,
  TransformChain2DViz,
} from './viz/TransformViz';
import { UnitCircleViz } from './viz/UnitCircleViz';
import { Vector2DSandbox } from './viz/Vector2DSandbox';

const PHASES = [
  { id: 0, label: '1. Intuition', icon: Sparkles },
  { id: 1, label: '2. Visualisierung', icon: Eye },
  { id: 2, label: '3. Erklärung', icon: BookOpen },
  { id: 3, label: '4. Schritt-Beispiel', icon: ListChecks },
  { id: 4, label: '5. Eigene Übung', icon: Lightbulb },
  { id: 5, label: '6. Formelblatt', icon: FileText },
];

interface LessonViewProps {
  lesson: LessonDefinition;
}

export function LessonView({ lesson }: LessonViewProps) {
  const {
    lessonProgress,
    updateLessonProgress,
    recordSkillAttempt,
    formulaCopied,
    toggleFormulaCopied,
    navigate,
  } = useAppStore();

  const savedPhase = lessonProgress[lesson.id]?.currentPhase ?? 0;
  const [phase, setPhase] = useState(savedPhase);
  const [revealedSteps, setRevealedSteps] = useState(1);
  const [activeGenIdx, setActiveGenIdx] = useState(0);
  const [currentTask, setCurrentTask] = useState<GeneratedTask>(() =>
    generateTaskById(lesson.generatorIds[0])
  );
  const [solvedCount, setSolvedCount] = useState(0);

  // Reset local state when switching lessons
  useEffect(() => {
    const startP = lessonProgress[lesson.id]?.currentPhase ?? 0;
    setPhase(startP);
    setRevealedSteps(1);
    setActiveGenIdx(0);
    setCurrentTask(generateTaskById(lesson.generatorIds[0]));
    setSolvedCount(0);
    void updateLessonProgress(lesson.id, 'in_progress', startP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const goPhase = (nextP: number) => {
    const clamped = Math.max(0, Math.min(5, nextP));
    setPhase(clamped);
    const status = clamped === 5 ? 'completed' : 'in_progress';
    void updateLessonProgress(lesson.id, status, clamped);
  };

  const spawnNewTask = (genIdx = activeGenIdx) => {
    setActiveGenIdx(genIdx);
    setCurrentTask(generateTaskById(lesson.generatorIds[genIdx]));
  };

  const formulaItems = FORMULA_SHEET_ITEMS.filter((f) =>
    lesson.formulaSheetIds.includes(f.id)
  );

  const renderVisualization = () => {
    if (!lesson.visualization) {
      return (
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-sm text-[var(--text-muted)]">
          Für diese reine Rechen-Grundlage geht es direkt über anschauliche Beispiele in die Praxis – springe gern direkt zu Schritt 3 (Erklärung) oder Schritt 4 (Beispiel).
        </div>
      );
    }
    switch (lesson.visualization.type) {
      case 'unit-circle':
        return <UnitCircleViz />;
      case 'line-2d':
        return <Line2DViz />;
      case 'vector-2d-ops':
        return <Vector2DSandbox initialMode="ops" />;
      case 'vector-2d-dot':
        return <Vector2DSandbox initialMode="dot" />;
      case 'vector-2d-projection':
        return <Vector2DSandbox initialMode="projection" />;
      case 'cross-product-3d':
        return <CrossProduct3DViz />;
      case 'gauss-workbench':
        return <GaussWorkbenchViz />;
      case 'falk-schema':
        return <FalkSchemaViz />;
      case 'sarrus-laplace':
        return <SarrusLaplaceViz />;
      case 'det-area-2d':
        return <DetArea2DViz />;
      case 'geo-3d-stage':
        return <Geo3DStageViz />;
      case 'skew-lines-3d':
        return <SkewLines3DViz />;
      case 'transform-2d-lab':
        return <Transform2DLabViz />;
      case 'transform-chain-2d':
        return <TransformChain2DViz />;
      case 'transform-3d-cube':
        return <Transform3DCubeViz />;
      case 'interp-1d-board':
        return <Interp1DBoardViz />;
      case 'bilinear-2d-grid':
        return <Bilinear2DGridViz />;
      case 'resizing-artifacts':
        return <ResizingArtifactsViz />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate({ view: 'module', moduleId: lesson.moduleId })}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Zurück zur Modulübersicht
          </button>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {lesson.subtitle} · <span className="font-medium">{lesson.slideRef}</span> · ca. {lesson.estimatedMinutes} Min.
          </p>
        </div>
        {lessonProgress[lesson.id]?.status === 'completed' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle2 className="w-4 h-4" />
            Abgeschlossen
          </span>
        )}
      </div>

      {/* 6-Phase Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const active = phase === p.id;
          const done = phase > p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => goPhase(p.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                  : done
                    ? 'border-green-300 dark:border-green-800 bg-green-50/70 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Phase Content */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs space-y-5">
        {phase === 0 && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Phase 1 · Intuition (ohne Formeln)
            </div>
            <p className="text-lg font-medium leading-relaxed">
              <MathText text={lesson.intuition.hook} />
            </p>
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 text-sm leading-relaxed">
              <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                Alltagsbild zum Merken:
              </div>
              <MathText text={lesson.intuition.analogy} />
            </div>
          </div>
        )}

        {phase === 1 && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Phase 2 · Interaktiv entdecken
            </div>
            {lesson.visualization && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm">
                <strong className="mr-1">Entdeckungs-Aufgabe:</strong>
                <MathText text={lesson.visualization.discoveryPrompt} />
              </div>
            )}
            {renderVisualization()}
          </div>
        )}

        {phase === 2 && (
          <div className="space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Phase 3 · Erklärung (Intuitiv → Formal)
            </div>

            <div className="space-y-3 text-[15px] leading-relaxed">
              {lesson.explanation.paragraphs.map((para, i) => (
                <p key={i}>
                  <MathText text={para} />
                </p>
              ))}
            </div>

            <div className="space-y-3">
              {lesson.explanation.keyFormulas.map((kf, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]"
                >
                  <div className="text-xs font-semibold text-[var(--text-muted)] mb-1">
                    {kf.label}
                  </div>
                  <Formula latex={kf.latex} display />
                </div>
              ))}
            </div>

            {lesson.explanation.symbolTooltips.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Symbol-Lexikon (was bedeutet welches Zeichen?):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {lesson.explanation.symbolTooltips.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]"
                    >
                      <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-sm font-semibold shrink-0">
                        <Formula latex={st.latex} />
                      </span>
                      <span className="text-xs leading-relaxed text-[var(--text-muted)]">
                        {st.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lesson.explanation.slideNote && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-xs leading-relaxed">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{lesson.explanation.slideNote}</span>
              </div>
            )}
          </div>
        )}

        {phase === 3 && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Phase 4 · Geführtes Beispiel (Schritt für Schritt)
            </div>
            <h2 className="text-lg font-bold">{lesson.example.title}</h2>
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[15px]">
              <MathText text={lesson.example.problem} />
            </div>

            <div className="space-y-3">
              {lesson.example.steps.slice(0, revealedSteps).map((step, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] space-y-2"
                >
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-400">
                    {step.label}
                  </div>
                  <div className="text-sm leading-relaxed">
                    <MathText text={step.content} />
                  </div>
                  {step.trick && (
                    <div className="text-xs p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                      <strong>Kopfrechen-Trick:</strong> <MathText text={step.trick} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {revealedSteps < lesson.example.steps.length ? (
              <button
                type="button"
                onClick={() => setRevealedSteps((r) => r + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Nächsten Schritt aufdecken ({revealedSteps}/{lesson.example.steps.length})
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-green-400 dark:border-green-700 bg-green-50/70 dark:bg-green-950/30 text-sm">
                <strong className="text-green-800 dark:text-green-300 mr-1.5">Endergebnis:</strong>
                <MathText text={lesson.example.finalResult} />
              </div>
            )}
          </div>
        )}

        {phase === 4 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Phase 5 · Selbst üben (taschenrechnerfrei)
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Gelöste Aufgaben in dieser Sitzung: <strong>{solvedCount}</strong> (Ziel: mind. 2 sicher lösen!)
                </p>
              </div>
              {lesson.generatorIds.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {lesson.generatorIds.map((gid, idx) => (
                    <button
                      key={gid}
                      type="button"
                      onClick={() => spawnNewTask(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                        activeGenIdx === idx
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-[var(--border-color)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      Aufgabentyp {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <TaskCard
              key={currentTask.id}
              task={currentTask}
              onNewTask={() => spawnNewTask(activeGenIdx)}
              onEvaluated={(ok, errType) => {
                void recordSkillAttempt(currentTask.generatorId, ok, errType);
                if (ok) setSolvedCount((c) => c + 1);
              }}
            />
          </div>
        )}

        {phase === 5 && (
          <div className="space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
              Phase 6 · Merksätze & Dein 1-Blatt-Formelblatt
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Das Wichtigste aus dieser Einheit:</div>
              <ul className="space-y-1.5 text-sm list-disc pl-5">
                {lesson.summaryBullets.map((b, i) => (
                  <li key={i}>
                    <MathText text={b} />
                  </li>
                ))}
              </ul>
            </div>

            {formulaItems.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold">
                  Für deine handgeschriebene DIN-A4-Formelsammlung (abhaken, sobald übertragen):
                </div>
                {formulaItems.map((item) => {
                  const checked = !!formulaCopied[item.id];
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => void toggleFormulaCopied(item.id)}
                            className="accent-green-600 w-4 h-4"
                          />
                          Auf mein Blatt übertragen
                        </label>
                      </div>
                      <Formula latex={item.latex} display />
                      <div className="text-xs text-[var(--text-muted)]">
                        <strong>Wann nutzen:</strong> {item.whenToUse}
                      </div>
                      <div className="text-xs text-amber-800 dark:text-amber-300">
                        <strong>Stolperfalle:</strong> {item.pitfall}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)]">
                Diese Grundlagen-Einheit braucht keinen Platz auf deinem kostbaren 1-Blatt-Formelblatt – die Handgriffe sitzen direkt im Kopf!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Prev / Next */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={phase === 0}
          onClick={() => goPhase(phase - 1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-medium disabled:opacity-40 hover:bg-[var(--bg-subtle)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>

        {phase < 5 ? (
          <button
            type="button"
            onClick={() => goPhase(phase + 1)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
          >
            Weiter: {PHASES[phase + 1].label}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              void updateLessonProgress(lesson.id, 'completed', 5);
              navigate({ view: 'module', moduleId: lesson.moduleId });
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Einheit abschließen
          </button>
        )}
      </div>
    </div>
  );
}
