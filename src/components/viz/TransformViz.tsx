import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { Formula } from '../MathText';

/** 1. 2D-Transformations-Labor (Gitter + Haus-Polygon) */
export function Transform2DLabViz() {
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [shearX, setShearX] = useState(0);
  const [deg, setDeg] = useState(0);

  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  // Combined matrix: T * R * Shear * S
  const m11 = c * sx - s * (0);
  const m12 = c * (shearX * sy) - s * sy;
  const m13 = tx;
  const m21 = s * sx;
  const m22 = s * (shearX * sy) + c * sy;
  const m23 = ty;

  const applyPt = ([x, y]: [number, number]): [number, number] => [
    m11 * x + m12 * y + m13,
    m21 * x + m22 * y + m23,
  ];

  const house: [number, number][] = [
    [0, 0],
    [2, 0],
    [2, 1.5],
    [1, 2.5],
    [0, 1.5],
  ];
  const transformed = house.map(applyPt);

  const size = 320;
  const range = 6;
  const px = (x: number) => ((x + range) / (2 * range)) * size;
  const py = (y: number) => ((range - y) / (2 * range)) * size;
  const polyStr = (pts: [number, number][]) => pts.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');

  const originMoved = Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-6 flex justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
          {Array.from({ length: 13 }, (_, i) => i - 6).map((v) => (
            <g key={v}>
              <line x1={px(v)} y1={0} x2={px(v)} y2={size} stroke="currentColor" strokeOpacity={v === 0 ? 0.45 : 0.09} />
              <line x1={0} y1={py(v)} x2={size} y2={py(v)} stroke="currentColor" strokeOpacity={v === 0 ? 0.45 : 0.09} />
            </g>
          ))}
          {/* Original house */}
          <polygon points={polyStr(house)} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeDasharray="4 3" />
          {/* Transformed house */}
          <polygon points={polyStr(transformed)} fill="#2563eb" fillOpacity="0.3" stroke="#2563eb" strokeWidth="2.5" />
          {/* Origin pin */}
          <circle cx={px(0)} cy={py(0)} r="4" fill="#dc2626" />
          <circle cx={px(tx)} cy={py(ty)} r="4.5" fill="#16a34a" />
        </svg>
      </div>

      <div className="lg:col-span-6 space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { l: 'Rotation φ (°)', v: deg, set: setDeg, min: -180, max: 180, step: 15 },
            { l: 'Scherung λ_x', v: shearX, set: setShearX, min: -1.5, max: 1.5, step: 0.5 },
            { l: 'Skalierung s_x', v: sx, set: setSx, min: -2, max: 2, step: 0.5 },
            { l: 'Skalierung s_y', v: sy, set: setSy, min: -2, max: 2, step: 0.5 },
            { l: 'Translation t_x', v: tx, set: setTx, min: -3, max: 3, step: 0.5 },
            { l: 'Translation t_y', v: ty, set: setTy, min: -3, max: 3, step: 0.5 },
          ].map((s) => (
            <div key={s.l} className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)]">
              <div className="flex justify-between">
                <span>{s.l}</span>
                <strong>{s.v}</strong>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.v}
                onChange={(e) => s.set(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-1.5">
          <Formula
            latex={`T_{2D} = \\begin{pmatrix} ${m11.toFixed(1)} & ${m12.toFixed(1)} & ${m13.toFixed(1)} \\\\ ${m21.toFixed(1)} & ${m22.toFixed(1)} & ${m23.toFixed(1)} \\\\ 0 & 0 & 1 \\end{pmatrix}`}
            display
          />
          <div className="flex items-center justify-between">
            <span className={originMoved ? 'text-amber-700 dark:text-amber-300 font-semibold' : 'text-green-700 dark:text-green-400 font-semibold'}>
              {originMoved ? 'Affin (Ursprung verschoben → nicht linear!)' : 'Linear (Ursprung bleibt festgenagelt!)'}
            </span>
            <button
              type="button"
              onClick={() => { setTx(0); setTy(0); setSx(1); setSy(1); setShearX(0); setDeg(0); }}
              className="px-2 py-0.5 rounded border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 2. Verkettungs-Pipeline & 3-Schritte-Kino (Rotation um Punkt P) */
export function TransformChain2DViz() {
  const [mode, setMode] = useState<'order' | 'pivot'>('order');
  const [rotateFirst, setRotateFirst] = useState(true);
  const [pivotStep, setPivotStep] = useState<0 | 1 | 2 | 3>(3);

  const size = 320;
  const range = 6;
  const px = (x: number) => ((x + range) / (2 * range)) * size;
  const py = (y: number) => ((range - y) / (2 * range)) * size;
  const polyStr = (pts: [number, number][]) => pts.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');

  // Order demo: Triangle at (1,0)-(2,0)-(1,1); Rotate 90° vs Translate (+3, 0)
  const tri: [number, number][] = [[1, 0], [2.5, 0], [1, 1.2]];
  const rot90 = ([x, y]: [number, number]): [number, number] => [-y, x];
  const tr3 = ([x, y]: [number, number]): [number, number] => [x + 3, y];
  const orderResult = rotateFirst ? tri.map(rot90).map(tr3) : tri.map(tr3).map(rot90);

  // Pivot demo: Pivot P(2, 2), Point Q(5, 2) rotated 90° around P -> Q'(2, 5)
  const P: [number, number] = [2, 2];
  const Q0: [number, number] = [5, 2];
  const Q1: [number, number] = [3, 0]; // after T(-2,-2)
  const Q2: [number, number] = [0, 3]; // after R(90°)
  const Q3: [number, number] = [2, 5]; // after T(+2,+2)
  const pivotActiveQ = [Q0, Q1, Q2, Q3][pivotStep];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-6 flex justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
          {Array.from({ length: 13 }, (_, i) => i - 6).map((v) => (
            <g key={v}>
              <line x1={px(v)} y1={0} x2={px(v)} y2={size} stroke="currentColor" strokeOpacity={v === 0 ? 0.45 : 0.09} />
              <line x1={0} y1={py(v)} x2={size} y2={py(v)} stroke="currentColor" strokeOpacity={v === 0 ? 0.45 : 0.09} />
            </g>
          ))}

          {mode === 'order' ? (
            <>
              <polygon points={polyStr(tri)} fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeDasharray="3 3" />
              <polygon points={polyStr(orderResult)} fill="#7c3aed" fillOpacity="0.35" stroke="#7c3aed" strokeWidth="2.5" />
            </>
          ) : (
            <>
              {/* Pivot P */}
              <circle cx={px(P[0])} cy={py(P[1])} r="5" fill="#dc2626" />
              <text x={px(P[0]) + 8} y={py(P[1]) + 4} fontSize="11" fontWeight="bold" fill="#dc2626">P(2,2)</text>
              {/* Start Q */}
              <circle cx={px(Q0[0])} cy={py(Q0[1])} r="5" fill="#64748b" />
              <text x={px(Q0[0]) - 10} y={py(Q0[1]) - 8} fontSize="11" fill="#64748b">Q(5,2)</text>
              {/* Current step */}
              <line x1={px(pivotStep === 1 || pivotStep === 2 ? 0 : P[0])} y1={py(pivotStep === 1 || pivotStep === 2 ? 0 : P[1])} x2={px(pivotActiveQ[0])} y2={py(pivotActiveQ[1])} stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
              <circle cx={px(pivotActiveQ[0])} cy={py(pivotActiveQ[1])} r="6.5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
              <text x={px(pivotActiveQ[0]) + 8} y={py(pivotActiveQ[1]) - 6} fontSize="12" fontWeight="bold" fill="#2563eb">
                ({pivotActiveQ[0]}, {pivotActiveQ[1]})
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="lg:col-span-6 space-y-3 text-sm">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('order')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${mode === 'order' ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)]'}`}
          >
            Reihenfolge-Detektor
          </button>
          <button
            type="button"
            onClick={() => setMode('pivot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${mode === 'pivot' ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)]'}`}
          >
            3-Schritte-Kino (Punkt P)
          </button>
        </div>

        {mode === 'order' ? (
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3">
            <button
              type="button"
              onClick={() => setRotateFirst((v) => !v)}
              className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
            >
              Reihenfolge tauschen! Aktuell: {rotateFirst ? 'Erst drehen (90°), dann +3 nach rechts' : 'Erst +3 nach rechts, dann drehen (90°)'}
            </button>
            <Formula latex={rotateFirst ? 'T_{\\text{ges}} = T_T \\cdot T_R \\quad (\\text{rechts zuerst!})' : 'T_{\\text{ges}} = T_R \\cdot T_T \\quad (\\text{völlig anderes Bild!})'} display />
            <p className="text-xs text-[var(--text-muted)]">
              Bei der Matrixmultiplikation gilt <Formula latex="T_T \cdot T_R \neq T_R \cdot T_T" />! Die zuerst ausgeführte Transformation steht immer <strong>rechts</strong> direkt am Vektor.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3">
            <div className="grid grid-cols-4 gap-1.5">
              {(['Start', '1: −P', '2: Rot 90°', '3: +P'] as const).map((lbl, idx) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setPivotStep(idx as 0 | 1 | 2 | 3)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${pivotStep === idx ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)] bg-[var(--bg-card)]'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <Formula latex="T = T_T^{-1} \cdot T_R \cdot T_T" display />
            <p className="text-xs text-[var(--text-muted)]">
              {pivotStep === 0 && 'Ausgangslage: Q(5,2) soll um 90° um P(2,2) gedreht werden.'}
              {pivotStep === 1 && 'Schritt 1: Verschiebe P in den Ursprung (−2, −2) → Q wandert zu (3, 0).'}
              {pivotStep === 2 && 'Schritt 2: Drehe um 90° um den Ursprung → (3, 0) wird zu (0, 3).'}
              {pivotStep === 3 && 'Schritt 3: Schiebe zurück (+2, +2) → (0, 3) landet exakt bei Q′(2, 5)!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** 3D-Bühne #4: 3D-Transformations-Würfel (Rx, Ry, Rz + Skalierung) */
export function Transform3DCubeViz() {
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(30);
  const [rz, setRz] = useState(0);
  const [scale, setScale] = useState(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-7">
        <div className="h-[320px] w-full rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-900">
          <Canvas camera={{ position: [4.8, 3.6, 4.8], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[6, 8, 5]} intensity={1.1} />
            <gridHelper args={[8, 8, '#334155', '#1e293b']} />

            {/* Axes */}
            <Line points={[[-3.5, 0, 0], [3.5, 0, 0]]} color="#ef4444" lineWidth={1.5} />
            <Line points={[[0, -3.5, 0], [0, 3.5, 0]]} color="#22c55e" lineWidth={1.5} />
            <Line points={[[0, 0, -3.5], [0, 0, 3.5]]} color="#38bdf8" lineWidth={1.5} />
            <Html position={[3.7, 0, 0]}><span className="text-[11px] font-bold text-red-400">X</span></Html>
            <Html position={[0, 3.7, 0]}><span className="text-[11px] font-bold text-green-400">Y</span></Html>
            <Html position={[0, 0, 3.7]}><span className="text-[11px] font-bold text-sky-400">Z</span></Html>

            <group
              rotation={[(rx * Math.PI) / 180, (ry * Math.PI) / 180, (rz * Math.PI) / 180]}
              scale={[scale, scale, scale]}
            >
              <mesh>
                <boxGeometry args={[1.6, 1.6, 1.6]} />
                <meshStandardMaterial color="#3b82f6" transparent opacity={0.85} />
              </mesh>
              {/* Corner marker to track orientation */}
              <mesh position={[0.8, 0.8, 0.8]}>
                <sphereGeometry args={[0.16, 16, 16]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            </group>

            <OrbitControls enableDamping />
          </Canvas>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          3D-Bühne #4 · Der gelbe Eckpunkt zeigt die Orientierung des Würfels bei Rotation um X, Y oder Z.
        </p>
      </div>

      <div className="lg:col-span-5 space-y-3 text-xs">
        {[
          { l: 'Rotation um X-Achse (°)', v: rx, set: setRx, color: 'accent-red-600' },
          { l: 'Rotation um Y-Achse (°)', v: ry, set: setRy, color: 'accent-green-600' },
          { l: 'Rotation um Z-Achse (°)', v: rz, set: setRz, color: 'accent-sky-600' },
        ].map((s) => (
          <div key={s.l} className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{s.l}</span>
              <strong>{s.v}°</strong>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={15}
              value={s.v}
              onChange={(e) => s.set(Number(e.target.value))}
              className={`w-full cursor-pointer ${s.color}`}
            />
          </div>
        ))}
        <div className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
          <div className="flex justify-between mb-1">
            <span className="font-medium">Skalierung s</span>
            <strong>{scale}×</strong>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.8}
            step={0.1}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>
        <button
          type="button"
          onClick={() => { setRx(0); setRy(0); setRz(0); setScale(1); }}
          className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] font-semibold cursor-pointer"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}
