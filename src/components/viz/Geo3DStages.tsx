import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import * as THREE from 'three';
import { Formula } from '../MathText';

const toT = (v: [number, number, number]): [number, number, number] => [v[0], v[2], -v[1]];

/** 3D-Bühne #2: Geraden, Ebenen & Schnittwinkel-Lupe (arcsin vs. arccos!) */
export function Geo3DStageViz() {
  const [tab, setTab] = useState<'line' | 'plane' | 'angle'>('angle');
  const [lambda, setLambda] = useState(1.5);
  const [tiltDeg, setTiltDeg] = useState(30); // elevation angle alpha of line relative to plane!

  const rad = (tiltDeg * Math.PI) / 180;
  // Plane is z = 0 (horizontal blue glass sheet), normal n = (0, 0, 1)
  // Line passes through origin with direction (cos(alpha), 0, sin(alpha))
  const lineDir: [number, number, number] = [Math.cos(rad) * 3, 0, Math.sin(rad) * 3];
  const rhoDeg = 90 - tiltDeg;

  // Line tab point: r1 = (1, 0, 0.5), a = (0.8, 0.8, 0.6)
  const ptLine: [number, number, number] = [1 + lambda * 0.8, lambda * 0.8, 0.5 + lambda * 0.6];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-7">
        <div className="h-[340px] w-full rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-900">
          <Canvas camera={{ position: [5.5, 4.2, 5.5], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[6, 8, 5]} intensity={1} />
            <gridHelper args={[10, 10, '#334155', '#1e293b']} />

            {/* Axes */}
            <Line points={[[-4, 0, 0], [4, 0, 0]]} color="#ef4444" lineWidth={1.2} />
            <Line points={[[0, 0, 4], [0, 0, -4]]} color="#22c55e" lineWidth={1.2} />
            <Line points={[[0, -3, 0], [0, 4, 0]]} color="#38bdf8" lineWidth={1.2} />

            {tab === 'line' && (
              <>
                <Line
                  points={[toT([1 - 3 * 0.8, -3 * 0.8, 0.5 - 3 * 0.6]), toT([1 + 4 * 0.8, 4 * 0.8, 0.5 + 4 * 0.6])]}
                  color="#60a5fa"
                  lineWidth={3}
                />
                {/* Stützvektor r1 */}
                <Line points={[toT([0, 0, 0]), toT([1, 0, 0.5])]} color="#f59e0b" lineWidth={2.5} />
                {/* Running point C(lambda) */}
                <mesh position={toT(ptLine)}>
                  <sphereGeometry args={[0.16, 16, 16]} />
                  <meshStandardMaterial color="#22c55e" />
                </mesh>
                <Html position={toT([ptLine[0], ptLine[1], ptLine[2] + 0.4])} center>
                  <span className="px-1.5 py-0.5 rounded bg-green-600 text-white text-[11px] font-bold">
                    C(λ={lambda})
                  </span>
                </Html>
              </>
            )}

            {(tab === 'plane' || tab === 'angle') && (
              <>
                {/* Glass plane E at z=0 */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <planeGeometry args={[6, 6]} />
                  <meshStandardMaterial color="#38bdf8" transparent opacity={0.28} side={THREE.DoubleSide} />
                </mesh>
                {/* Normal vector n = (0,0,2.5) */}
                <Line points={[toT([0, 0, 0]), toT([0, 0, 2.8])]} color="#ef4444" lineWidth={3.5} />
                <Html position={toT([0, 0, 3.1])} center>
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold">n⃗ (90° auf E)</span>
                </Html>
              </>
            )}

            {tab === 'plane' && (
              <>
                <Line points={[toT([0, 0, 0]), toT([2, 0, 0])]} color="#a855f7" lineWidth={3} />
                <Line points={[toT([0, 0, 0]), toT([0, 2, 0])]} color="#f59e0b" lineWidth={3} />
                <Html position={toT([2.2, 0, 0.2])} center>
                  <span className="px-1 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold">Spannvektor a⃗</span>
                </Html>
                <Html position={toT([0, 2.2, 0.2])} center>
                  <span className="px-1 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold">Spannvektor b⃗</span>
                </Html>
              </>
            )}

            {tab === 'angle' && (
              <>
                {/* Intersecting line g */}
                <Line
                  points={[toT([-lineDir[0], 0, -lineDir[2]]), toT(lineDir)]}
                  color="#f59e0b"
                  lineWidth={3.5}
                />
                {/* Shadow on plane */}
                <Line points={[toT([0, 0, 0]), toT([lineDir[0], 0, 0])]} color="#94a3b8" lineWidth={1.5} dashed />
                <Html position={toT([lineDir[0] * 0.65, 0, lineDir[2] * 0.65 + 0.35])} center>
                  <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[11px] font-bold">
                    g (α = {tiltDeg}°)
                  </span>
                </Html>
              </>
            )}

            <OrbitControls enableDamping />
          </Canvas>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          3D-Bühne #2 · Frei drehbar per Maus · z-Achse zeigt nach oben.
        </p>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {([
            ['line', 'Gerade r(λ)'],
            ['plane', 'Ebene & n⃗'],
            ['angle', 'Schnittwinkel-Lupe'],
          ] as const).map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                tab === k ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)]'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {tab === 'line' && (
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Parameter λ</span>
              <strong>{lambda}</strong>
            </div>
            <input
              type="range"
              min={-2.5}
              max={3.5}
              step={0.5}
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-xs text-[var(--text-muted)]">
              Der Stützvektor (orange) bringt dich erst auf die Gerade. Danach schiebt λ den grünen Punkt beliebig vor oder zurück entlang des Richtungsvektors.
            </p>
          </div>
        )}

        {tab === 'plane' && (
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2 text-xs leading-relaxed">
            <div className="font-bold text-sm">Parameterform vs. Normalenform</div>
            <p>
              Die beiden Spannvektoren <strong className="text-purple-600 dark:text-purple-400">a⃗</strong> und <strong className="text-amber-600 dark:text-amber-400">b⃗</strong> spannen die blaue Ebene auf.
            </p>
            <p>
              Ihr Kreuzprodukt <strong className="text-red-600 dark:text-red-400">n⃗ = a⃗ × b⃗</strong> steht exakt im 90°-Winkel darauf – dadurch reicht in der Normalenform ein einziger Vektor <Formula latex="\vec{n}\cdot(\vec{r}-\vec{r}_1)=0" />!
            </p>
          </div>
        )}

        {tab === 'angle' && (
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Neigungswinkel α zur Ebene</span>
              <strong className="text-amber-800 dark:text-amber-300">{tiltDeg}°</strong>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={tiltDeg}
              onChange={(e) => setTiltDeg(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div className="text-[var(--text-muted)]">Winkel ρ zu n⃗ (arccos)</div>
                <div className="text-base font-bold text-red-600 dark:text-red-400">{rhoDeg}°</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div className="text-[var(--text-muted)]">Winkel α zu E (arcsin)</div>
                <div className="text-base font-bold text-amber-700 dark:text-amber-300">{tiltDeg}°</div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Weil <Formula latex="\rho + \alpha = 90^\circ" /> gilt, ist <Formula latex="\cos(\rho) = \sin(\alpha)" />. Deshalb nutzen wir bei Gerade–Ebene immer <strong>arcsin</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** 3D-Bühne #3: Windschiefe-Geraden-Aufzug (Folie AnaGeo S. 30-34) */
export function SkewLines3DViz() {
  const [showPlanes, setShowPlanes] = useState(true);
  const [dist, setDist] = useState(2.2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-7">
        <div className="h-[320px] w-full rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-900">
          <Canvas camera={{ position: [5.5, 4.0, 5.5], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 8, 5]} intensity={1} />
            <gridHelper args={[10, 10, '#334155', '#1e293b']} position={[0, -0.02, 0]} />

            {/* Lower skew line g1 along X at z=0 */}
            <Line points={[toT([-3.5, 0, 0]), toT([3.5, 0, 0])]} color="#3b82f6" lineWidth={3.5} />
            <Html position={toT([3.2, 0, 0.25])} center>
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold">g₁</span>
            </Html>

            {/* Upper skew line g2 along Y at z=dist */}
            <Line points={[toT([0, -3.5, dist]), toT([0, 3.5, dist])]} color="#10b981" lineWidth={3.5} />
            <Html position={toT([0, 3.2, dist + 0.25])} center>
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold">g₂</span>
            </Html>

            {/* Perpendicular shortest distance segment d */}
            <Line points={[toT([0, 0, 0]), toT([0, 0, dist])]} color="#f59e0b" lineWidth={4} dashed />
            <Html position={toT([0.45, 0, dist / 2])} center>
              <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[11px] font-bold">d = {dist}</span>
            </Html>

            {showPlanes && (
              <>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <planeGeometry args={[5.5, 5.5]} />
                  <meshStandardMaterial color="#3b82f6" transparent opacity={0.22} side={THREE.DoubleSide} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, dist, 0]}>
                  <planeGeometry args={[5.5, 5.5]} />
                  <meshStandardMaterial color="#10b981" transparent opacity={0.22} side={THREE.DoubleSide} />
                </mesh>
              </>
            )}

            <OrbitControls enableDamping />
          </Canvas>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          3D-Bühne #3 · Windschiefe Geraden g₁ und g₂ schneiden sich nicht und sind nicht parallel.
        </p>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3 text-sm">
          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showPlanes}
              onChange={(e) => setShowPlanes(e.target.checked)}
              className="accent-blue-600 w-4 h-4"
            />
            Parallele Hilfsebenen E₁ & E₂ einblenden
          </label>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Ebenenabstand d</span>
              <strong>{dist}</strong>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.5}
              step={0.5}
              value={dist}
              onChange={(e) => setDist(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            <strong>Folien-Idee (AnaGeo S. 32):</strong> Verschiebt man beide Geraden parallel aufeinander, spannen sie zwei parallele Glasplatten <Formula latex="E_1, E_2" /> mit gemeinsamem Normalenvektor <Formula latex="\vec{n} = \vec{a}_1 \times \vec{a}_2" /> auf. Der gesuchte Abstand <Formula latex="d" /> ist schlicht der Abstand dieser beiden Ebenen!
          </p>
        </div>
      </div>
    </div>
  );
}
