import type { GeneratedTask } from '../../types/learning';
import { Fraction, Matrix, Vec3 } from '../exactMath';
import { createRng, nextTaskId, type Rng } from './random';

/** 1. Gerade in 2-Punkte-Form aufstellen + Punkt bei Parameter lambda */
export function genM3Line2Pts(rng: Rng = createRng()): GeneratedTask {
  const b = new Vec3(rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4));
  const dir = new Vec3(rng.pick([-2, -1, 1, 2, 3]), rng.pick([-2, -1, 1, 2]), rng.pick([-2, -1, 1, 2]));
  const d = b.add(dir);
  const lam = rng.pick([-2, 2, 3]);
  const ptAtLam = b.add(dir.scale(lam));

  return {
    id: nextTaskId('m3-line'),
    generatorId: 'm3-line-2pts',
    moduleId: 'm3',
    topicLabel: 'Geradengleichung (2-Punkte-Form)',
    prompt: `Stelle die vektorielle Geradengleichung $\\vec{r}(\\lambda) = \\vec{r}_1 + \\lambda\\vec{a}$ durch die Punkte $B(${b.toStringArray().join(', ')})$ und $D(${d.toStringArray().join(', ')})$ auf und berechne den Punkt $C$ für $\\lambda = ${lam}$ (bei $\\vec{r}_1 = \\overrightarrow{OB}$ und $\\vec{a} = \\overrightarrow{BD}$).`,
    checkpoints: [
      {
        id: 'dir',
        label: '1. Richtungsvektor $\\vec{a} = \\overrightarrow{BD}$ (beliebiges Vielfaches $\\neq\\vec{0}$ gültig)',
        kind: 'vector3',
        expected: dir.toStringArray(),
        equivalenceMode: 'collinear-nonzero',
        solutionLatex: dir.toLatex(),
        points: 1,
      },
      {
        id: 'pt',
        label: `2. Ortsvektor $\\vec{r}(${lam})$ für $\\vec{a} = D - B$`,
        kind: 'vector3',
        expected: ptAtLam.toStringArray(),
        solutionLatex: ptAtLam.toLatex(),
        points: 1,
      },
    ],
    hints: [
      '2-Punkte-Form (AnaGeo S. 14): $\\vec{r}(\\lambda) = \\vec{r}_1 + \\lambda(\\vec{r}_2 - \\vec{r}_1)$.',
      `$\\vec{a} = D - B = ${dir.toLatex()}$. Setze $\\lambda = ${lam}$ ein.`,
      `$\\vec{r}(${lam}) = ${b.toLatex()} + (${lam})\\cdot${dir.toLatex()} = ${ptAtLam.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Richtungsvektor: $\\vec{a} = \\overrightarrow{BD} = ${d.toLatex()} - ${b.toLatex()} = ${dir.toLatex()}$`,
      `2. Einsetzen von $\\lambda = ${lam}$: $\\vec{r}(${lam}) = ${b.toLatex()} + (${lam})${dir.toLatex()} = ${ptAtLam.toLatex()}$`,
    ],
  };
}

