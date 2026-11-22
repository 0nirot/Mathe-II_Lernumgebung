import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Fraction } from '../../core/exactMath';
import { Formula } from '../MathText';

/** 1. Interaktive Gauß- & Gauß-Jordan-Werkbank */
export function GaussWorkbenchViz() {
  const [mode, setMode] = useState<'lgs' | 'inverse'>('lgs');

  const initRows = (m: 'lgs' | 'inverse'): Fraction[][] =>
    m === 'lgs'
      ? [
          [new Fraction(-1), new Fraction(1), new Fraction(1), new Fraction(0)],
          [new Fraction(1), new Fraction(-3), new Fraction(-2), new Fraction(5)],
          [new Fraction(5), new Fraction(1), new Fraction(4), new Fraction(3)],
        ]
      : [
          [new Fraction(3), new Fraction(0), new Fraction(2), new Fraction(1), new Fraction(0), new Fraction(0)],
          [new Fraction(2), new Fraction(0), new Fraction(-2), new Fraction(0), new Fraction(1), new Fraction(0)],
          [new Fraction(0), new Fraction(1), new Fraction(1), new Fraction(0), new Fraction(0), new Fraction(1)],
        ];

  const [rows, setRows] = useState<Fraction[][]>(() => initRows('lgs'));
  const [log, setLog] = useState<string[]>(['Startmatrix aus den Vorlesungsfolien geladen.']);
  const [targetRow, setTargetRow] = useState(1);
  const [sourceRow, setSourceRow] = useState(0);
  const [factorNum, setFactorNum] = useState('1');
  const [scaleRow, setScaleRow] = useState(0);
  const [scaleDiv, setScaleDiv] = useState('5');

  const switchMode = (m: 'lgs' | 'inverse') => {
    setMode(m);
    setRows(initRows(m));
    setLog([m === 'lgs' ? 'LGS-Beispiel (Folie LGS S. 7) geladen.' : 'Gauß-Jordan-Beispiel (Folie Matrizen S. 24) geladen.']);
  };

  const applyAdd = () => {
    if (targetRow === sourceRow) return;
    const raw = factorNum.trim().replace(',', '.');
    const parts = raw.split('/');
    const f =
      parts.length === 2 && Number(parts[1]) !== 0
        ? new Fraction(Number(parts[0]), Number(parts[1]))
        : new Fraction(Number(raw));
    if (!Number.isFinite(f.toNumber())) return;

    setRows((prev) =>
      prev.map((r, idx) =>
        idx === targetRow ? r.map((v, c) => v.add(prev[sourceRow][c].mul(f))) : r
      )
    );
    setLog((l) => [
      `Zeile ${targetRow + 1} ← Zeile ${targetRow + 1} + (${f.toString()}) · Zeile ${sourceRow + 1}`,
      ...l.slice(0, 5),
    ]);
  };

  const applySwap = () => {
    if (targetRow === sourceRow) return;
    setRows((prev) => {
      const next = [...prev];
      [next[targetRow], next[sourceRow]] = [next[sourceRow], next[targetRow]];
      return next;
    });
    setLog((l) => [`Zeile ${targetRow + 1} ↔ Zeile ${sourceRow + 1} vertauscht`, ...l.slice(0, 5)]);
  };

  const applyDivide = () => {
    const val = Number(scaleDiv.trim().replace(',', '.'));
    if (!Number.isFinite(val) || val === 0) return;
    const f = new Fraction(val);
    setRows((prev) =>
      prev.map((r, idx) => (idx === scaleRow ? r.map((v) => v.div(f)) : r))
    );
    setLog((l) => [`Zeile ${scaleRow + 1} ÷ (${f.toString()})`, ...l.slice(0, 5)]);
  };

  const isIdentityLeft = rows.every((r, i) =>
    [0, 1, 2].every((j) => r[j].equals(i === j ? 1 : 0))
  );
  const isUpperTriangular =
    rows[1][0].isZero() && rows[2][0].isZero() && rows[2][1].isZero();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => switchMode('lgs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
              mode === 'lgs' ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)]'
            }`}
          >
            LGS-Modus [A | c] (Folie S. 7)
          </button>
          <button
            type="button"
            onClick={() => switchMode('inverse')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
              mode === 'inverse' ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)]'
            }`}
          >
            Gauß-Jordan [A | E] (Folie S. 24)
          </button>
        </div>
        <button
          type="button"
          onClick={() => switchMode(mode)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
        </button>
      </div>

      {/* Augmented Matrix Display */}
      <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] overflow-x-auto">
        <table className="mx-auto border-collapse font-mono text-sm">
          <thead>
            <tr className="text-[11px] text-[var(--text-muted)]">
              <th className="px-2 pb-1">Zeile</th>
              <th className="px-3 pb-1">x</th>
              <th className="px-3 pb-1">y</th>
              <th className="px-3 pb-1 border-r-2 border-[var(--text-main)]">z</th>
              {mode === 'lgs' ? (
                <th className="px-4 pb-1 text-blue-600 dark:text-blue-400">c</th>
              ) : (
                <>
                  <th className="px-3 pb-1 text-blue-600 dark:text-blue-400">e₁</th>
                  <th className="px-3 pb-1 text-blue-600 dark:text-blue-400">e₂</th>
                  <th className="px-3 pb-1 text-blue-600 dark:text-blue-400">e₃</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-t border-[var(--border-color)]">
                <td className="px-2 py-2 text-xs font-bold text-[var(--text-muted)]">Z{ri + 1}</td>
                {r.map((val, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 text-center font-semibold ${
                      ci === 2 ? 'border-r-2 border-[var(--text-main)]' : ''
                    } ${ci < 3 && ri > ci && val.isZero() ? 'text-green-600 dark:text-green-400' : ''} ${
                      ci >= 3 ? 'text-blue-700 dark:text-blue-300' : ''
                    }`}
                  >
                    {val.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {isIdentityLeft && (
          <div className="mt-3 text-center text-xs font-bold text-green-700 dark:text-green-400">
            ✓ Einheitsmatrix links erreicht! Rechts steht jetzt exakt die {mode === 'lgs' ? 'Lösung (x, y, z)' : 'inverse Matrix A⁻¹'}!
          </div>
        )}
        {!isIdentityLeft && isUpperTriangular && mode === 'lgs' && (
          <div className="mt-3 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">
            ✓ Stufenform erreicht! Jetzt kannst du z direkt ablesen und rückwärts einsetzen.
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2">
          <div className="font-semibold">Zeilen addieren / tauschen:</div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span>Z</span>
            <select value={targetRow} onChange={(e) => setTargetRow(Number(e.target.value))} className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)]">
              <option value={0}>1</option><option value={1}>2</option><option value={2}>3</option>
            </select>
            <span>← selbst +</span>
            <input
              type="text"
              value={factorNum}
              onChange={(e) => setFactorNum(e.target.value)}
              className="w-14 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-center font-mono"
            />
            <span>· Z</span>
            <select value={sourceRow} onChange={(e) => setSourceRow(Number(e.target.value))} className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)]">
              <option value={0}>1</option><option value={1}>2</option><option value={2}>3</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={applyAdd} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold cursor-pointer">
              Addieren
            </button>
            <button type="button" onClick={applySwap} className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] font-semibold cursor-pointer">
              Z{targetRow + 1} ↔ Z{sourceRow + 1} tauschen
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2">
          <div className="font-semibold">Zeile durch Zahl teilen (Normieren auf 1):</div>
          <div className="flex items-center gap-2">
            <span>Zeile</span>
            <select value={scaleRow} onChange={(e) => setScaleRow(Number(e.target.value))} className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)]">
              <option value={0}>1</option><option value={1}>2</option><option value={2}>3</option>
            </select>
            <span>÷</span>
            <input
              type="text"
              value={scaleDiv}
              onChange={(e) => setScaleDiv(e.target.value)}
              className="w-16 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-center font-mono"
            />
            <button type="button" onClick={applyDivide} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold cursor-pointer">
              Teilen
            </button>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Protokoll: {log[0]}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 2. Interaktives Falk-Schema (Folie Matrizen S. 19-20) */
export function FalkSchemaViz() {
  const A = [
    [1, 4, 2],
    [4, 0, -3],
    [2, 2, 0],
  ];
  const B = [
    [1, 1, 0],
    [-2, 3, 5],
    [0, 1, 4],
  ];
  const C = A.map((row) =>
    [0, 1, 2].map((col) => row.reduce((sum, val, k) => sum + val * B[k][col], 0))
  );

  const [active, setActive] = useState<[number, number]>([0, 0]);
  const [ar, ac] = active;
  const formulaStr = `c_{${ar + 1},${ac + 1}} = (${A[ar][0]})\\cdot(${B[0][ac]}) + (${A[ar][1]})\\cdot(${B[1][ac]}) + (${A[ar][2]})\\cdot(${B[2][ac]}) = ${C[ar][ac]}`;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto flex justify-center">
        <div className="inline-grid grid-cols-6 gap-1 text-center font-mono text-sm">
          {/* Top 3 rows: empty 3 cols + B */}
          {B.map((row, r) => (
            <div key={`b-${r}`} className="contents">
              <div className="w-11 h-10" />
              <div className="w-11 h-10" />
              <div className="w-11 h-10 flex items-center justify-end pr-2 text-xs font-sans font-bold text-green-700 dark:text-green-400">
                {r === 1 ? 'B →' : ''}
              </div>
              {row.map((val, c) => (
                <div
                  key={`b-${r}-${c}`}
                  className={`w-11 h-10 flex items-center justify-center rounded-lg border font-semibold transition-colors ${
                    c === ac
                      ? 'border-green-500 bg-green-100 dark:bg-green-950/60 text-green-900 dark:text-green-100'
                      : 'border-[var(--border-color)] bg-[var(--bg-subtle)]'
                  }`}
                >
                  {val}
                </div>
              ))}
            </div>
          ))}

          {/* Bottom 3 rows: A + C */}
          {A.map((row, r) => (
            <div key={`a-${r}`} className="contents">
              {row.map((val, c) => (
                <div
                  key={`a-${r}-${c}`}
                  className={`w-11 h-10 flex items-center justify-center rounded-lg border font-semibold transition-colors ${
                    r === ar
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                      : 'border-[var(--border-color)] bg-[var(--bg-subtle)]'
                  }`}
                >
                  {val}
                </div>
              ))}
              {C[r].map((val, c) => {
                const isSel = r === ar && c === ac;
                return (
                  <button
                    key={`c-${r}-${c}`}
                    type="button"
                    onMouseEnter={() => setActive([r, c])}
                    onClick={() => setActive([r, c])}
                    className={`w-11 h-10 flex items-center justify-center rounded-lg border font-bold cursor-pointer transition-all ${
                      isSel
                        ? 'border-purple-600 bg-purple-600 text-white scale-105 shadow-xs'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-purple-50 dark:hover:bg-purple-950/30'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 text-center space-y-1">
        <div className="text-xs text-[var(--text-muted)]">
          Klicke oder fahre über ein Ergebnisfeld rechts unten (Originalbeispiel Matrizen S. 19–20):
        </div>
        <Formula latex={formulaStr} display />
      </div>
    </div>
  );
}

/** 3. Sarrus-Diagonallaser & Laplace-Schachbrett */
export function SarrusLaplaceViz() {
  const [tab, setTab] = useState<'sarrus' | 'laplace'>('sarrus');
  const [diagIdx, setDiagIdx] = useState(0); // 0..2 main (+), 3..5 anti (-)
  const [lapPos, setLapPos] = useState<[number, number]>([0, 0]);

  const S = [
    [2, 1, 0],
    [1, 3, 2],
    [4, 0, 1],
  ];
  const extS = S.map((r) => [...r, r[0], r[1]]);
  const diags: { cells: [number, number][]; sign: '+' | '-'; prod: number; expr: string }[] = [
    { cells: [[0, 0], [1, 1], [2, 2]], sign: '+', prod: 6, expr: '2·3·1 = 6' },
    { cells: [[0, 1], [1, 2], [2, 3]], sign: '+', prod: 8, expr: '1·2·4 = 8' },
    { cells: [[0, 2], [1, 3], [2, 4]], sign: '+', prod: 0, expr: '0·1·0 = 0' },
    { cells: [[2, 0], [1, 1], [0, 2]], sign: '-', prod: 0, expr: '4·3·0 = 0' },
    { cells: [[2, 1], [1, 2], [0, 3]], sign: '-', prod: 0, expr: '0·2·2 = 0' },
    { cells: [[2, 2], [1, 3], [0, 4]], sign: '-', prod: 1, expr: '1·1·1 = 1' },
  ];

  const L4 = [
    [2, 0, 0, 0],
    [1, 3, 1, 0],
    [4, 2, 1, 1],
    [0, 1, 2, 2],
  ];
  const [lr, lc] = lapPos;
  const lapSign = (lr + lc) % 2 === 0 ? '+' : '−';

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('sarrus')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
            tab === 'sarrus' ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)]'
          }`}
        >
          Regel von Sarrus (3×3)
        </button>
        <button
          type="button"
          onClick={() => setTab('laplace')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
            tab === 'laplace' ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)]'
          }`}
        >
          Laplace-Schachbrett (4×4)
        </button>
      </div>

      {tab === 'sarrus' ? (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="inline-grid grid-cols-5 gap-1.5 font-mono text-sm">
              {extS.map((row, r) =>
                row.map((val, c) => {
                  const inDiag = diags[diagIdx].cells.some(([dr, dc]) => dr === r && dc === c);
                  const isMain = diags[diagIdx].sign === '+';
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`w-11 h-10 flex items-center justify-center rounded-lg border font-bold transition-all ${
                        inDiag
                          ? isMain
                            ? 'bg-green-600 text-white border-green-600 scale-105'
                            : 'bg-red-600 text-white border-red-600 scale-105'
                          : c >= 3
                            ? 'border-dashed border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                      }`}
                    >
                      {val}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {diags.map((d, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDiagIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                  diagIdx === idx
                    ? d.sign === '+'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-red-600 text-white border-red-600'
                    : 'border-[var(--border-color)]'
                }`}
              >
                {d.sign === '+' ? `Haupt ${idx + 1} (+)` : `Neben ${idx - 2} (−)`}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-center text-xs">
            Aktive Diagonale: <strong>{diags[diagIdx].sign} ({diags[diagIdx].expr})</strong> · Gesamtergebnis: <Formula latex="(6 + 8 + 0) - (0 + 0 + 1) = 13" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="inline-grid grid-cols-4 gap-1.5 font-mono text-sm">
              {L4.map((row, r) =>
                row.map((val, c) => {
                  const isPivot = r === lr && c === lc;
                  const struck = (r === lr || c === lc) && !isPivot;
                  const signChar = (r + c) % 2 === 0 ? '+' : '−';
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => setLapPos([r, c])}
                      className={`w-14 h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isPivot
                          ? 'bg-blue-600 text-white border-blue-600 scale-105'
                          : struck
                            ? 'bg-[var(--bg-subtle)] opacity-35 line-through border-[var(--border-color)]'
                            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 font-bold'
                      }`}
                    >
                      <span className="text-[10px] leading-none opacity-75">{signChar}</span>
                      <span>{val}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-center text-xs">
            Klicke ein beliebiges Element an: Gewählt ist <Formula latex={`a_{${lr + 1},${lc + 1}} = ${L4[lr][lc]}`} /> mit Schachbrett-Vorzeichen <strong>{lapSign}</strong>. Die 9 gelben Felder bilden die <Formula latex="3\times 3" />-Unterdeterminante <Formula latex={`D_{${lr + 1},${lc + 1}}`} />!
          </div>
        </div>
      )}
    </div>
  );
}

/** 4. Determinante als 2D-Flächenfaktor */
export function DetArea2DViz() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);
  const [d, setD] = useState(1.5);

  const det = a * d - b * c;
  const size = 280;
  const range = 4;
  const px = (x: number) => ((x + range) / (2 * range)) * size;
  const py = (y: number) => ((range - y) / (2 * range)) * size;

  // Image of unit square corners (0,0), (1,0), (1,1), (0,1)
  const p0: [number, number] = [0, 0];
  const p1: [number, number] = [a, c];
  const p2: [number, number] = [a + b, c + d];
  const p3: [number, number] = [b, d];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-6 flex justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
          {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
            <g key={v}>
              <line x1={px(v)} y1={0} x2={px(v)} y2={size} stroke="currentColor" strokeOpacity={v === 0 ? 0.4 : 0.1} />
              <line x1={0} y1={py(v)} x2={size} y2={py(v)} stroke="currentColor" strokeOpacity={v === 0 ? 0.4 : 0.1} />
            </g>
          ))}
          {/* Original unit square */}
          <polygon
            points={`${px(0)},${py(0)} ${px(1)},${py(0)} ${px(1)},${py(1)} ${px(0)},${py(1)}`}
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeDasharray="3 3"
          />
          {/* Transformed parallelogram */}
          <polygon
            points={`${px(p0[0])},${py(p0[1])} ${px(p1[0])},${py(p1[1])} ${px(p2[0])},${py(p2[1])} ${px(p3[0])},${py(p3[1])}`}
            fill={Math.abs(det) < 1e-6 ? '#dc2626' : det > 0 ? '#2563eb' : '#9333ea'}
            fillOpacity="0.32"
            stroke={Math.abs(det) < 1e-6 ? '#dc2626' : det > 0 ? '#2563eb' : '#9333ea'}
            strokeWidth="2.5"
          />
        </svg>
      </div>

      <div className="lg:col-span-6 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { lbl: 'a₁₁', val: a, set: setA },
            { lbl: 'a₁₂', val: b, set: setB },
            { lbl: 'a₂₁', val: c, set: setC },
            { lbl: 'a₂₂', val: d, set: setD },
          ].map((s) => (
            <div key={s.lbl} className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)]">
              <div className="flex justify-between text-xs">
                <span>{s.lbl}</span>
                <strong>{s.val}</strong>
              </div>
              <input
                type="range"
                min={-2}
                max={2.5}
                step={0.5}
                value={s.val}
                onChange={(e) => s.set(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className={`p-3.5 rounded-xl border ${Math.abs(det) < 1e-6 ? 'border-red-500 bg-red-50 dark:bg-red-950/40' : 'border-[var(--border-color)] bg-[var(--bg-subtle)]'}`}>
          <Formula latex={`\\det(A) = (${a})(${d}) - (${b})(${c}) = ${Number(det.toFixed(2))}`} display />
          <div className="text-xs mt-1 text-center">
            {Math.abs(det) < 1e-6
              ? 'Fläche kollabiert zu 0! → Keine Inverse möglich (nicht umkehrbar)!'
              : det < 0
                ? `Fläche = ${Math.abs(det).toFixed(2)} (gespiegelt, da det < 0). Inverse existiert!`
                : `Fläche = ${det.toFixed(2)} (Einheitsquadrat vergrößert). Inverse existiert!`}
          </div>
        </div>
      </div>
    </div>
  );
}
