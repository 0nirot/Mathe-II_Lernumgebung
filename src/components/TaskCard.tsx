import { AlertCircle, CheckCircle2, HelpCircle, Lightbulb, PenTool, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { evaluateCheckpoint, type CheckpointEvalResult } from '../core/evaluator';
import type { GeneratedTask } from '../types/learning';
import { Formula, MathText } from './MathText';
import { MatrixGridInput, SmartScalarInput, VectorGridInput } from './SmartMathInput';

interface TaskCardProps {
  task: GeneratedTask;
  onNewTask?: () => void;
  onEvaluated?: (allCorrect: boolean, firstErrorType?: string) => void;
  hideNewTaskButton?: boolean;
}

export function TaskCard({
  task,
  onNewTask,
  onEvaluated,
  hideNewTaskButton = false,
}: TaskCardProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [results, setResults] = useState<Record<string, CheckpointEvalResult>>({});
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [showSolution, setShowSolution] = useState(false);

  const setAnswer = (cpId: string, val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [cpId]: val }));
  };

  const defaultRaw = (cp: GeneratedTask['checkpoints'][number]): string | string[] => {
    if (cp.kind === 'vector2') return ['', ''];
    if (cp.kind === 'vector3') return ['', '', ''];
    if (cp.kind === 'matrix') {
      const len = (cp.matrixShape?.rows ?? 2) * (cp.matrixShape?.cols ?? 2);
      return Array.from({ length: len }, () => '');
    }
    return '';
  };

  const checkSingle = (cpId: string) => {
    const cp = task.checkpoints.find((c) => c.id === cpId);
    if (!cp) return;
    const raw = answers[cpId] ?? defaultRaw(cp);
    const res = evaluateCheckpoint(cp, raw);
    const nextResults = { ...results, [cpId]: res };
    setResults(nextResults);

    // If all checkpoints have been evaluated, notify store
    const allEvaluated = task.checkpoints.every((c) => nextResults[c.id]?.isValidSyntax);
    if (allEvaluated && onEvaluated) {
      const allCorrect = task.checkpoints.every((c) => nextResults[c.id]?.isCorrect);
      const firstErr = task.checkpoints
        .map((c) => nextResults[c.id]?.diagnosticType)
        .find(Boolean);
      onEvaluated(allCorrect, firstErr);
    }
  };

  const checkAll = () => {
    const nextResults: Record<string, CheckpointEvalResult> = {};
    for (const cp of task.checkpoints) {
      const raw = answers[cp.id] ?? defaultRaw(cp);
      nextResults[cp.id] = evaluateCheckpoint(cp, raw);
    }
    setResults(nextResults);

    const allValid = task.checkpoints.every((c) => nextResults[c.id]?.isValidSyntax);
    if (allValid && onEvaluated) {
      const allCorrect = task.checkpoints.every((c) => nextResults[c.id]?.isCorrect);
      const firstErr = task.checkpoints
        .map((c) => nextResults[c.id]?.diagnosticType)
        .find(Boolean);
      onEvaluated(allCorrect, firstErr);
    }
  };

  const allCorrect =
    task.checkpoints.length > 0 && task.checkpoints.every((c) => results[c.id]?.isCorrect);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            {task.topicLabel}
          </span>
          {task.paperRecommended && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <PenTool className="w-3 h-3" />
              Auf Papier rechnen & Kontrollwerte eintragen
            </span>
          )}
        </div>
        {!hideNewTaskButton && onNewTask && (
          <button
            type="button"
            onClick={onNewTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Neue Aufgabe
          </button>
        )}
      </div>

      {/* Prompt */}
      <div className="text-[15px] leading-relaxed">
        <MathText text={task.prompt} />
      </div>

      {/* Optional Find-the-Mistake Lines */}
      {task.mistakeLines && task.mistakeLines.length > 0 && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Vorgerechneter Lösungsweg (enthält genau 1 Fehler):
          </div>
          {task.mistakeLines.map((line) => (
            <div
              key={line.id}
              className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm"
            >
              <MathText text={line.text} />
            </div>
          ))}
        </div>
      )}

      {/* Checkpoints */}
      <div className="space-y-4">
        {task.checkpoints.map((cp) => {
          const res = results[cp.id];
          const val = answers[cp.id];
          return (
            <div
              key={cp.id}
              className={`p-4 rounded-xl border transition-colors ${
                res?.isCorrect
                  ? 'border-green-400 dark:border-green-700 bg-green-50/40 dark:bg-green-950/20'
                  : res && !res.isCorrect
                    ? 'border-red-300 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-page)]/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label className="text-sm font-semibold">
                  <MathText text={cp.label} />
                </label>
                {task.checkpoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => checkSingle(cp.id)}
                    className="px-2.5 py-1 text-xs rounded-md font-medium border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                  >
                    Teil prüfen
                  </button>
                )}
              </div>

              {cp.kind === 'scalar' && (
                <SmartScalarInput
                  value={typeof val === 'string' ? val : ''}
                  onChange={(v) => setAnswer(cp.id, v)}
                  unit={cp.unit}
                  onEnter={() => checkSingle(cp.id)}
                />
              )}

              {(cp.kind === 'vector2' || cp.kind === 'vector3') && (
                <VectorGridInput
                  dim={cp.kind === 'vector2' ? 2 : 3}
                  values={Array.isArray(val) ? val : []}
                  onChange={(v) => setAnswer(cp.id, v)}
                  onEnter={() => checkSingle(cp.id)}
                />
              )}

              {cp.kind === 'matrix' && cp.matrixShape && (
                <MatrixGridInput
                  rows={cp.matrixShape.rows}
                  cols={cp.matrixShape.cols}
                  values={Array.isArray(val) ? val : []}
                  onChange={(v) => setAnswer(cp.id, v)}
                  onEnter={() => checkSingle(cp.id)}
                />
              )}

              {(cp.kind === 'choice' || cp.kind === 'mistake-line') && cp.options && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {cp.options.map((opt) => {
                    const selected = val === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswer(cp.id, opt.id)}
                        className={`p-2.5 rounded-lg border text-sm text-left cursor-pointer transition-colors ${
                          selected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)]'
                        }`}
                      >
                        <MathText text={opt.label} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Feedback */}
              {res && (
                <div className="mt-3 text-sm">
                  {!res.isValidSyntax ? (
                    <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{res.parseError}</span>
                    </div>
                  ) : res.isCorrect ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Richtig!</span>
                      </div>
                      {res.styleTip && (
                        <div className="text-xs text-[var(--text-muted)] pl-6">{res.styleTip}</div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold">Noch nicht ganz richtig.</div>
                        {res.diagnosticMessage ? (
                          <div className="mt-0.5">
                            <MathText text={res.diagnosticMessage} />
                          </div>
                        ) : (
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">
                            Prüfe Vorzeichen und Rechenschritte oder nutze einen gestuften Hinweis unten.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={checkAll}
            className="px-4 py-2 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors"
          >
            {task.checkpoints.length > 1 ? 'Alle Kontrollwerte prüfen' : 'Antwort prüfen'}
          </button>

          {hintLevel < 3 && (
            <button
              type="button"
              onClick={() => setHintLevel((h) => Math.min(3, h + 1) as 0 | 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Hinweis Stufe {hintLevel + 1}/3
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSolution((s) => !s)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showSolution ? 'Musterlösung verbergen' : 'Musterlösung zeigen'}
          </button>
        </div>

        {allCorrect && onNewTask && !hideNewTaskButton && (
          <button
            type="button"
            onClick={onNewTask}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          >
            Nächste Aufgabe →
          </button>
        )}
      </div>

      {/* Progressive Hints */}
      {hintLevel > 0 && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-2 text-sm">
          <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" />
            Gestufte Hinweise ({hintLevel}/3)
          </div>
          {task.hints.slice(0, hintLevel).map((h, i) => (
            <div key={i} className="pl-2 border-l-2 border-amber-400">
              <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300 mr-1.5">
                Stufe {i + 1}:
              </span>
              <MathText text={h} />
            </div>
          ))}
        </div>
      )}

      {/* Full Worked Solution */}
      {showSolution && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-4 space-y-2 text-sm">
          <div className="font-semibold text-blue-900 dark:text-blue-200">Musterlösungsweg</div>
          <div className="space-y-1.5">
            {task.fullSolutionSteps.map((step, i) => (
              <div key={i}>
                <MathText text={step} />
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex flex-wrap gap-4 text-xs">
            {task.checkpoints.map((cp) => (
              <div key={cp.id}>
                <span className="font-semibold mr-1"><MathText text={cp.label} />:</span>
                <Formula latex={cp.solutionLatex} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