/** 2. Abstand Punkt - Gerade im Raum (garantiert ganzzahlig!) */
export function genM3DistPointLine(rng: Rng = createRng()): GeneratedTask {
  // Construct orthogonal pair (a, perp) with clean integer lengths so d = |perp| is exact!
  const pairs: { a: [number, number, number]; perp: [number, number, number]; normA: number; d: number }[] = [
    { a: [0, 3, 4], perp: [3, 0, 0], normA: 5, d: 3 },
    { a: [0, 3, 4], perp: [0, -4, 3], normA: 5, d: 5 },
    { a: [3, 4, 0], perp: [0, 0, 4], normA: 5, d: 4 },
    { a: [1, 2, 2], perp: [2, -2, 1], normA: 3, d: 3 },
    { a: [1, 2, 2], perp: [4, -4, 2], normA: 3, d: 6 },
    { a: [2, 0, 0], perp: [0, 3, 4], normA: 2, d: 5 },
  ];
  const tpl = rng.pick(pairs);
  const shift = rng.int(0, 2);
  const rot = (v: [number, number, number]): [number, number, number] => [
    v[shift % 3],
    v[(shift + 1) % 3],
    v[(shift + 2) % 3],
  ];
  const aArr = rot(tpl.a);
  const pArr = rot(tpl.perp);
  const r1 = new Vec3(rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3));
  const a = new Vec3(aArr[0], aArr[1], aArr[2]);
  const perp = new Vec3(pArr[0], pArr[1], pArr[2]);
  const lam = rng.pick([-1, 1, 2]);
  // Q = r1 + lam * a + perp -> shortest distance to line is EXACTLY |perp| = tpl.d!
  const q = r1.add(a.scale(lam)).add(perp);
  const diff = q.sub(r1);
  const cross = a.cross(diff);
  const crossNorm = Math.round(Math.sqrt(cross.normSquared().toNumber()));

  return {
    id: nextTaskId('m3-dpl'),
    generatorId: 'm3-dist-point-line',
    moduleId: 'm3',
    topicLabel: 'Abstand Punkt – Gerade',
    paperRecommended: true,
    prompt: `Berechne den kürzesten Abstand $d$ des Punktes $Q(${q.toStringArray().join(', ')})$ von der Geraden $$g: \\vec{r}(\\lambda) = ${r1.toLatex()} + \\lambda\\cdot${a.toLatex()}.$$`,
    checkpoints: [
      {
        id: 'cross',
        label: '1. Kreuzprodukt $\\vec{a} \\times (\\vec{r}_q - \\vec{r}_1)$',
        kind: 'vector3',
        expected: cross.toStringArray(),
        equivalenceMode: 'exact',
        solutionLatex: cross.toLatex(),
        points: 1,
      },
      {
        id: 'dist',
        label: '2. Abstand $d = \\frac{|\\vec{a}\\times(\\vec{r}_q-\\vec{r}_1)|}{|\\vec{a}|}$',
        kind: 'scalar',
        expected: `${tpl.d}`,
        solutionLatex: `${tpl.d}`,
        points: 2,
        bugDiagnostics: [
          {
            matchScalar: `${crossNorm}`,
            errorType: 'forgot-divide-norm-a',
            message: `Das ist die Parallelogrammfläche $|\\vec{a}\\times(\\vec{r}_q-\\vec{r}_1)| = ${crossNorm}$ – vergiss nicht durch $|\\vec{a}| = ${tpl.normA}$ zu teilen!`,
          },
        ],
      },
    ],
    hints: [
      'Formel (AnaGeo S. 22): $d = \\frac{|\\vec{a}\\times(\\vec{r}_q - \\vec{r}_1)|}{|\\vec{a}|}$.',
      `$\\vec{r}_q - \\vec{r}_1 = ${diff.toLatex()}$, $|\\vec{a}| = ${tpl.normA}$, und $\\vec{a}\\times(\\vec{r}_q-\\vec{r}_1) = ${cross.toLatex()}$.`,
      `$d = \\frac{${crossNorm}}{${tpl.normA}} = ${tpl.d}$.`,
    ],
    fullSolutionSteps: [
      `1. $\\vec{r}_q - \\vec{r}_1 = ${diff.toLatex()}$`,
      `2. $\\vec{a}\\times(\\vec{r}_q-\\vec{r}_1) = ${cross.toLatex()}$ mit Betrag $${crossNorm}$`,
      `3. $|\\vec{a}| = ${tpl.normA} \\Rightarrow d = \\frac{${crossNorm}}{${tpl.normA}} = ${tpl.d}$`,
    ],
  };
}

