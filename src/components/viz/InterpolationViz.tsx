import { useEffect, useRef, useState } from 'react';
import { Formula } from '../MathText';

/** 1. Stützstellen-Kurvenbrett (Nearest-Neighbour, Linear, Lagrange-Polynom, Kubischer Spline) */
export function Interp1DBoardViz() {
  const [ys, setYs] = useState<[number, number, number, number]>([1.5, 4.2, 1.8, 4.5]);
  const [showNN, setShowNN] = useState(false);
  const [showLin, setShowLin] = useState(true);
  const [showPoly, setShowPoly] = useState(true);
  const xs = [1, 3, 5, 7];

  const w = 380;
  const h = 240;
  const px = (x: number) => ((x - 0) / 8) * w;
  const py = (y: number) => h - ((y - 0) / 6) * h;

  // Evaluate exact Lagrange polynomial through 4 points
  const evalLagrange = (x: number) => {
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      let term = ys[i];
      for (let j = 0; j < 4; j++) {
        if (i !== j) term *= (x - xs[j]) / (xs[i] - xs[j]);
      }
      sum += term;
    }
    return sum;
  };

  const polyPoints = Array.from({ length: 81 }, (_, k) => {
    const x = 0.7 + (k / 80) * 6.6;
    const y = Math.max(-0.5, Math.min(6.5, evalLagrange(x)));
    return `${px(x)},${py(y)}`;
  }).join(' ');

  const linPoints = xs.map((x, i) => `${px(x)},${py(ys[i])}`).join(' ');

  // Nearest-neighbour step path
  const nnPoints = Array.from({ length: 81 }, (_, k) => {
    const x = 0.7 + (k / 80) * 6.6;
    let bestI = 0;
    let bestD = Infinity;
    xs.forEach((xi, idx) => {
      const d = Math.abs(x - xi);
      if (d < bestD) { bestD = d; bestI = idx; }
    });
    return `${px(x)},${py(ys[bestI])}`;
  }).join(' ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-7 flex flex-col items-center">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[380px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
          {[1, 2, 3, 4, 5].map((y) => (
            <line key={y} x1={0} y1={py(y)} x2={w} y2={py(y)} stroke="currentColor" strokeOpacity="0.08" />
          ))}
          {showNN && <polyline points={nnPoints} fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeDasharray="4 2" />}
          {showLin && <polyline points={linPoints} fill="none" stroke="#2563eb" strokeWidth="2.5" />}
          {showPoly && <polyline points={polyPoints} fill="none" stroke="#d97706" strokeWidth="2.8" />}
          {xs.map((x, i) => (
            <g key={i}>
              <line x1={px(x)} y1={h} x2={px(x)} y2={py(ys[i])} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2 2" />
              <circle cx={px(x)} cy={py(ys[i])} r="6" fill="#dc2626" stroke="#fff" strokeWidth="2" />
            </g>
          ))}
        </svg>
        <div className="flex flex-wrap gap-3 mt-2.5 text-xs">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showNN} onChange={(e) => setShowNN(e.target.checked)} />
            <span className="text-slate-500 font-semibold">Nearest-Neighbour</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showLin} onChange={(e) => setShowLin(e.target.checked)} />
            <span className="text-blue-600 font-semibold">Linear (Geraden)</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showPoly} onChange={(e) => setShowPoly(e.target.checked)} />
            <span className="text-amber-600 font-semibold">Polynom / Kubisch</span>
          </label>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-2.5 text-xs">
        <div className="font-semibold text-sm">Stützstellen-Höhen verändern:</div>
        {ys.map((yVal, i) => (
          <div key={i} className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)]">
            <div className="flex justify-between">
              <span>Stützstelle P{i + 1} (x = {xs[i]})</span>
              <strong>y = {yVal.toFixed(1)}</strong>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.2}
              step={0.1}
              value={yVal}
              onChange={(e) => {
                const next = [...ys] as [number, number, number, number];
                next[i] = Number(e.target.value);
                setYs(next);
              }}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>
        ))}
        <p className="text-[var(--text-muted)]">
          Beobachte das <strong>Überschwingen</strong> der orangenen Kurve, wenn ein Punkt extrem hoch liegt – genau daraus entsteht bei Bildern der <em>Edge Halo</em>!
        </p>
      </div>
    </div>
  );
}

