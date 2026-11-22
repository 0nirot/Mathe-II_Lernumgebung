import {
  ArrowRight,
  Brain,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Flame,
  Lock,
  Trophy,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { EXAM_DATE_ISO, MODULES } from '../content/modules';
import { useAppStore } from '../store/useAppStore';
import { getAllLessons } from './ModuleOverview';
import { countDueSrsCards } from './SrsView';

function daysUntilExam(): number {
  const now = new Date();
  const exam = new Date(`${EXAM_DATE_ISO}T09:00:00`);
  const diffMs = exam.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function DashboardView() {
  const {
    lessonProgress,
    skillStats,
    diagnosticResults,
    srsQueue,
    examHistory,
    navigate,
    exportBackupJson,
    importBackupJson,
  } = useAppStore();
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const allLessons = getAllLessons();
  const completedCount = allLessons.filter(
    (l) => lessonProgress[l.id]?.status === 'completed'
  ).length;
  const totalAttempts = Object.values(skillStats).reduce((s, r) => s + r.attempts, 0);
  const totalCorrect = Object.values(skillStats).reduce((s, r) => s + r.correct, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
  const hasDiagnostic = Object.keys(diagnosticResults).length > 0;
  const dueSrsCount = countDueSrsCards(skillStats, srsQueue);
  const lastExam = examHistory[0] ?? null;
  const daysLeft = daysUntilExam();

  const handleExport = async () => {
    const json = await exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathe-lernstand-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotice('Lernstand als JSON exportiert.');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importBackupJson(text);
      setBackupNotice('Backup erfolgreich wiederhergestellt!');
    } catch {
      setBackupNotice('Fehler beim Import: Bitte eine gültige Backup-JSON auswählen.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero & Exam Countdown */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <CalendarClock className="w-3.5 h-3.5" />
            Prüfung am 15.12.2026 · Noch {daysLeft} Tage · Ohne Taschenrechner
          </div>
          <h1 className="text-2xl font-bold">Mathe II & 3D-Computergrafik</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Alle 6 Module (M0–M5), SM-2-Wiederholung, 1-Blatt-A4-Formelsammlung und der Klausur-Simulator sind freigeschaltet. Alle Module sind jederzeit frei begehbar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => navigate({ view: 'diagnostic-m0' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            {hasDiagnostic ? 'M0-Check' : 'M0-Eingangscheck'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ view: 'srs' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] text-sm font-semibold cursor-pointer"
          >
            <Brain className="w-4 h-4 text-blue-600" />
            SRS ({dueSrsCount} fällig)
          </button>
          <button
            type="button"
            onClick={() => navigate({ view: 'exam' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] text-sm font-semibold cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-emerald-600" />
            Prüfungsmodus
          </button>
          <button
            type="button"
            onClick={() => navigate({ view: 'drills' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] text-sm font-semibold cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            Drills
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="text-xs text-[var(--text-muted)]">Abgeschlossene Lektionen (M0–M5)</div>
          <div className="text-2xl font-bold mt-1">
            {completedCount} / {allLessons.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="text-xs text-[var(--text-muted)]">Gelöste Übungsaufgaben</div>
          <div className="text-2xl font-bold mt-1">{totalAttempts}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="text-xs text-[var(--text-muted)]">Trefferquote (ohne TR)</div>
          <div className="text-2xl font-bold mt-1 text-green-700 dark:text-green-400">
            {accuracy !== null ? `${accuracy} %` : '—'}
          </div>
        </div>
        <div
          onClick={() => navigate({ view: 'exam' })}
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-400 p-4 cursor-pointer transition-colors"
        >
          <div className="text-xs text-[var(--text-muted)]">Letzte Klausur-Simulation</div>
          <div className="text-2xl font-bold mt-1">
            {lastExam ? `${lastExam.percent} %` : 'Noch keine'}
          </div>
          {lastExam && (
            <div className="text-[11px] text-[var(--text-muted)] truncate">
              {lastExam.presetTitle}
            </div>
          )}
        </div>
      </div>

      {/* Module Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Lernmodule (empfohlene Reihenfolge)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod) => {
            const modLessons = allLessons.filter((l) => l.moduleId === mod.id);
            const modDone = modLessons.filter(
              (l) => lessonProgress[l.id]?.status === 'completed'
            ).length;

            return (
              <div
                key={mod.id}
                onClick={() => navigate({ view: 'module', moduleId: mod.id })}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all cursor-pointer ${
                  mod.available
                    ? 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-400 dark:hover:border-blue-600 shadow-xs'
                    : 'border-dashed border-[var(--border-color)] bg-[var(--bg-subtle)]/50 opacity-75'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Modul {mod.number}
                    </span>
                    {mod.available ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {modDone}/{modLessons.length} fertig
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)]">
                        <Lock className="w-3 h-3" />
                        Etappe {mod.implementedInStage}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base">{mod.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs">
                  <span className="text-[var(--text-muted)] truncate pr-2">{mod.sourceSlides}</span>
                  {mod.available && (
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                      Starten <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Local Backup Bar */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-[var(--text-muted)]">
          Dein Lernstand (Lektionen, SRS-Karten, Klausur-Historie, Formelblatt) wird{' '}
          <strong>100 % lokal im Browser (IndexedDB)</strong> gespeichert.
          {backupNotice && (
            <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
              {backupNotice}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Backup exportieren
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] font-medium cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Backup laden
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={(e) => void handleImport(e)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