/** 3. Schnittpunkt & Schnittwinkel zweier Geraden (rückwärts von S konstruiert!) */
export function genM3LinesIntersect(rng: Rng = createRng()): GeneratedTask {
  const anglePairs: { a1: [number, number, number]; a2: [number, number, number]; angle: number }[] = [
    { a1: [1, 1, 0], a2: [1, 0, 1], angle: 60 },
    { a1: [1, 0, 0], a2: [1, 1, 0], angle: 45 },
    { a1: [1, 2, 0], a2: [-2, 1, 0], angle: 90 },
    { a1: [0, 1, 1], a2: [1, 0, 1], angle: 60 },
    { a1: [1, 0, 0], a2: [0, 1, 0], angle: 90 },
  ];
  const tpl = rng.pick(anglePairs);
  const S = new Vec3(rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4));
  const a1 = new Vec3(...tpl.a1);
  const a2 = new Vec3(...tpl.a2);
  const l1 = rng.pick([-2, -1, 1, 2]);
  const l2 = rng.pick([-2, -1, 1, 2]);
  const r1 = S.sub(a1.scale(l1));
  const r2 = S.sub(a2.scale(l2));

  return {
    id: nextTaskId('m3-g-int'),
    generatorId: 'm3-lines-intersect',
    moduleId: 'm3',
    topicLabel: 'Schnittpunkt & Winkel zweier Geraden',
    paperRecommended: true,
    prompt: `Die beiden Geraden $$g_1: \\vec{r}(\\lambda_1) = ${r1.toLatex()} + \\lambda_1${a1.toLatex()} \\quad \\text{und} \\quad g_2: \\vec{r}(\\lambda_2) = ${r2.toLatex()} + \\lambda_2${a2.toLatex()}$$ schneiden sich in einem Punkt $S$. Bestimme den Schnittpunkt $S$ und den spitzen Schnittwinkel $\\rho$.`,
    checkpoints: [
      {
        id: 'S',
        label: '1. Ortsvektor des Schnittpunkts $S$',
        kind: 'vector3',
        expected: S.toStringArray(),
        solutionLatex: S.toLatex(),
        points: 2,
      },
      {
        id: 'angle',
        label: '2. Schnittwinkel $\\rho$',
        kind: 'scalar',
        expected: `${tpl.angle}`,
        unit: '°',
        solutionLatex: `${tpl.angle}^\\circ`,
        points: 1,
      },
    ],
    hints: [
      'Setze $g_1 = g_2$ (ergibt 3 Gleichungen für $\\lambda_1, \\lambda_2$). Löse zwei Gleichungen und mache in der 3. die Probe!',
      `Die Lösung des LGS ist $\\lambda_1 = ${l1}$ und $\\lambda_2 = ${l2}$. Setze $\\lambda_1$ in $g_1$ ein.`,
      `Schnittpunkt $S = ${S.toLatex()}$; Schnittwinkel aus $\\cos\\rho = \\frac{|\\vec{a}_1\\cdot\\vec{a}_2|}{|\\vec{a}_1||\\vec{a}_2|}$ ergibt $\\rho = ${tpl.angle}^\\circ$.`,
    ],
    fullSolutionSteps: [
      `1. Gleichsetzen $g_1 = g_2$ liefert $\\lambda_1 = ${l1}$ und $\\lambda_2 = ${l2}$ (Probe in allen 3 Zeilen stimmt ✓).`,
      `2. Einsetzen in $g_1$: $S = ${r1.toLatex()} + (${l1})${a1.toLatex()} = ${S.toLatex()}$.`,
      `3. Winkel zwischen $\\vec{a}_1$ und $\\vec{a}_2$: $\\rho = ${tpl.angle}^\\circ$.`,
    ],
  };
}

