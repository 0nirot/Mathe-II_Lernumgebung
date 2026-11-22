import { useState } from 'react';
import { Formula } from '../MathText';

interface CircleAngle {
  deg: number;
  radLatex: string;
  cosLatex: string;
  sinLatex: string;
  tanLatex: string;
}

const ANGLES: CircleAngle[] = [
  { deg: 0, radLatex: '0', cosLatex: '1', sinLatex: '0', tanLatex: '0' },
  { deg: 30, radLatex: '\\frac{\\pi}{6}', cosLatex: '\\frac{\\sqrt{3}}{2}', sinLatex: '\\frac{1}{2}', tanLatex: '\\frac{\\sqrt{3}}{3}' },
  { deg: 45, radLatex: '\\frac{\\pi}{4}', cosLatex: '\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{\\sqrt{2}}{2}', tanLatex: '1' },
  { deg: 60, radLatex: '\\frac{\\pi}{3}', cosLatex: '\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}', tanLatex: '\\sqrt{3}' },
  { deg: 90, radLatex: '\\frac{\\pi}{2}', cosLatex: '0', sinLatex: '1', tanLatex: '\\text{n. def.}' },
  { deg: 120, radLatex: '\\frac{2\\pi}{3}', cosLatex: '-\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}', tanLatex: '-\\sqrt{3}' },
  { deg: 135, radLatex: '\\frac{3\\pi}{4}', cosLatex: '-\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{\\sqrt{2}}{2}', tanLatex: '-1' },
  { deg: 150, radLatex: '\\frac{5\\pi}{6}', cosLatex: '-\\frac{\\sqrt{3}}{2}', sinLatex: '\\frac{1}{2}', tanLatex: '-\\frac{\\sqrt{3}}{3}' },
  { deg: 180, radLatex: '\\pi', cosLatex: '-1', sinLatex: '0', tanLatex: '0' },
  { deg: 210, radLatex: '\\frac{7\\pi}{6}', cosLatex: '-\\frac{\\sqrt{3}}{2}', sinLatex: '-\\frac{1}{2}', tanLatex: '\\frac{\\sqrt{3}}{3}' },
  { deg: 225, radLatex: '\\frac{5\\pi}{4}', cosLatex: '-\\frac{\\sqrt{2}}{2}', sinLatex: '-\\frac{\\sqrt{2}}{2}', tanLatex: '1' },
  { deg: 240, radLatex: '\\frac{4\\pi}{3}', cosLatex: '-\\frac{1}{2}', sinLatex: '-\\frac{\\sqrt{3}}{2}', tanLatex: '\\sqrt{3}' },
  { deg: 270, radLatex: '\\frac{3\\pi}{2}', cosLatex: '0', sinLatex: '-1', tanLatex: '\\text{n. def.}' },
  { deg: 300, radLatex: '\\frac{5\\pi}{3}', cosLatex: '\\frac{1}{2}', sinLatex: '-\\frac{\\sqrt{3}}{2}', tanLatex: '-\\sqrt{3}' },
  { deg: 315, radLatex: '\\frac{7\\pi}{4}', cosLatex: '\\frac{\\sqrt{2}}{2}', sinLatex: '-\\frac{\\sqrt{2}}{2}', tanLatex: '-1' },
  { deg: 330, radLatex: '\\frac{11\\pi}{6}', cosLatex: '\\frac{\\sqrt{3}}{2}', sinLatex: '-\\frac{1}{2}', tanLatex: '-\\frac{\\sqrt{3}}{3}' },
  { deg: 360, radLatex: '2\\pi', cosLatex: '1', sinLatex: '0', tanLatex: '0' },
];

