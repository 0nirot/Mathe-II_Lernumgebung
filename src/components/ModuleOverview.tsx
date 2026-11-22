import { ArrowRight, CheckCircle2, ClipboardCheck, Clock, Lock, PlayCircle } from 'lucide-react';
import { M0_LESSONS } from '../content/m0Content';
import { M1_LESSONS } from '../content/m1Content';
import { M2_LESSONS } from '../content/m2Content';
import { M3_LESSONS } from '../content/m3Content';
import { M4_LESSONS } from '../content/m4Content';
import { M5_LESSONS } from '../content/m5Content';
import { MODULES } from '../content/modules';
import { useAppStore } from '../store/useAppStore';
import type { LessonDefinition, ModuleId } from '../types/learning';

const LESSONS_BY_MODULE: Record<ModuleId, LessonDefinition[]> = {
  m0: M0_LESSONS,
  m1: M1_LESSONS,
  m2: M2_LESSONS,
  m3: M3_LESSONS,
  m4: M4_LESSONS,
  m5: M5_LESSONS,
};

export function getAllLessons(): LessonDefinition[] {
  return [
    ...M0_LESSONS,
    ...M1_LESSONS,
    ...M2_LESSONS,
    ...M3_LESSONS,
    ...M4_LESSONS,
    ...M5_LESSONS,
  ];
}

export function ModuleOverview({ moduleId }: { moduleId: ModuleId }) {
  const { lessonProgress, diagnosticResults, navigate } = useAppStore();
  const mod = MODULES.find((m) => m.id === moduleId);
  const lessons = LESSONS_BY_MODULE[moduleId] ?? [];

  if (!mod) return null;

  if (!mod.available) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center space-y-3">
        <Lock className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
        <h1 className="text-xl font-bold">
          Modul {mod.number}: {mod.title}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">{mod.description}</p>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Geplant für Etappe {mod.implementedInStage}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Modul {mod.number} · {mod.sourceSlides}
        </div>
        <h1 className="text-2xl font-bold">{mod.title}</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{mod.description}</p>

        {moduleId === 'm0' && (
          <div className="pt-3">
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-blue-600" />
                  Unsicher, was du noch aus der Realschule kannst?
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Starte den optionalen 8-Fragen-Eingangscheck (ca. 5 Min.) – er markiert dir genau, was du überspringen kannst.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate({ view: 'diagnostic-m0' })}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                Eingangscheck starten →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {lessons.map((lesson) => {
          const prog = lessonProgress[lesson.id];
          const status = prog?.status ?? 'not_started';
          const diagForLesson = Object.values(diagnosticResults).filter(
            (d) => d.lessonId === lesson.id
          );
          const allDiagPassed =
            diagForLesson.length > 0 && diagForLesson.every((d) => d.passed);
          const someDiagFailed =
            diagForLesson.length > 0 && diagForLesson.some((d) => !d.passed);

          return (
            <div
              key={lesson.id}
              onClick={() => navigate({ view: 'lesson', lessonId: lesson.id })}
              className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-400 dark:hover:border-blue-600 p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Lektion {mod.number}.{lesson.order}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{lesson.estimatedMinutes} Min.
                  </span>
                  {status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                      <CheckCircle2 className="w-3 h-3" /> Abgeschlossen
                    </span>
                  )}
                  {status === 'in_progress' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      <PlayCircle className="w-3 h-3" /> Phase {(prog?.currentPhase ?? 0) + 1}/6
                    </span>
                  )}
                  {allDiagPassed && status !== 'completed' && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-300 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800">
                      Check: Überspringbar
                    </span>
                  )}
                  {someDiagFailed && status !== 'completed' && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      Check: Auffrischen empfohlen
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {lesson.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{lesson.subtitle}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Öffnen <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