/** 4. Abstand zweier windschiefer Geraden (Spatprodukt / 3x3-Determinante) */
export function genM3SkewLinesDist(rng: Rng = createRng()): GeneratedTask {
  // Choose clean a1, a2 with integer |a1 x a2| = normN, and offset r2 - r1 = d * (n / normN) + k1*a1 + k2*a2
  const setups: { a1: [number, number, number]; a2: [number, number, number]; unitN: [number, number, number]; normN: number }[] = [
    { a1: [1, 0, 0], a2: [0, 1, 0], unitN: [0, 0, 1], normN: 1 },
    { a1: [2, 0, 0], a2: [0, 1, 0], unitN: [0, 0, 1], normN: 2 },
    { a1: [1, 0, 0], a2: [0, 3, 4], unitN: [0, -4, 3], normN: 5 }, // wait unitN here has norm 5, so use n directly with d multiple of 5? Easier: use integer normal steps!
    { a1: [0, 1, 0], a2: [0, 0, 2], unitN: [1, 0, 0], normN: 2 },
    { a1: [1, 1, 0], a2: [1, -1, 0], unitN: [0, 0, 1], normN: 2 },
  ];
  // Pick from pure unit-normal ones (indices 0, 1, 3, 4) so any integer d works cleanly!
  const chosen = rng.pick([setups[0], setups[1], setups[3], setups[4]]);
  const d = rng.int(2, 6);
  const a1 = new Vec3(...chosen.a1);
  const a2 = new Vec3(...chosen.a2);
  const uN = new Vec3(...chosen.unitN);
  const r1 = new Vec3(rng.int(-2, 2), rng.int(-2, 2), rng.int(-2, 2));
  const r2 = r1.add(uN.scale(d)).add(a1.scale(rng.pick([-1, 1]))).add(a2.scale(rng.pick([-1, 1])));

  const n = a1.cross(a2);
  const diff = r2.sub(r1);
  const spat = n.dot(diff).abs();

  return {
    id: nextTaskId('m3-skew'),
    generatorId: 'm3-dist-skew-lines',
    moduleId: 'm3',
    topicLabel: 'Abstand windschiefer Geraden',
    paperRecommended: true,
    prompt: `Berechne den Abstand $d$ der beiden windschiefen Geraden $$g_1: \\vec{r}(\\lambda_1) = ${r1.toLatex()} + \\lambda_1${a1.toLatex()}, \\qquad g_2: \\vec{r}(\\lambda_2) = ${r2.toLatex()} + \\lambda_2${a2.toLatex()}.$$`,
    checkpoints: [
      {
        id: 'n',
        label: '1. Gemeinsamer Normalenvektor $\\vec{n} = \\vec{a}_1 \\times \\vec{a}_2$ (kollineare Vektoren gültig)',
        kind: 'vector3',
        expected: n.toStringArray(),
        equivalenceMode: 'collinear-nonzero',
        solutionLatex: n.toLatex(),
        points: 1,
      },
      {
        id: 'dist',
        label: '2. Abstand $d = \\frac{|\\vec{n}\\cdot(\\vec{r}_2 - \\vec{r}_1)|}{|\\vec{n}|}$',
        kind: 'scalar',
        expected: `${d}`,
        solutionLatex: `${d}`,
        points: 2,
        bugDiagnostics:
          chosen.normN > 1
            ? [
                {
                  matchScalar: spat.toString(),
                  errorType: 'forgot-divide-norm-n',
                  message: `Du hast den Betrag des Spatprodukts ($${spat.toLatex()}$) berechnet, aber vergessen durch $|\\vec{n}| = ${chosen.normN}$ zu teilen!`,
                },
              ]
            : [],
      },
    ],
    hints: [
      'Formel (AnaGeo S. 34): Zuerst $\\vec{n} = \\vec{a}_1 \\times \\vec{a}_2$, dann $d = \\frac{|\\vec{n}\\cdot(\\vec{r}_2 - \\vec{r}_1)|}{|\\vec{n}|}$.',
      `$\\vec{n} = ${n.toLatex()}$ ($|\\vec{n}| = ${chosen.normN}$) und $\\vec{r}_2 - \\vec{r}_1 = ${diff.toLatex()}$.`,
      `$d = \\frac{${spat.toLatex()}}{${chosen.normN}} = ${d}$.`,
    ],
    fullSolutionSteps: [
      `1. $\\vec{n} = \\vec{a}_1 \\times \\vec{a}_2 = ${n.toLatex()}$ mit $|\\vec{n}| = ${chosen.normN}$`,
      `2. $\\vec{r}_2 - \\vec{r}_1 = ${diff.toLatex()}$, Spatprodukt-Betrag $|\\vec{n}\\cdot(\\vec{r}_2-\\vec{r}_1)| = ${spat.toLatex()}$`,
      `3. $d = \\frac{${spat.toLatex()}}{${chosen.normN}} = ${d}$`,
    ],
  };
}

