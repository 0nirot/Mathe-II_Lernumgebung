import { useRef, useState } from 'react';
import { Formula } from '../MathText';

export type SandboxMode = 'ops' | 'dot' | 'projection';

interface Vector2DSandboxProps {
  initialMode: SandboxMode;
}

export function Vector2DSandbox({ initialMode }: Vector2DSandboxProps) {
  const [opMode, setOpMode] = useState<'add' | 'sub' | 'scale'>('add');
  const [a, setA] = useState<[number, number]>(initialMode === 'projection' ? [4, 2] : [3, 1]);
  const [b, setB] = useState<[number, number]>(initialMode === 'dot' ? [-1, 3] : [1, 3]);
  const [lambda, setLambda] = useState(1.5);
  const [dragging, setDragging] = useState<'a' | 'b' | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const size = 340;
  const range = 6;
  const toPxX = (x: number) => ((x + range) / (2 * range)) * size;
  const toPxY = (y: number) => ((range - y) / (2 * range)) * size;
  const fromClient = (clientX: number, clientY: number): [number, number] => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return [0, 0];
    const rx = ((clientX - rect.left) / rect.width) * 2 * range - range;
    const ry = range - ((clientY - rect.top) / rect.height) * 2 * range;
    // Snap to 0.5 grid for clean calculator-free numbers!
    const snap = (v: number) => Math.max(-5, Math.min(5, Math.round(v * 2) / 2));
    return [snap(rx), snap(ry)];
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const [nx, ny] = fromClient(e.clientX, e.clientY);
    if (nx === 0 && ny === 0) return;
    if (dragging === 'a') setA([nx, ny]);
    else setB([nx, ny]);
  };

  const dot = a[0] * b[0] + a[1] * b[1];
  const normA = Math.hypot(a[0], a[1]);
  const normB = Math.hypot(b[0], b[1]);
  const cosVal = normA > 0 && normB > 0 ? Math.max(-1, Math.min(1, dot / (normA * normB))) : 0;
  const angleDeg = Math.round((Math.acos(cosVal) * 180) / Math.PI);
  const isOrthogonal = Math.abs(dot) < 1e-6;

  // Projection of b onto a
  const normASq = a[0] * a[0] + a[1] * a[1];
  const projFactor = normASq > 0 ? dot / normASq : 0;
  const proj: [number, number] = [projFactor * a[0], projFactor * a[1]];

  const sum: [number, number] = [a[0] + b[0], a[1] + b[1]];
  const diff: [number, number] = [a[0] - b[0], a[1] - b[1]];
  const scaled: [number, number] = [a[0] * lambda, a[1] * lambda];

  const renderArrow = (
    from: [number, number],
    to: [number, number],
    color: string,
    label: string,
    dashed = false
  ) => {
    const x1 = toPxX(from[0]);
    const y1 = toPxY(from[1]);
    const x2 = toPxX(to[0]);
    const y2 = toPxY(to[1]);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 2) return null;
    const ux = dx / len;
    const uy = dy / len;
    const headLen = 10;
    const hx1 = x2 - headLen * ux + 4.5 * uy;
    const hy1 = y2 - headLen * uy - 4.5 * ux;
    const hx2 = x2 - headLen * ux - 4.5 * uy;
    const hy2 = y2 - headLen * uy + 4.5 * ux;

    return (
      <g>
        <line
          x1={x1}
          y1={y1}
          x2={x2 - ux * 6}
          y2={y2 - uy * 6}
          stroke={color}
          strokeWidth={dashed ? 2 : 3}
          strokeDasharray={dashed ? '5 4' : undefined}
          strokeLinecap="round"
        />
        <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
        {label && (
          <text
            x={(x1 + x2) / 2 + 8}
            y={(y1 + y2) / 2 - 6}
            fontSize="12"
            fontWeight="bold"
            fill={color}
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-6 flex flex-col items-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragging(null)}
          onPointerLeave={() => setDragging(null)}
          className="w-full max-w-[340px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] select-none touch-none"
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

          {/* Mode-specific helper geometry */}
          {initialMode === 'ops' && opMode === 'add' && (
            <>
              {renderArrow(a, sum, '#16a34a', 'b verschoben', true)}
              {renderArrow([0, 0], sum, '#7c3aed', 'a + b')}
            </>
          )}
          {initialMode === 'ops' && opMode === 'sub' && (
            <>
              {renderArrow([0, 0], [-b[0], -b[1]], '#16a34a', '-b', true)}
              {renderArrow(a, diff, '#16a34a', '', true)}
              {renderArrow([0, 0], diff, '#7c3aed', 'a - b')}
            </>
          )}
          {initialMode === 'ops' && opMode === 'scale' && (
            renderArrow([0, 0], scaled, '#7c3aed', `${lambda}·a`)
          )}

          {initialMode === 'projection' && (
            <>
              {/* Dashed drop line from b tip to projection tip */}
              <line
                x1={toPxX(b[0])}
                y1={toPxY(b[1])}
                x2={toPxX(proj[0])}
                y2={toPxY(proj[1])}
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {renderArrow([0, 0], proj, '#d97706', 'b_a (Schatten)')}
            </>
          )}

          {/* Primary vectors */}
          {renderArrow([0, 0], a, '#2563eb', 'a')}
          {!(initialMode === 'ops' && opMode === 'scale') &&
            renderArrow([0, 0], b, '#16a34a', 'b')}

          {/* Draggable handles */}
          <circle
            cx={toPxX(a[0])}
            cy={toPxY(a[1])}
            r="9"
            fill="#2563eb"
            fillOpacity="0.2"
            stroke="#2563eb"
            strokeWidth="2"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging('a');
            }}
          />
          {!(initialMode === 'ops' && opMode === 'scale') && (
            <circle
              cx={toPxX(b[0])}
              cy={toPxY(b[1])}
              r="9"
              fill="#16a34a"
              fillOpacity="0.2"
              stroke="#16a34a"
              strokeWidth="2"
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragging('b');
              }}
            />
          )}
        </svg>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Ziehe die farbigen Kreise an den Pfeilspitzen per Maus!
        </p>
      </div>

      <div className="lg:col-span-6 space-y-4">
        {initialMode === 'ops' && (
          <div className="flex gap-2">
            {([
              ['add', 'Addition (a + b)'],
              ['sub', 'Subtraktion (a − b)'],
              ['scale', 'Skalar (λ · a)'],
            ] as const).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                onClick={() => setOpMode(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                  opMode === k
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-[var(--border-color)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        )}

        {initialMode === 'ops' && opMode === 'scale' && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Skalar λ</span>
              <span className="font-bold">{lambda}</span>
            </div>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.5}
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {lambda > 0
                ? 'λ > 0: parallel (gleiche Richtung)'
                : lambda < 0
                  ? 'λ < 0: anti-parallel (Richtung umgedreht!)'
                  : 'λ = 0: Nullvektor!'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Vektor a⃗ (blau)</div>
            <Formula latex={`\\begin{pmatrix}${a[0]}\\\\${a[1]}\\end{pmatrix}`} />
          </div>
          {!(initialMode === 'ops' && opMode === 'scale') && (
            <div className="p-3 rounded-xl border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/30">
              <div className="text-xs text-green-700 dark:text-green-300 font-medium">Vektor b⃗ (grün)</div>
              <Formula latex={`\\begin{pmatrix}${b[0]}\\\\${b[1]}\\end{pmatrix}`} />
            </div>
          )}
        </div>

        {initialMode === 'ops' && (
          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30">
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Ergebnis (violett)</div>
            {opMode === 'add' && (
              <Formula latex={`\\vec{a}+\\vec{b} = \\begin{pmatrix}${sum[0]}\\\\${sum[1]}\\end{pmatrix}`} />
            )}
            {opMode === 'sub' && (
              <Formula latex={`\\vec{a}-\\vec{b} = \\begin{pmatrix}${diff[0]}\\\\${diff[1]}\\end{pmatrix}`} />
            )}
            {opMode === 'scale' && (
              <Formula latex={`${lambda}\\cdot\\vec{a} = \\begin{pmatrix}${scaled[0]}\\\\${scaled[1]}\\end{pmatrix}`} />
            )}
          </div>
        )}

        {initialMode === 'dot' && (
          <div
            className={`p-4 rounded-xl border transition-colors ${
              isOrthogonal
                ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
                : 'border-[var(--border-color)] bg-[var(--bg-subtle)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--text-muted)]">Skalarprodukt</div>
                <div className="text-2xl font-bold">
                  <Formula latex={`\\vec{a}\\cdot\\vec{b} = ${Number(dot.toFixed(2))}`} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)]">Winkel ρ</div>
                <div className="text-2xl font-bold">{angleDeg}°</div>
              </div>
            </div>
            <div className="mt-2 text-xs font-medium">
              {isOrthogonal
                ? '✓ Volltreffer! Skalarprodukt = 0 → Die Vektoren stehen exakt senkrecht (90°)!'
                : dot > 0
                  ? 'Positives Skalarprodukt → spitzer Winkel (< 90°, „Rückenwind“).'
                  : 'Negatives Skalarprodukt → stumpfer Winkel (> 90°, „Gegenwind“).'}
            </div>
          </div>
        )}

        {initialMode === 'projection' && (
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 space-y-1.5 text-sm">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Projektion b⃗ₐ (gelber Schatten auf a⃗)
            </div>
            <div>
              Faktor <Formula latex={`\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|^2} = \\frac{${Number(dot.toFixed(2))}}{${Number(normASq.toFixed(2))}} \\approx ${projFactor.toFixed(2)}`} />
            </div>
            <div>
              <Formula latex={`\\vec{b}_a \\approx \\begin{pmatrix}${proj[0].toFixed(2)}\\\\${proj[1].toFixed(2)}\\end{pmatrix}`} />
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {Math.abs(dot) < 1e-6
                ? 'Senkrecht: Der Schatten schrumpft auf den Nullvektor!'
                : projFactor < 0
                  ? 'Negativer Faktor: Der Schatten fällt rückwärts (entgegen a⃗).'
                  : 'Positiver Faktor: Der Schatten zeigt in dieselbe Richtung wie a⃗.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
