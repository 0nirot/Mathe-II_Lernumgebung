import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Formula } from '../MathText';

interface Arrow3DProps {
  to: [number, number, number];
  color: string;
  label: string;
}

function Arrow3D({ to, color, label }: Arrow3DProps) {
  const vec = useMemo(() => new THREE.Vector3(...to), [to]);
  const length = vec.length();
  if (length < 0.05) return null;

  const dir = vec.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const headLen = Math.min(0.42, length * 0.28);
  const shaftLen = Math.max(0.01, length - headLen);
  const shaftMid = dir.clone().multiplyScalar(shaftLen / 2);
  const headPos = dir.clone().multiplyScalar(shaftLen + headLen / 2);
  const labelPos = dir.clone().multiplyScalar(length + 0.35);

  return (
    <group>
      <mesh position={shaftMid} quaternion={quat}>
        <cylinderGeometry args={[0.045, 0.045, shaftLen, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={headPos} quaternion={quat}>
        <coneGeometry args={[0.13, headLen, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html position={labelPos} center>
        <div
          className="px-1.5 py-0.5 rounded text-xs font-bold shadow-sm whitespace-nowrap pointer-events-none"
          style={{ backgroundColor: color, color: '#ffffff' }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function ParallelogramMesh({ a, b }: { a: [number, number, number]; b: [number, number, number] }) {
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const s = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const vertices = new Float32Array([
      0, 0, 0,
      a[0], a[1], a[2],
      s[0], s[1], s[2],
      0, 0, 0,
      s[0], s[1], s[2],
      b[0], b[1], b[2],
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, [a, b]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#f59e0b" transparent opacity={0.32} side={THREE.DoubleSide} />
    </mesh>
  );
}

const PRESETS: { label: string; a: [number, number, number]; b: [number, number, number] }[] = [
  { label: 'Standard (Fläche 6)', a: [2, 0, 0], b: [1, 3, 0] },
  { label: '3D-Schräg (Fläche 5)', a: [1, 0, 0], b: [2, 3, 4] },
  { label: 'Parallel (c = 0!)', a: [2, 1, 0], b: [4, 2, 0] },
];

export function CrossProduct3DViz() {
  const [a, setA] = useState<[number, number, number]>([2, 0, 0]);
  const [b, setB] = useState<[number, number, number]>([1, 3, 0]);
  const [flipped, setFlipped] = useState(false);

  const first = flipped ? b : a;
  const second = flipped ? a : b;
  const cross: [number, number, number] = [
    first[1] * second[2] - first[2] * second[1],
    first[2] * second[0] - first[0] * second[2],
    first[0] * second[1] - first[1] * second[0],
  ];
  const area = Math.hypot(cross[0], cross[1], cross[2]);

  // Map mathematical right-handed (x, y, z) where z is UP to Three.js (x, z_up=y, -y_depth=z)
  const toThree = (v: [number, number, number]): [number, number, number] => [v[0], v[2], -v[1]];

  const aT = toThree(a);
  const bT = toThree(b);
  // Scale display of very long cross vectors softly if > 4.5 so it stays nicely inside viewport
  const cScale = area > 4.5 ? 4.5 / area : 1;
  const cT = toThree([cross[0] * cScale, cross[1] * cScale, cross[2] * cScale]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-7">
        <div className="h-[340px] w-full rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-900">
          <Canvas camera={{ position: [5.5, 4.5, 5.5], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[6, 8, 5]} intensity={1.1} />
            <gridHelper args={[10, 10, '#334155', '#1e293b']} />

            {/* Coordinate axes (Math X=red, Math Y=green, Math Z=up/sky) */}
            <Line points={[[-4, 0, 0], [4, 0, 0]]} color="#ef4444" lineWidth={1.2} />
            <Line points={[[0, 0, 4], [0, 0, -4]]} color="#22c55e" lineWidth={1.2} />
            <Line points={[[0, -4, 0], [0, 4, 0]]} color="#38bdf8" lineWidth={1.2} />
            <Html position={[4.2, 0, 0]}><span className="text-[11px] font-bold text-red-400">x</span></Html>
            <Html position={[0, 0, -4.2]}><span className="text-[11px] font-bold text-green-400">y</span></Html>
            <Html position={[0, 4.2, 0]}><span className="text-[11px] font-bold text-sky-400">z</span></Html>

            <ParallelogramMesh a={aT} b={bT} />
            <Arrow3D to={aT} color="#3b82f6" label="a" />
            <Arrow3D to={bT} color="#10b981" label="b" />
            {area > 0.05 && (
              <Arrow3D to={cT} color="#a855f7" label={flipped ? 'b × a' : 'a × b'} />
            )}

            <OrbitControls enableDamping />
          </Canvas>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          3D-Bühne #1 · Ziehen zum Drehen, Scrollen zum Zoomen (z-Achse zeigt nach oben).
        </p>
      </div>

      <div className="lg:col-span-5 space-y-3.5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setA(p.a);
                setB(p.b);
                setFlipped(false);
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="w-full py-2 px-3 rounded-xl font-semibold text-sm bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
        >
          Reihenfolge tauschen: aktuell {flipped ? 'b × a' : 'a × b'}
        </button>

        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Vektor a⃗:</span>
            <Formula latex={`(${a[0]},\\; ${a[1]},\\; ${a[2]})^T`} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Vektor b⃗:</span>
            <Formula latex={`(${b[0]},\\; ${b[1]},\\; ${b[2]})^T`} />
          </div>
          <hr className="border-[var(--border-color)]" />
          <div className="flex justify-between items-center">
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {flipped ? 'b⃗ × a⃗:' : 'a⃗ × b⃗:'}
            </span>
            <Formula latex={`(${cross[0]},\\; ${cross[1]},\\; ${cross[2]})^T`} />
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-amber-700 dark:text-amber-400 font-semibold">Parallelogrammfläche A:</span>
            <span className="font-bold">{Number.isInteger(area) ? area : area.toFixed(2)}</span>
          </div>
        </div>

        {area < 0.01 ? (
          <div className="p-3 rounded-xl border border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-xs">
            <strong>Parallele Vektoren!</strong> Das Parallelogramm klappt komplett zusammen (Fläche = 0), daher ist das Kreuzprodukt der <strong>Nullvektor</strong>!
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)]">
            Achte beim Tauschen darauf: Der violette Pfeil klappt exakt um <strong>180°</strong> in die Gegenrichtung (Anti-Kommutativgesetz), während die gelbe Fläche gleich groß bleibt.
          </div>
        )}
      </div>
    </div>
  );
}