/** 5. Ebene Normalenvektor & Abstand Punkt - Ebene */
export function genM3PlaneAndDist(rng: Rng = createRng()): GeneratedTask {
  // Clean normals with integer length!
  const normals: { n: [number, number, number]; norm: number }[] = [
    { n: [1, 2, 2], norm: 3 },
    { n: [2, -1, 2], norm: 3 },
    { n: [0, 3, 4], norm: 5 },
    { n: [3, -4, 0], norm: 5 },
    { n: [2, 3, 6], norm: 7 },
  ];
  const chosen = rng.pick(normals);
  const n = new Vec3(...chosen.n);
  const p1 = new Vec3(rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3));
  const d = rng.int(1, 5);
  // Construct Q so n · (Q - p1) = ± d * norm
  // Since n · n = norm^2, let's pick an integer vector v with n · v = d * norm!
  // For n=(1,2,2), norm=3 -> (3,0,0)·n = 3! So Q = p1 + (d * chosen.norm / n_i) ... simpler:
  // Just shift along one non-zero coordinate or use n itself scaled when d is multiple of norm, OR precomputed step!
  const unitSteps: Record<string, [number, number, number]> = {
    '1,2,2': [3, 0, 0], // n·step = 3 = norm!
    '2,-1,2': [0, -3, 0], // n·step = 3 = norm!
    '0,3,4': [0, -1, 2], // 0 - 3 + 8 = 5 = norm!
    '3,-4,0': [3, 1, 0], // 9 - 4 = 5 = norm!
    '2,3,6': [2, 1, 0], // 4 + 3 = 7 = norm!
  };
  const step = new Vec3(...unitSteps[chosen.n.join(',')]);
  const sign = rng.sign();
  const q = p1.add(step.scale(d * sign));
  const diff = q.sub(p1);
  const numer = n.dot(diff).abs();

  return {
    id: nextTaskId('m3-dpe'),
    generatorId: 'm3-dist-point-plane',
    moduleId: 'm3',
    topicLabel: 'Abstand Punkt – Ebene',
    paperRecommended: true,
    prompt: `Gegeben ist die Ebene $E: ${n.toLatex()} \\cdot \\left(\\vec{r} - ${p1.toLatex()}\\right) = 0$ und der Punkt $Q(${q.toStringArray().join(', ')})$. Berechne den senkrechten Abstand $d(Q, E)$.`,
    checkpoints: [
      {
        id: 'norm',
        label: '1. Betrag des Normalenvektors $|\\vec{n}|$',
        kind: 'scalar',
        expected: `${chosen.norm}`,
        solutionLatex: `${chosen.norm}`,
        points: 1,
      },
      {
        id: 'dist',
        label: '2. Abstand $d = \\frac{|\\vec{n}\\cdot(\\vec{r}_Q - \\vec{r}_1)|}{|\\vec{n}|}$',
        kind: 'scalar',
        expected: `${d}`,
        solutionLatex: `${d}`,
        points: 2,
        bugDiagnostics: [
          {
            matchScalar: `${-d}`,
            errorType: 'negative-distance',
            message: 'Ein Abstand ist immer $\\ge 0$! Vergiss die Betragsstriche im Zähler nicht.',
          },
          {
            matchScalar: numer.toString(),
            errorType: 'forgot-divide-norm-n',
            message: `Das ist nur der Zähler $|\\vec{n}\\cdot(\\vec{r}_Q-\\vec{r}_1)| = ${numer.toLatex()}$ – teile noch durch $|\\vec{n}| = ${chosen.norm}$!`,
          },
        ],
      },
    ],
    hints: [
      'Formel (AnaGeo S. 58): $d = \\frac{|\\vec{n}\\cdot(\\vec{r}_Q - \\vec{r}_1)|}{|\\vec{n}|}$.',
      `$\\vec{r}_Q - \\vec{r}_1 = ${diff.toLatex()}$, $|\\vec{n}| = ${chosen.norm}$ und $|\\vec{n}\\cdot(\\vec{r}_Q - \\vec{r}_1)| = ${numer.toLatex()}$.`,
      `$d = \\frac{${numer.toLatex()}}{${chosen.norm}} = ${d}$.`,
    ],
    fullSolutionSteps: [
      `1. $|\\vec{n}| = ${chosen.norm}$`,
      `2. $\\vec{r}_Q - \\vec{r}_1 = ${diff.toLatex()}$`,
      `3. $d = \\frac{|${n.toLatex()}\\cdot${diff.toLatex()}|}{${chosen.norm}} = \\frac{${numer.toLatex()}}{${chosen.norm}} = ${d}$`,
    ],
  };
}

