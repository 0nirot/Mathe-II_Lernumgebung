import { ArrowLeft, CheckCircle2, ClipboardCheck, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { evaluateCheckpoint } from '../core/evaluator';
import {
  generateM0DiagnosticSuite,
  type DiagnosticQuestionItem,
} from '../core/generators/m0Generators';
import { useAppStore } from '../store/useAppStore';
import { Formula, MathText } from './MathText';
import { SmartScalarInput } from './SmartMathInput';

export function DiagnosticCheckM0() {
  const { navigate, saveDiagnosticResults } = useAppStore();
  const [suite, setSuite] = useState<DiagnosticQuestionItem[]>(() => generateM0DiagnosticSuite());
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const setVal = (skillKey: string, cpId: string, v: string) => {
    setAnswers((prev) => ({
      ...prev,
      [skillKey]: { ...(prev[skillKey] ?? {}), [cpId]: v },
    }));
  };

  const handleSubmit = async () => {
    const resMap: Record<string, boolean> = {};
    const dbRows = suite.map((item) => {
      const allOk = item.task.checkpoints.every((cp) => {
        const val = answers[item.skillKey]?.[cp.id] ?? '';
        return evaluateCheckpoint(cp, val).isCorrect;
      });
      resMap[item.skillKey] = allOk;
      return {
        skillKey: item.skillKey,
        lessonId: item.lessonId,
        skillName: item.skillName,
        passed: allOk,
        checkedAt: Date.now(),
      };
    });
    setResults(resMap);
    setSubmitted(true);
    await saveDiagnosticResults(dbRows);
  };

  const reset = () => {
    setSuite(generateM0DiagnosticSuite());
    setAnswers({});
    setSubmitted(false);
    setResults({});
  };

  const passedCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate({ view: 'module', moduleId: 'm0' })}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Zurück zu Modul 0
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            5-Minuten-Eingangscheck (Modul 0)
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            8 kurze Aufgaben ohne Taschenrechner – danach siehst du genau, welche Grundlagen-Bausteine du überspringen kannst und wo sich eine kurze Auffrischung lohnt.
          </p>
        </div>
        {submitted && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Neu starten
          </button>
        )}
      </div>

      {submitted && (
        <div className="rounded-2xl border border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-lg font-bold">
                Ergebnis: {passedCount} / 8 Bausteine direkt sicher!
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Deine Ampel-Empfehlung wurde gespeichert und erscheint auch in der Übersicht von Modul 0.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate({ view: 'module', moduleId: passedCount >= 7 ? 'm1' : 'm0' })}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {passedCount >= 7 ? 'Direkt zu Modul 1 starten →' : 'Empfohlene M0-Lektionen öffnen →'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suite.map((item) => {
              const ok = results[item.skillKey];
              return (
                <div
                  key={item.skillKey}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    ok
                      ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
                      : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{item.skillName}</span>
                  </div>
                  {ok ? (
                    <span className="text-green-700 dark:text-green-300 font-medium">Überspringbar</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate({ view: 'lesson', lessonId: item.lessonId })}
                      className="text-amber-800 dark:text-amber-200 underline font-semibold cursor-pointer"
                    >
                      Kurz auffrischen →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {suite.map((item, idx) => {
          const ok = results[item.skillKey];
          return (
            <div
              key={item.skillKey}
              className={`rounded-2xl border p-5 bg-[var(--bg-card)] space-y-3 ${
                submitted
                  ? ok
                    ? 'border-green-400 dark:border-green-700'
                    : 'border-amber-400 dark:border-amber-700'
                  : 'border-[var(--border-color)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Frage {idx + 1}/8 · {item.skillName}
                </span>
                {submitted && (
                  <span className={`text-xs font-semibold ${ok ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {ok ? '✓ Sicher' : '⚠ Auffrischen empfohlen'}
                  </span>
                )}
              </div>

              <div className="text-sm">
                <MathText text={item.task.prompt} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.task.checkpoints.map((cp) => (
                  <div key={cp.id}>
                    <div className="text-xs font-medium text-[var(--text-muted)] mb-1">
                      <MathText text={cp.label} />
                    </div>
                    <SmartScalarInput
                      value={answers[item.skillKey]?.[cp.id] ?? ''}
                      onChange={(v) => setVal(item.skillKey, cp.id, v)}
                      unit={cp.unit}
                      disabled={submitted}
                    />
                    {submitted && !ok && (
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Lösung: <Formula latex={cp.solutionLatex} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer"
          >
            Check auswerten & Empfehlung anzeigen
          </button>
        </div>
      )}
    </div>
  );
}