export function UnitCircleViz() {
  const [angleIdx, setAngleIdx] = useState(2); // start at 45°
  const cur = ANGLES[angleIdx];
  const rad = (cur.deg * Math.PI) / 180;
  const cx = 170;
  const cy = 170;
  const r = 120;
  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad);

  // Arc path for angle wedge
  const arcR = 32;
  const ax = cx + arcR * Math.cos(rad);
  const ay = cy - arcR * Math.sin(rad);
  const largeArc = cur.deg > 180 ? 1 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-6 flex flex-col items-center">
        <svg
          viewBox="0 0 340 340"
          className="w-full max-w-[340px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]"
        >
          {/* Axes */}
          <line x1="20" y1={cy} x2="320" y2={cy} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
          <line x1={cx} y1="20" x2={cx} y2="320" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
          <text x="308" y={cy - 6} fontSize="12" fill="currentColor" opacity="0.6">x (cos)</text>
          <text x={cx + 6} y="28" fontSize="12" fill="currentColor" opacity="0.6">y (sin)</text>

          {/* Unit Circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />

          {/* Clickable snap points */}
          {ANGLES.slice(0, 16).map((a, idx) => {
            const ar = (a.deg * Math.PI) / 180;
            const x = cx + r * Math.cos(ar);
            const y = cy - r * Math.sin(ar);
            const active = idx === angleIdx || (angleIdx === 16 && idx === 0);
            return (
              <circle
                key={a.deg}
                cx={x}
                cy={y}
                r={active ? 7 : 4}
                className="cursor-pointer transition-all"
                fill={active ? '#2563eb' : 'currentColor'}
                fillOpacity={active ? 1 : 0.25}
                onClick={() => setAngleIdx(idx)}
              />
            );
          })}

          {/* Shaded right triangle */}
          <polygon
            points={`${cx},${cy} ${px},${cy} ${px},${py}`}
            fill="#2563eb"
            fillOpacity="0.1"
          />

          {/* Angle arc */}
          {cur.deg > 0 && cur.deg < 360 && (
            <path
              d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax} ${ay}`}
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
            />
          )}

          {/* Cosine segment (horizontal, blue) */}
          <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
          {/* Sine segment (vertical, red) */}
          <line x1={px} y1={cy} x2={px} y2={py} stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
          {/* Radius */}
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="currentColor" strokeWidth="2" />

          {/* Active Point */}
          <circle cx={px} cy={py} r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
          <text
            x={px + (Math.cos(rad) >= 0 ? 10 : -44)}
            y={py + (Math.sin(rad) >= 0 ? -10 : 18)}
            fontSize="13"
            fontWeight="bold"
            fill="#2563eb"
          >
            {cur.deg}°
          </text>
        </svg>

        <div className="w-full max-w-[340px] mt-3">
          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>0° (0)</span>
            <span className="font-semibold text-[var(--text-main)]">Winkel wählen (klickbar oder Slider)</span>
            <span>360° (2π)</span>
          </div>
          <input
            type="range"
            min={0}
            max={ANGLES.length - 1}
            value={angleIdx}
            onChange={(e) => setAngleIdx(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="lg:col-span-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
            <div className="text-xs text-[var(--text-muted)]">Gradmaß (deg)</div>
            <div className="text-xl font-bold mt-0.5">{cur.deg}°</div>
          </div>
          <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
            <div className="text-xs text-[var(--text-muted)]">Bogenmaß (rad)</div>
            <div className="text-xl font-bold mt-0.5">
              <Formula latex={cur.radLatex} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">cos (waagerecht)</div>
            <div className="text-lg font-bold mt-1 text-blue-900 dark:text-blue-100">
              <Formula latex={cur.cosLatex} />
            </div>
          </div>
          <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40">
            <div className="text-xs font-medium text-red-700 dark:text-red-300">sin (senkrecht)</div>
            <div className="text-lg font-bold mt-1 text-red-900 dark:text-red-100">
              <Formula latex={cur.sinLatex} />
            </div>
          </div>
          <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40">
            <div className="text-xs font-medium text-amber-700 dark:text-amber-300">tan = sin/cos</div>
            <div className="text-lg font-bold mt-1 text-amber-900 dark:text-amber-100">
              <Formula latex={cur.tanLatex} />
            </div>
          </div>
        </div>

        {/* Merktrick-Tabelle */}
        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs">
          <div className="font-semibold mb-2">Der √n / 2 – Merktrick für 0° bis 90°:</div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)]">
                <th className="py-1 text-left">Winkel</th>
                {[0, 30, 45, 60, 90].map((d, i) => (
                  <th
                    key={d}
                    onClick={() => setAngleIdx(i)}
                    className={`py-1 cursor-pointer rounded ${cur.deg === d ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-subtle)]'}`}
                  >
                    {d}°
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-color)]">
                <td className="py-1.5 text-left font-semibold text-red-600 dark:text-red-400">sin</td>
                <td><Formula latex="\frac{\sqrt{0}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{1}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{2}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{3}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{4}}{2}" /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-left font-semibold text-blue-600 dark:text-blue-400">cos</td>
                <td><Formula latex="\frac{\sqrt{4}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{3}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{2}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{1}}{2}" /></td>
                <td><Formula latex="\frac{\sqrt{0}}{2}" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