/** 6. Schnittpunkt & Schnittwinkel Gerade - Ebene (mit arcsin Bug-Diagnose!) */
export function genM3LinePlaneIntersect(rng: Rng = createRng()): GeneratedTask {
  // Pairs (n, a) with exact sin(alpha) = |n·a| / (|n||a|)
  const configs: { n: [number, number, number]; a: [number, number, number]; alpha: number; sinLatex: string }[] = [
    { n: [0, 1, 1], a: [1, 0, 1], alpha: 30, sinLatex: '\\frac{1}{2}' },
    { n: [1, 0, 1], a: [1, 1, 0], alpha: 30, sinLatex: '\\frac{1}{2}' },
    { n: [1, 0, 0], a: [1, 1, 0], alpha: 45, sinLatex: '\\frac{\\sqrt{2}}{2}' },
    { n: [0, 0, 1], a: [0, 1, 1], alpha: 45, sinLatex: '\\frac{\\sqrt{2}}{2}' },
    { n: [0, 0, 1], a: [0, 0, 2], alpha: 90, sinLatex: '1' },
  ];
  const cfg = rng.pick(configs);
  const n = new Vec3(...cfg.n);
  const a = new Vec3(...cfg.a);
  const S = new Vec3(rng.int(-2, 4), rng.int(-2, 4), rng.int(-2, 4));
  // Pick plane base point P0 = S + u where n·u = 0
  const orthCandidate = !n.x.isZero()
    ? new Vec3(n.y.neg(), n.x, 0)
    : new Vec3(1, 0, 0);
  const p0 = S.add(orthCandidate);
  const lamS = rng.pick([-2, -1, 1, 2, 3]);
  const rg = S.sub(a.scale(lamS));

  const angleBugs =
    cfg.alpha === 30
      ? [
          {
            matchScalar: '60',
            errorType: 'arccos-instead-of-arcsin',
            message:
              '60° ist der Winkel zum Normalenvektor $\\vec{n}$! Für Gerade–Ebene gilt $\\alpha = \\arcsin\\left(\\frac{|\\vec{n}\\cdot\\vec{a}|}{|\\vec{n}||\\vec{a}|}\\right) = 90^\\circ - 60^\\circ = 30^\\circ$!',
          },
        ]
      : [];

  return {
    id: nextTaskId('m3-ge'),
    generatorId: 'm3-line-plane-intersect',
    moduleId: 'm3',
    topicLabel: 'Schnittpunkt & Winkel Gerade – Ebene',
    paperRecommended: true,
    prompt: `Gegeben sind die Ebene $E: ${n.toLatex()}\\cdot\\left(\\vec{r} - ${p0.toLatex()}\\right) = 0$ und die Gerade $g: \\vec{r}(\\lambda) = ${rg.toLatex()} + \\lambda${a.toLatex()}$. Bestimme $\\lambda_s$, den Schnittpunkt $S$ und den Schnittwinkel $\\alpha$.`,
    checkpoints: [
      {
        id: 'lam',
        label: '1. Schnittparameter $\\lambda_s$',
        kind: 'scalar',
        expected: `${lamS}`,
        solutionLatex: `${lamS}`,
        points: 1,
      },
      {
        id: 'S',
        label: '2. Ortsvektor des Schnittpunkts $S$',
        kind: 'vector3',
        expected: S.toStringArray(),
        solutionLatex: S.toLatex(),
        points: 1,
      },
      {
        id: 'alpha',
        label: '3. Schnittwinkel $\\alpha$ (Gerade–Ebene)',
        kind: 'scalar',
        expected: `${cfg.alpha}`,
        unit: '°',
        solutionLatex: `${cfg.alpha}^\\circ`,
        points: 2,
        bugDiagnostics: angleBugs,
      },
    ],
    hints: [
      'Formel (AnaGeo S. 69): $\\lambda_s = \\frac{\\vec{n}\\cdot(\\vec{r}_0 - \\vec{r}_g)}{\\vec{n}\\cdot\\vec{a}}$. Für den Winkel gilt $\\arcsin$ (nicht $\\arccos$)!',
      `$\\lambda_s = ${lamS} \\Rightarrow S = ${S.toLatex()}$. Für den Winkel: $\\sin\\alpha = ${cfg.sinLatex}$.`,
      `$\\alpha = \\arcsin\\left(${cfg.sinLatex}\\right) = ${cfg.alpha}^\\circ$.`,
    ],
    fullSolutionSteps: [
      `1. $\\lambda_s = \\frac{\\vec{n}\\cdot(\\vec{r}_0 - \\vec{r}_g)}{\\vec{n}\\cdot\\vec{a}} = ${lamS}$`,
      `2. In $g$ einsetzen: $S = ${rg.toLatex()} + (${lamS})${a.toLatex()} = ${S.toLatex()}$`,
      `3. Schnittwinkel (Achtung $\\arcsin$!): $\\sin\\alpha = ${cfg.sinLatex} \\Rightarrow \\alpha = ${cfg.alpha}^\\circ$`,
    ],
  };
}