/** 2. Bilineares 2D-Pixel-Gitter (Q11..Q22 -> R1, R2 -> P) */
export function Bilinear2DGridViz() {
  const [q11, setQ11] = useState(20);
  const [q21, setQ21] = useState(220);
  const [q12, setQ12] = useState(80);
  const [q22, setQ22] = useState(240);
  const [tx, setTx] = useState(0.25);
  const [ty, setTy] = useState(0.5);

  const r1 = q11 + tx * (q21 - q11);
  const r2 = q12 + tx * (q22 - q12);
  const p = r1 + ty * (r2 - r1);

  const gray = (v: number) => {
    const g = Math.max(0, Math.min(255, Math.round(v)));
    return `rgb(${g}, ${g}, ${g})`;
  };

  const size = 260;
  const pad = 40;
  const span = size - 2 * pad;
  const px = pad + tx * span;
  const py = size - pad - ty * span;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <div className="lg:col-span-6 flex justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]">
          {/* Square frame */}
          <rect x={pad} y={pad} width={span} height={span} fill={gray(p)} fillOpacity="0.25" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="4 3" />
          {/* Vertical line R1 -> R2 */}
          <line x1={px} y1={size - pad} x2={px} y2={pad} stroke="#2563eb" strokeWidth="2.5" strokeDasharray="4 3" />
          {/* Corners Q */}
          {[
            { x: pad, y: size - pad, val: q11, lbl: 'Q11' },
            { x: size - pad, y: size - pad, val: q21, lbl: 'Q21' },
            { x: pad, y: pad, val: q12, lbl: 'Q12' },
            { x: size - pad, y: pad, val: q22, lbl: 'Q22' },
          ].map((c) => (
            <g key={c.lbl}>
              <circle cx={c.x} cy={c.y} r="12" fill={gray(c.val)} stroke="#dc2626" strokeWidth="2.5" />
              <text x={c.x} y={c.y - 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">{c.lbl} ({c.val})</text>
            </g>
          ))}
          {/* R1 & R2 */}
          <circle cx={px} cy={size - pad} r="7" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
          <text x={px} y={size - pad + 18} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563eb">R1={r1.toFixed(0)}</text>
          <circle cx={px} cy={pad} r="7" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
          <text x={px} y={pad - 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563eb">R2={r2.toFixed(0)}</text>
          {/* Target P */}
          <circle cx={px} cy={py} r="11" fill={gray(p)} stroke="#16a34a" strokeWidth="3" />
          <text x={px + 15} y={py + 4} fontSize="11" fontWeight="bold" fill="#16a34a">P={p.toFixed(0)}</text>
        </svg>
      </div>

      <div className="lg:col-span-6 space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span>Anteil x (tₓ = {tx})</span>
            <input type="range" min={0} max={1} step={0.25} value={tx} onChange={(e) => setTx(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
          </div>
          <div>
            <span>Anteil y (tᵧ = {ty})</span>
            <input type="range" min={0} max={1} step={0.25} value={ty} onChange={(e) => setTy(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Q12 (oben links)', v: q12, s: setQ12 },
            { l: 'Q22 (oben rechts)', v: q22, s: setQ22 },
            { l: 'Q11 (unten links)', v: q11, s: setQ11 },
            { l: 'Q21 (unten rechts)', v: q21, s: setQ21 },
          ].map((k) => (
            <div key={k.l} className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)]">
              <div className="flex justify-between"><span>{k.l}</span><strong>{k.v}</strong></div>
              <input type="range" min={0} max={255} step={5} value={k.v} onChange={(e) => k.s(Number(e.target.value))} className="w-full accent-slate-600 cursor-pointer" />
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl border border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
          <div><strong>Schritt 1 (x-Achse):</strong> <Formula latex={`R_1 = ${r1.toFixed(1)},\\; R_2 = ${r2.toFixed(1)}`} /></div>
          <div className="mt-1"><strong>Schritt 2 (y-Achse):</strong> <Formula latex={`P = ${p.toFixed(1)}`} /></div>
        </div>
      </div>
    </div>
  );
}

/** 3. Image-Resizing-Lupe (Aliasing vs. Blurring vs. Edge Halo) */
export function ResizingArtifactsViz() {
  const nnRef = useRef<HTMLCanvasElement | null>(null);
  const linRef = useRef<HTMLCanvasElement | null>(null);
  const cubRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 8x8 sharp diagonal lightning shape (like Interpolation S. 7!)
    const src = [
      [210, 210, 20, 20, 210, 210, 210, 210],
      [210, 210, 20, 20, 210, 210, 210, 210],
      [210, 210, 20, 20, 210, 210, 210, 210],
      [210, 210, 20, 20, 20, 20, 210, 210],
      [210, 210, 20, 210, 20, 20, 210, 210],
      [210, 210, 210, 210, 210, 20, 20, 210],
      [210, 210, 210, 210, 210, 20, 20, 210],
      [210, 210, 210, 210, 210, 20, 20, 210],
    ];
    const W = 128;

    const sample = (x: number, y: number) => {
      const cx = Math.max(0, Math.min(7, Math.round(x)));
      const cy = Math.max(0, Math.min(7, Math.round(y)));
      return src[cy][cx];
    };

    const sampleBilin = (x: number, y: number) => {
      const x0 = Math.max(0, Math.min(6, Math.floor(x)));
      const y0 = Math.max(0, Math.min(6, Math.floor(y)));
      const tx = Math.max(0, Math.min(1, x - x0));
      const ty = Math.max(0, Math.min(1, y - y0));
      const r1 = src[y0][x0] * (1 - tx) + src[y0][x0 + 1] * tx;
      const r2 = src[y0 + 1][x0] * (1 - tx) + src[y0 + 1][x0 + 1] * tx;
      return r1 * (1 - ty) + r2 * ty;
    };

    // Catmull-Rom 1D cubic kernel for genuine slight overshoot (Edge Halo!)
    const cubic1D = (p0: number, p1: number, p2: number, p3: number, t: number) => {
      const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
      const b = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
      const c = -0.5 * p0 + 0.5 * p2;
      const d = p1;
      return a * t * t * t + b * t * t + c * t + d;
    };

    const sampleBicubic = (x: number, y: number) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const tx = x - ix;
      const ty = y - iy;
      const get = (cx: number, cy: number) => src[Math.max(0, Math.min(7, cy))][Math.max(0, Math.min(7, cx))];
      const cols = [-1, 0, 1, 2].map((dy) =>
        cubic1D(get(ix - 1, iy + dy), get(ix, iy + dy), get(ix + 1, iy + dy), get(ix + 2, iy + dy), tx)
      );
      return Math.max(0, Math.min(255, cubic1D(cols[0], cols[1], cols[2], cols[3], ty)));
    };

    const renderTo = (canvas: HTMLCanvasElement | null, fn: (x: number, y: number) => number) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = ctx.createImageData(W, W);
      for (let py = 0; py < W; py++) {
        for (let px = 0; px < W; px++) {
          const sx = (px / W) * 7;
          const sy = (py / W) * 7;
          const v = Math.round(fn(sx, sy));
          const i = (py * W + px) * 4;
          img.data[i] = v;
          img.data[i + 1] = v;
          img.data[i + 2] = v;
          img.data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    renderTo(nnRef.current, sample);
    renderTo(linRef.current, sampleBilin);
    renderTo(cubRef.current, sampleBicubic);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
      {[
        { ref: nnRef, title: 'Nearest-Neighbour', tag: 'Aliasing (Treppen)', desc: 'Harte Pixelblöcke, keine Glättung.' },
        { ref: linRef, title: 'Bilinear', tag: 'Blurring (Unschärfe)', desc: 'Weiche Übergänge, aber verwaschene Kanten.' },
        { ref: cubRef, title: 'Bikubisch', tag: 'Edge Halo (Säume)', desc: 'Schärfer, aber helles Überschwingen an Kanten!' },
      ].map((card) => (
        <div key={card.title} className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2">
          <div className="font-bold text-sm">{card.title}</div>
          <canvas ref={card.ref} width={128} height={128} className="mx-auto rounded-lg border border-[var(--border-color)]" />
          <div className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {card.tag}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}
