import { CheckSquare, FileText, Printer } from 'lucide-react';
import { FORMULA_SHEET_ITEMS } from '../content/modules';
import { useAppStore } from '../store/useAppStore';
import { Formula } from './MathText';

export function FormulaSheetView() {
  const { formulaCopied, toggleFormulaCopied } = useAppStore();
  const frontItems = FORMULA_SHEET_ITEMS.filter((f) => f.side === 'front');
  const backItems = FORMULA_SHEET_ITEMS.filter((f) => f.side === 'back');

  const copiedCount = FORMULA_SHEET_ITEMS.filter((f) => formulaCopied[f.id]).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Mein 1-Blatt-Formelblatt (DIN A4, Vorder- & Rückseite)
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Kompakte Vorlage für deine selbstgeschriebene Klausur-Formelsammlung – reine Formeln, 1-Zeilen-Einsatzbedingung und Stolperfallen (ohne Beispiele).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 inline-flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            {copiedCount} / {FORMULA_SHEET_ITEMS.length} übertragen
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-semibold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Druckansicht
          </button>
        </div>
      </div>

      {/* Vorderseite */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div>
            <h2 className="text-lg font-bold">Vorderseite (DIN A4)</h2>
            <p className="text-xs text-[var(--text-muted)]">
              M0 Grundlagen/Trig · M1 Vektoralgebra · M2 LGS, Matrizen & Determinanten
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)]">Seite 1/2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frontItems.map((item) => {
            const done = !!formulaCopied[item.id];
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border space-y-2 transition-colors break-inside-avoid ${
                  done
                    ? 'border-green-300 dark:border-green-800 bg-green-50/40 dark:bg-green-950/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-page)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {item.section}
                    </div>
                    <div className="font-bold text-sm">{item.title}</div>
                  </div>
                  <label className="inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer shrink-0 print:hidden">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => void toggleFormulaCopied(item.id)}
                      className="accent-green-600 w-3.5 h-3.5"
                    />
                    Übertragen
                  </label>
                </div>
                <div className="py-1 overflow-x-auto">
                  <Formula latex={item.latex} display />
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  <strong>Wann:</strong> {item.whenToUse}
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Falle:</strong> {item.pitfall}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rückseite */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xs print:break-before-page">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div>
            <h2 className="text-lg font-bold">Rückseite (DIN A4)</h2>
            <p className="text-xs text-[var(--text-muted)]">
              M3 Analytische Geometrie · M4 2D/3D-Transformationen · M5 Interpolation
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)]">Seite 2/2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {backItems.map((item) => {
            const done = !!formulaCopied[item.id];
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border space-y-2 transition-colors break-inside-avoid ${
                  done
                    ? 'border-green-300 dark:border-green-800 bg-green-50/40 dark:bg-green-950/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-page)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {item.section}
                    </div>
                    <div className="font-bold text-sm">{item.title}</div>
                  </div>
                  <label className="inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer shrink-0 print:hidden">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => void toggleFormulaCopied(item.id)}
                      className="accent-green-600 w-3.5 h-3.5"
                    />
                    Übertragen
                  </label>
                </div>
                <div className="py-1 overflow-x-auto">
                  <Formula latex={item.latex} display />
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  <strong>Wann:</strong> {item.whenToUse}
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Falle:</strong> {item.pitfall}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
