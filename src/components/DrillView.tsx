import { Flame, Play, RotateCcw, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { evaluateCheckpoint } from '../core/evaluator';
import { generateTaskById } from '../core/generators';
import { useAppStore } from '../store/useAppStore';
import type { GeneratedTask } from '../types/learning';
import { Formula, MathText } from './MathText';
import { MatrixGridInput, SmartScalarInput, VectorGridInput } from './SmartMathInput';

interface DrillPreset {
  id: string;
  title: string;
  description: string;
  generatorIds: string[];
  durationSec: number;
}

const DRILL_PRESETS: DrillPreset[] = [
  {
    id: 'm0-mental',
    title: 'Kopfrechnen: Vorzeichen, Brüche & Wurzeln',
    description: '2-Minuten-Warmup für fehlerfreies Handrechnen ohne Taschenrechner.',
    generatorIds: ['m0-arithmetic', 'm0-fractions', 'm0-roots'],
    durationSec: 120,
  },
  {
    id: 'm0-trig',
    title: 'Winkel-Reflexe: Grad ↔ Bogenmaß & sin/cos',
    description: 'Alle Standardwinkel blitzschnell und sicher abrufen.',
    generatorIds: ['m0-deg-rad', 'm0-exact-trig'],
    durationSec: 120,
  },
  {
    id: 'm1-vectors',
    title: 'Vektor-Sprint: Rechnen, Skalarprodukt & Betrag',
    description: 'Trainiert Rechengeschwindigkeit für Modul 1.',
    generatorIds: ['m1-vec-ops', 'm1-dot-angle', 'm1-connect-norm'],
    durationSec: 180,
  },
  {
    id: 'm2-det',
    title: 'Matrizen- & Determinanten-Sprint (M2)',
    description: '2×2-Determinanten, Inversen, Sarrus & LGS-Lösungsverhalten sicher von Hand.',
    generatorIds: ['m2-det-2x2-inv', 'm2-det-3x3-sarrus', 'm2-lgs-behavior'],
    durationSec: 180,
  },
  {
    id: 'm3-geo',
    title: 'Abstände & Geraden-Sprint (M3)',
    description: 'Punkt–Ebene (Hesse), Punkt–Gerade & Zweipunktform im Raum.',
    generatorIds: ['m3-line-2pts', 'm3-dist-point-plane', 'm3-dist-point-line'],
    durationSec: 180,
  },
  {
    id: 'm4-m5-cg',
    title: '3D-CG-Sprint: Transformationen & Interpolation (M4/M5)',
    description: 'Linear vs. Affin, 2D-Drehungen, 1D- und bilineare Interpolation.',
    generatorIds: ['m4-linear-vs-affine', 'm4-2d-rotate-point', 'm5-linear-1d', 'm5-concepts'],
    durationSec: 180,
  },
];

export function DrillView() {
  const { recordSkillAttempt } = useAppStore();
  const [selected, setSelected] = useState<DrillPreset | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [finished, setFinished] = useState(false);

  const pickNextTask = (preset: DrillPreset) => {
    const gid = preset.generatorIds[Math.floor(Math.random() * preset.generatorIds.length)];
    setTask(generateTaskById(gid));
    setAnswers({});
    setFeedback(null);
  };

  const startDrill = (preset: DrillPreset) => {
    setSelected(preset);
    setTimeLeft(preset.durationSec);
    setScore({ correct: 0, total: 0, streak: 0 });
    setFinished(false);
    pickNextTask(preset);
  };

  useEffect(() => {
    if (!selected || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [selected, finished, timeLeft]);

  const handleCheck = () => {
    if (!task || !selected) return;
    let allOk = true;
    let errType: string | undefined;
    let diagMsg = '';
    for (const cp of task.checkpoints) {
      const raw =
        answers[cp.id] ??
        (cp.kind === 'vector2'
          ? ['', '']
          : cp.kind === 'vector3'
            ? ['', '', '']
            : cp.kind === 'matrix'
              ? Array.from(
                  { length: (cp.matrixShape?.rows ?? 2) * (cp.matrixShape?.cols ?? 2) },
                  () => ''
                )
              : '');
      const res = evaluateCheckpoint(cp, raw);
      if (!res.isValidSyntax) {
        setFeedback({ ok: false, msg: res.parseError ?? 'Ungültige Eingabe' });
        return;
      }
      if (!res.isCorrect) {
        allOk = false;
        if (!errType && res.diagnosticType) errType = res.diagnosticType;
        if (!diagMsg && res.diagnosticMessage) diagMsg = res.diagnosticMessage;
      }
    }

    void recordSkillAttempt(task.generatorId, allOk, errType);
    setScore((s) => ({
      correct: s.correct + (allOk ? 1 : 0),
      total: s.total + 1,
      streak: allOk ? s.streak + 1 : 0,
    }));

    if (allOk) {
      setFeedback({ ok: true, msg: 'Volltreffer! Weiter zur nächsten Aufgabe...' });
      setTimeout(() => pickNextTask(selected), 650);
    } else {
      setFeedback({
        ok: false,
        msg: diagMsg || 'Knapp daneben – schau kurz auf die Lösung und schnapp dir die nächste!',
      });
    }
  };

  if (!selected) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            Handrechen-Drills (2–3 Min. Sprints)
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Kurze, fokussierte Rechen-Sprints für Kopfrechen-Reflexe ohne Taschenrechner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DRILL_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <Timer className="w-3.5 h-3.5" />
                  {Math.round(preset.durationSec / 60)} Minuten
                </div>
                <h2 className="font-bold text-base">{preset.title}</h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {preset.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startDrill(preset)}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Sprint starten
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        <div>
          <div className="text-xs text-[var(--text-muted)]">Aktiver Sprint</div>
          <div className="font-bold">{selected.title}</div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-xs text-[var(--text-muted)]">Treffer</div>
            <div className="font-bold text-green-700 dark:text-green-400">
              {score.correct} / {score.total}
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl font-mono text-lg font-bold ${
              timeLeft <= 20
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                : 'bg-[var(--bg-subtle)]'
            }`}
          >
            {mm}:{ss}
          </div>
        </div>
      </div>

      {finished ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Zeit abgelaufen!</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Du hast <strong>{score.correct}</strong> von <strong>{score.total}</strong> Aufgaben fehlerfrei im Kopf bzw. von Hand gelöst.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startDrill(selected)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Noch eine Runde
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              Andere Drills
            </button>
          </div>
        </div>
      ) : (
        task && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xs">
            <div className="text-[15px]">
              <MathText text={task.prompt} />
            </div>

            <div className="space-y-3">
              {task.checkpoints.map((cp) => (
                <div key={cp.id}>
                  <div className="text-xs font-semibold mb-1">
                    <MathText text={cp.label} />
                  </div>
                  {cp.kind === 'scalar' && (
                    <SmartScalarInput
                      value={typeof answers[cp.id] === 'string' ? (answers[cp.id] as string) : ''}
                      onChange={(v) => setAnswers((a) => ({ ...a, [cp.id]: v }))}
                      unit={cp.unit}
                      onEnter={handleCheck}
                    />
                  )}
                  {(cp.kind === 'vector2' || cp.kind === 'vector3') && (
                    <VectorGridInput
                      dim={cp.kind === 'vector2' ? 2 : 3}
                      values={Array.isArray(answers[cp.id]) ? (answers[cp.id] as string[]) : []}
                      onChange={(v) => setAnswers((a) => ({ ...a, [cp.id]: v }))}
                      onEnter={handleCheck}
                    />
                  )}
                  {cp.kind === 'matrix' && cp.matrixShape && (
                    <MatrixGridInput
                      rows={cp.matrixShape.rows}
                      cols={cp.matrixShape.cols}
                      values={Array.isArray(answers[cp.id]) ? (answers[cp.id] as string[]) : []}
                      onChange={(v) => setAnswers((a) => ({ ...a, [cp.id]: v }))}
                      onEnter={handleCheck}
                    />
                  )}
                  {(cp.kind === 'choice' || cp.kind === 'mistake-line') && cp.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cp.options.map((opt) => {
                        const sel = answers[cp.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setAnswers((a) => ({ ...a, [cp.id]: opt.id }))}
                            className={`p-2.5 rounded-lg border text-sm text-left cursor-pointer ${
                              sel
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                                : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)]'
                            }`}
                          >
                            <MathText text={opt.label} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-sm ${
                  feedback.ok
                    ? 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800'
                }`}
              >
                <MathText text={feedback.msg} />
                {!feedback.ok && (
                  <div className="mt-1.5 text-xs flex flex-wrap gap-3">
                    {task.checkpoints.map((cp) => (
                      <span key={cp.id}>
                        Lösung: <Formula latex={cp.solutionLatex} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleCheck}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
              >
                Prüfen
              </button>
              <button
                type="button"
                onClick={() => pickNextTask(selected)}
                className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                Überspringen →
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