/** 7. Schnittgerade & Schnittwinkel zweier Ebenen (Q14: geometrische Äquivalenz!) */
export function genM3PlanePlaneLine(rng: Rng = createRng()): GeneratedTask {
  const configs: { n1: [number, number, number]; n2: [number, number, number]; angle: number; cosLatex: string }[] = [
    { n1: [1, 1, 0], n2: [0, 1, 1], angle: 60, cosLatex: '\\frac{1}{2}' },
    { n1: [1, 0, 1], n2: [0, 1, 1], angle: 60, cosLatex: '\\frac{1}{2}' },
    { n1: [1, 0, 0], n2: [1, 1, 0], angle: 45, cosLatex: '\\frac{\\sqrt{2}}{2}' },
    { n1: [1, 0, 0], n2: [0, 1, 0], angle: 90, cosLatex: '0' },
  ];
  const cfg = rng.pick(configs);
  const n1 = new Vec3(...cfg.n1);
  const n2 = new Vec3(...cfg.n2);
  const dir = n1.cross(n2);
  // Pick a clean anchor point P0 on both planes
  const p0 = new Vec3(rng.int(0, 3), rng.int(0, 3), rng.int(0, 3));
  const d1 = n1.dot(p0).toNumber();
  const d2 = n2.dot(p0).toNumber();

  const fmtPlane = (n: Vec3, d: number) => {
    const terms: string[] = [];
    const arr = [n.x.toNumber(), n.y.toNumber(), n.z.toNumber()];
    const vars = ['x', 'y', 'z'];
    arr.forEach((c, i) => {
      if (c === 0) return;
      const t = Math.abs(c) === 1 ? vars[i] : `${Math.abs(c)}${vars[i]}`;
      terms.push(terms.length === 0 ? (c < 0 ? `-${t}` : t) : c < 0 ? `- ${t}` : `+ ${t}`);
    });
    return `${terms.join(' ')} = ${d}`;
  };

  return {
    id: nextTaskId('m3-ee'),
    generatorId: 'm3-plane-plane-line',
    moduleId: 'm3',
    topicLabel: 'Schnittgerade & Winkel zweier Ebenen',
    paperRecommended: true,
    prompt: `Bestimme die Schnittgerade $g: \\vec{r}(\\lambda) = \\vec{r}_0 + \\lambda\\vec{a}$ und den Schnittwinkel $\\alpha$ der Ebenen: $$E_1: ${fmtPlane(n1, d1)}, \\qquad E_2: ${fmtPlane(n2, d2)}$$ *(Hinweis: Jeder gültige Stützpunkt auf $g$ und jedes Vielfache des Richtungsvektors $\\neq\\vec{0}$ werden automatisch als richtig gewertet!)*`,
    checkpoints: [
      {
        id: 'dir',
        label: '1. Richtungsvektor $\\vec{a} = \\vec{n}_1 \\times \\vec{n}_2$',
        kind: 'vector3',
        expected: dir.toStringArray(),
        equivalenceMode: 'collinear-nonzero',
        solutionLatex: dir.toLatex(),
        points: 1,
      },
      {
        id: 'r0',
        label: '2. Ein beliebiger Stützpunkt $\\vec{r}_0$ auf der Schnittgeraden',
        kind: 'vector3',
        expected: p0.toStringArray(),
        geoCheck: {
          type: 'point-on-line',
          origin: p0.toStringArray(),
          dir: dir.toStringArray(),
        },
        solutionLatex: p0.toLatex(),
        points: 2,
      },
      {
        id: 'angle',
        label: '3. Schnittwinkel $\\alpha$',
        kind: 'scalar',
        expected: `${cfg.angle}`,
        unit: '°',
        solutionLatex: `${cfg.angle}^\\circ`,
        points: 1,
      },
    ],
    hints: [
      'Richtungsvektor: $\\vec{a} = \\vec{n}_1 \\times \\vec{n}_2$. Stützpunkt: Setze eine Koordinate frei (z. B. $x_0=0$ oder $z_0=0$) und löse das $2\\times 2$-LGS.',
      `$\\vec{a} = ${dir.toLatex()}$. Ein gültiger gemeinsamer Punkt ist z. B. $P_0(${p0.toStringArray().join(', ')})$.`,
      `Schnittwinkel aus $\\cos\\alpha = \\frac{|\\vec{n}_1\\cdot\\vec{n}_2|}{|\\vec{n}_1||\\vec{n}_2|} = ${cfg.cosLatex} \\Rightarrow \\alpha = ${cfg.angle}^\\circ$.`,
    ],
    fullSolutionSteps: [
      `1. $\\vec{n}_1 = ${n1.toLatex()}, \\vec{n}_2 = ${n2.toLatex()} \\Rightarrow \\vec{a} = \\vec{n}_1\\times\\vec{n}_2 = ${dir.toLatex()}$`,
      `2. Gemeinsamer Punkt (erfüllt $E_1$ und $E_2$): z. B. $\\vec{r}_0 = ${p0.toLatex()}$`,
      `3. Winkel: $\\cos\\alpha = ${cfg.cosLatex} \\Rightarrow \\alpha = ${cfg.angle}^\\circ$`,
    ],
  };
}

// Unused Fraction/Matrix guard removed cleanly
void Fraction;
void Matrix;

export const M3_GENERATOR_MAP: Record<string, (rng?: Rng) => GeneratedTask> = {
  'm3-line-2pts': genM3Line2Pts,
  'm3-dist-point-line': genM3DistPointLine,
  'm3-lines-intersect': genM3LinesIntersect,
  'm3-dist-skew-lines': genM3SkewLinesDist,
  'm3-dist-point-plane': genM3PlaneAndDist,
  'm3-line-plane-intersect': genM3LinePlaneIntersect,
  'm3-plane-plane-line': genM3PlanePlaneLine,
};
