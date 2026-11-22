import { useState } from 'react';
import { Formula } from '../MathText';

export function Line2DViz() {
  const [m, setM] = useState(2);
  const [c, setC] = useState(1);

  const size = 320;
  const range = 6;
  const toPxX = (x: number) => ((x + range) / (2 * range)) * size;
  const toPxY = (y: number) => ((range - y) / (2 * range)) * size;

  const x1 = -range;
  const y1 = m * x1 + c;
  const x2 = range;
  const y2 = m * x2 + c;

  const cSign = c === 0 ? '' : c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  const eqLatex = `f(x) = ${m}x ${cSign}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-6 flex justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[320px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]"
        >
          {/* Grid */}
          {Array.from({ length: 13 }, (_, i) => i - 6).map((v) => (
            <g key={v}>
              <line
                x1={toPxX(v)}
                y1={0}
                x2={toPxX(v)}
                y2={size}
                stroke="currentColor"
                strokeOpacity={v === 0 ? 0.45 : 0.1}
                strokeWidth={v === 0 ? 1.8 : 1}
              />
              <line
                x1={0}
                y1={toPxY(v)}
                x2={size}
                y2={toPxY(v)}
                stroke="currentColor"
                strokeOpacity={v === 0 ? 0.45 : 0.1}
                strokeWidth={v === 0 ? 1.8 : 1}
              />
            </g>
          ))}

          {/* Line */}
          <line
            x1={toPxX(x1)}
            y1={toPxY(y1)}
            x2={toPxX(x2)}
            y2={toPxY(y2)}
            stroke="#2563eb"
            strokeWidth="3"
          />

          {/* Slope triangle from x=0 to x=1 */}
          <line
            x1={toPxX(0)}
            y1={toPxY(c)}
            x2={toPxX(1)}
            y2={toPxY(c)}
            stroke="#d97706"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />
          <line
            x1={toPxX(1)}
            y1={toPxY(c)}
            x2={toPxX(1)}
            y2={toPxY(m + c)}
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />

          {/* y-intercept dot */}
          <circle cx={toPxX(0)} cy={toPxY(c)} r="5.5" fill="#16a34a" stroke="#fff" strokeWidth="1.5" />
          <circle cx={toPxX(1)} cy={toPxY(m + c)} r="4.5" fill="#2563eb" />
        </svg>
      </div>

      <div className="lg:col-span-6 space-y-4">
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-center">
          <Formula latex={eqLatex} display />
          <div className="text-xs text-[var(--text-muted)]">
            {m === 0
              ? 'Sonderfall (AnaGeo S. 7): Konstante – waagerechte Linie!'
              : m === 1 && c === 0
                ? 'Sonderfall (AnaGeo S. 8): Identität y = x (45°-Winkelhalbierende)!'
                : 'Das gestrichelte Steigungsdreieck zeigt: +1 nach rechts → m nach oben/unten.'}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-red-600 dark:text-red-400">Steigung m</span>
              <span className="font-bold">{m}</span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.5}
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-green-700 dark:text-green-400">y-Achsenabschnitt c</span>
              <span className="font-bold">{c}</span>
            </div>
            <input
              type="range"
              min={-4}
              max={4}
              step={1}
              value={c}
              onChange={(e) => setC(Number(e.target.value))}
              className="w-full accent-green-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setM(0); setC(3); }}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              Konstante y = 3
            </button>
            <button
              type="button"
              onClick={() => { setM(1); setC(0); }}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              Identität y = x
            </button>
            <button
              type="button"
              onClick={() => { setM(2); setC(3); }}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              Folie: y = 2x + 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
