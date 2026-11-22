import {
  BookOpen,
  Brain,
  ClipboardCheck,
  FileText,
  Flame,
  GraduationCap,
  Home,
  Lock,
  Moon,
  Sun,
  Trophy,
} from 'lucide-react';
import { useEffect } from 'react';
import { DashboardView } from './components/DashboardView';
import { DiagnosticCheckM0 } from './components/DiagnosticCheckM0';
import { DrillView } from './components/DrillView';
import { ExamView } from './components/ExamView';
import { FormulaSheetView } from './components/FormulaSheetView';
import { LessonView } from './components/LessonView';
import { getAllLessons, ModuleOverview } from './components/ModuleOverview';
import { countDueSrsCards, SrsView } from './components/SrsView';
import { MODULES } from './content/modules';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { hydrated, hydrate, theme, toggleTheme, route, navigate, skillStats, srsQueue } =
    useAppStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const allLessons = getAllLessons();
  const dueSrsCount = countDueSrsCards(skillStats, srsQueue);

  const renderMain = () => {
    if (!hydrated) {
      return (
        <div className="flex items-center justify-center h-64 text-sm text-[var(--text-muted)]">
          Lernumgebung wird geladen...
        </div>
      );
    }
    switch (route.view) {
      case 'dashboard':
        return <DashboardView />;
      case 'diagnostic-m0':
        return <DiagnosticCheckM0 />;
      case 'drills':
        return <DrillView />;
      case 'srs':
        return <SrsView />;
      case 'exam':
        return <ExamView />;
      case 'formula-sheet':
        return <FormulaSheetView />;
      case 'module':
        return <ModuleOverview moduleId={route.moduleId} />;
      case 'lesson': {
        const lesson = allLessons.find((l) => l.id === route.lessonId);
        return lesson ? <LessonView lesson={lesson} /> : <DashboardView />;
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-main)]">
      {/* Left Sidebar (Desktop-first) */}
      <aside className="w-64 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col print:hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm">Mathe II & 3D-CG</div>
            <div className="text-[11px] text-[var(--text-muted)]">M0–M5 · Klausur ohne TR</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-sm">
          <button
            type="button"
            onClick={() => navigate({ view: 'dashboard' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium cursor-pointer transition-colors ${
              route.view === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Home className="w-4 h-4" />
            Übersicht
          </button>

          <button
            type="button"
            onClick={() => navigate({ view: 'diagnostic-m0' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium cursor-pointer transition-colors ${
              route.view === 'diagnostic-m0'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            M0-Eingangscheck
          </button>

          <button
            type="button"
            onClick={() => navigate({ view: 'srs' })}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-medium cursor-pointer transition-colors ${
              route.view === 'srs'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Brain className="w-4 h-4" />
              Wiederholung (SRS)
            </span>
            {dueSrsCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  route.view === 'srs'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                }`}
              >
                {dueSrsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate({ view: 'drills' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium cursor-pointer transition-colors ${
              route.view === 'drills'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            Handrechen-Drills
          </button>

          <button
            type="button"
            onClick={() => navigate({ view: 'exam' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium cursor-pointer transition-colors ${
              route.view === 'exam'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Prüfungsmodus
          </button>

          <button
            type="button"
            onClick={() => navigate({ view: 'formula-sheet' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium cursor-pointer transition-colors ${
              route.view === 'formula-sheet'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            A4-Formelblatt
          </button>

          <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Module (M0–M5)
          </div>

          {MODULES.map((mod) => {
            const active =
              (route.view === 'module' && route.moduleId === mod.id) ||
              (route.view === 'lesson' &&
                allLessons.find((l) => l.id === route.lessonId)?.moduleId === mod.id);

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => navigate({ view: 'module', moduleId: mod.id })}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'hover:bg-[var(--bg-subtle)]'
                } ${!mod.available ? 'opacity-60' : ''}`}
              >
                <span className="flex items-center gap-2 truncate">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    M{mod.number} · {mod.shortTitle}
                  </span>
                </span>
                {!mod.available && <Lock className="w-3 h-3 shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => void toggleTheme()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] text-xs font-semibold cursor-pointer"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                Dark Mode aktivieren
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5" />
                Helles Papier-Design
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{renderMain()}</main>
    </div>
  );
}
