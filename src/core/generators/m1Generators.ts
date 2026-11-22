import type { GeneratedTask } from '../../types/learning';
import { Fraction, Vec3 } from '../exactMath';
import { createRng, nextTaskId, type Rng } from './random';

/** Helper: permute and sign-flip a 3D integer tuple for diverse nice vectors */
function randomizeTuple3(tuple: readonly [number, number, number], rng: Rng): [number, number, number] {
  const perm = rng.shuffle(tuple);
  return [perm[0] * rng.sign(), perm[1] * rng.sign(), perm[2] * rng.sign()];
}

/** 1. Vektoraddition, Subtraktion & Skalarmultiplikation (3D) */
export function genM1VecOps(rng: Rng = createRng()): GeneratedTask {
  const a = new Vec3(rng.int(-6, 6), rng.int(-6, 6), rng.int(-6, 6));
  const b = new Vec3(rng.int(-6, 6), rng.int(-6, 6), rng.int(-6, 6));
  const k = rng.pick([-3, -2, 2, 3]);
  const isSub = rng.next() < 0.5;

  const result = isSub ? a.sub(b.scale(k)) : a.add(b.scale(k));
  const wrongSign = isSub ? a.add(b.scale(k)) : a.sub(b.scale(k));
  const opStr = isSub ? '-' : '+';

  return {
    id: nextTaskId('m1-ops'),
    generatorId: 'm1-vec-ops',
    moduleId: 'm1',
    topicLabel: 'Vektoraddition & Skalarmultiplikation',
    prompt: `Berechne den resultierenden Vektor $\\vec{c} = \\vec{a} ${opStr} ${k} \\cdot \\vec{b}$ für: $$\\vec{a} = ${a.toLatex()}, \\quad \\vec{b} = ${b.toLatex()}$$`,
    checkpoints: [
      {
        id: 'c',
        label: 'Ergebnisvektor $\\vec{c}$',
        kind: 'vector3',
        expected: result.toStringArray(),
        solutionLatex: result.toLatex(),
        points: 2,
        bugDiagnostics: [
          {
            matchVector: wrongSign.toStringArray(),
            errorType: 'add-sub-swap',
            message: `Du hast ${isSub ? 'addiert statt subtrahiert' : 'subtrahiert statt addiert'}! Achte auf das Rechenzeichen zwischen $\\vec{a}$ und $${k}\\vec{b}$.`,
          },
        ],
      },
    ],
    hints: [
      `Multipliziere zuerst jede Komponente von $\\vec{b}$ mit $${k}$ und verrechne danach zeilenweise mit $\\vec{a}$.`,
      `$${k}\\cdot\\vec{b} = ${b.scale(k).toLatex()}$. Jetzt berechne $\\vec{a} ${opStr} (${k}\\cdot\\vec{b})$ Zeile für Zeile.`,
      `$\\vec{c} = ${result.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Skalarmultiplikation: $${k}\\cdot\\vec{b} = ${b.scale(k).toLatex()}$`,
      `2. Komponentenweise ${isSub ? 'Subtraktion' : 'Addition'}: $${a.toLatex()} ${opStr} ${b.scale(k).toLatex()} = ${result.toLatex()}$`,
    ],
  };
}

/** 2. Verbindungsvektor, Betrag & Einheitsvektor (Pythagoreische Quadrupel!) */
const NICE_3D_NORMS: readonly { tuple: readonly [number, number, number]; norm: number }[] = [
  { tuple: [1, 2, 2], norm: 3 },
  { tuple: [2, 3, 6], norm: 7 },
  { tuple: [2, 4, 4], norm: 6 },
  { tuple: [0, 3, 4], norm: 5 },
  { tuple: [1, 4, 8], norm: 9 },
  { tuple: [0, 6, 8], norm: 10 },
];

export function genM1ConnectAndNorm(rng: Rng = createRng()): GeneratedTask {
  const chosen = rng.pick(NICE_3D_NORMS);
  const [dx, dy, dz] = randomizeTuple3(chosen.tuple, rng);
  const p1 = new Vec3(rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4));
  const diff = new Vec3(dx, dy, dz);
  const p2 = p1.add(diff);
  const norm = chosen.norm;
  const unit = diff.scale(new Fraction(1, norm));

  const reversedDiff = diff.scale(-1);

  return {
    id: nextTaskId('m1-norm'),
    generatorId: 'm1-connect-norm',
    moduleId: 'm1',
    topicLabel: 'Verbindungsvektor, Betrag & Normieren',
    paperRecommended: true,
    prompt: `Gegeben sind die Punkte $P_1(${p1.x.toString()}, ${p1.y.toString()}, ${p1.z.toString()})$ und $P_2(${p2.x.toString()}, ${p2.y.toString()}, ${p2.z.toString()})$. Bestimme den Verbindungsvektor $\\vec{a} = \\overrightarrow{P_1 P_2}$, seinen Betrag $|\\vec{a}|$ und den zugehörigen Einheitsvektor $\\vec{e}_a$.`,
    checkpoints: [
      {
        id: 'vec',
        label: '1. Verbindungsvektor $\\vec{a} = \\overrightarrow{P_1 P_2}$',
        kind: 'vector3',
        expected: diff.toStringArray(),
        solutionLatex: diff.toLatex(),
        points: 1,
        bugDiagnostics: [
          {
            matchVector: reversedDiff.toStringArray(),
            errorType: 'reversed-points',
            message:
              'Reihenfolge vertauscht! Merke: „Spitze minus Fuß“, also $P_2 - P_1$ (nicht $P_1 - P_2$).',
          },
        ],
      },
      {
        id: 'norm',
        label: '2. Betrag $|\\vec{a}|$',
        kind: 'scalar',
        expected: `${norm}`,
        solutionLatex: `${norm}`,
        points: 1,
        bugDiagnostics: [
          {
            matchScalar: `${norm * norm}`,
            errorType: 'forgot-sqrt',
            message: `Das ist noch $|\\vec{a}|^2 = ${norm * norm}$ – vergiss nicht die Wurzel zu ziehen!`,
          },
        ],
      },
      {
        id: 'unit',
        label: '3. Einheitsvektor $\\vec{e}_a$',
        kind: 'vector3',
        expected: unit.toStringArray(),
        solutionLatex: unit.toLatex(),
        points: 1,
      },
    ],
    hints: [
      'Verbindungsvektor: „Spitze minus Fuß“ $\\overrightarrow{P_1 P_2} = P_2 - P_1$. Betrag: $\\sqrt{a_x^2+a_y^2+a_z^2}$.',
      `$\\vec{a} = ${diff.toLatex()}$ und $|\\vec{a}| = \\sqrt{${dx * dx} + ${dy * dy} + ${dz * dz}} = \\sqrt{${norm * norm}} = ${norm}$.`,
      `Teile jede Komponente von $\\vec{a}$ durch $|\\vec{a}| = ${norm}$: $\\vec{e}_a = ${unit.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Spitze minus Fuß: $\\vec{a} = ${p2.toLatex()} - ${p1.toLatex()} = ${diff.toLatex()}$`,
      `2. Betrag: $|\\vec{a}| = \\sqrt{(${dx})^2 + (${dy})^2 + (${dz})^2} = \\sqrt{${norm * norm}} = ${norm}$`,
      `3. Normieren: $\\vec{e}_a = \\frac{1}{${norm}}${diff.toLatex()} = ${unit.toLatex()}$`,
    ],
  };
}

/** 3. Skalarprodukt & exakter Winkel (ohne Taschenrechner!) */
interface AngleTemplate {
  a: [number, number, number];
  b: [number, number, number];
  angleDeg: number;
  cosLatex: string;
}

const EXACT_ANGLE_TEMPLATES: readonly AngleTemplate[] = [
  // 90° (orthogonal!)
  { a: [2, -1, 2], b: [1, 4, 1], angleDeg: 90, cosLatex: '0' },
  { a: [3, 0, -4], b: [4, 2, 3], angleDeg: 90, cosLatex: '0' },
  { a: [1, 2, -1], b: [2, -1, 0], angleDeg: 90, cosLatex: '0' },
  // 60° (cos = 1/2)
  { a: [1, 1, 0], b: [1, 0, 1], angleDeg: 60, cosLatex: '\\frac{1}{2}' },
  { a: [2, 2, 0], b: [0, 1, 1], angleDeg: 60, cosLatex: '\\frac{1}{2}' },
  // 120° (cos = -1/2)
  { a: [1, 1, 0], b: [-1, 0, 1], angleDeg: 120, cosLatex: '-\\frac{1}{2}' },
  // 45° (cos = sqrt(2)/2)
  { a: [1, 0, 0], b: [1, 1, 0], angleDeg: 45, cosLatex: '\\frac{\\sqrt{2}}{2}' },
  { a: [0, 2, 0], b: [0, 1, 1], angleDeg: 45, cosLatex: '\\frac{\\sqrt{2}}{2}' },
  // 135° (cos = -sqrt(2)/2)
  { a: [1, 0, 0], b: [-1, 1, 0], angleDeg: 135, cosLatex: '-\\frac{\\sqrt{2}}{2}' },
  // 0° (parallel)
  { a: [1, 2, 2], b: [2, 4, 4], angleDeg: 0, cosLatex: '1' },
  // 180° (anti-parallel)
  { a: [1, -2, 2], b: [-2, 4, -4], angleDeg: 180, cosLatex: '-1' },
];

export function genM1DotAndAngle(rng: Rng = createRng()): GeneratedTask {
  const tpl = rng.pick(EXACT_ANGLE_TEMPLATES);
  // Apply same random axis permutation & axis sign flips to BOTH a and b -> preserves dot product & angle!
  const perm = rng.shuffle([0, 1, 2]);
  const signs: [number, number, number] = [rng.sign(), rng.sign(), rng.sign()];
  const scaleA = rng.pick([1, 2]);
  const aArr: [number, number, number] = [
    tpl.a[perm[0]] * signs[0] * scaleA,
    tpl.a[perm[1]] * signs[1] * scaleA,
    tpl.a[perm[2]] * signs[2] * scaleA,
  ];
  const bArr: [number, number, number] = [
    tpl.b[perm[0]] * signs[0],
    tpl.b[perm[1]] * signs[1],
    tpl.b[perm[2]] * signs[2],
  ];

  const a = new Vec3(aArr[0], aArr[1], aArr[2]);
  const b = new Vec3(bArr[0], bArr[1], bArr[2]);
  const dot = a.dot(b);
  const normASq = a.normSquared().toNumber();
  const normBSq = b.normSquared().toNumber();

  const angleBugs = [];
  if (tpl.angleDeg !== 90 && tpl.angleDeg !== 0 && tpl.angleDeg !== 180) {
    // Classic mistake: confusing arccos with arcsin -> 90 - angle
    if (tpl.angleDeg < 90 && 90 - tpl.angleDeg !== tpl.angleDeg) {
      angleBugs.push({
        matchScalar: `${90 - tpl.angleDeg}`,
        errorType: 'arcsin-instead-of-arccos',
        message:
          'Achtung: Zwischen zwei Vektoren nutzt man $\\arccos$ (nicht $\\arcsin$)! Prüfe nochmal deinen Wert für $\\cos(\\rho)$.',
      });
    }
    if (tpl.angleDeg > 90) {
      angleBugs.push({
        matchScalar: `${180 - tpl.angleDeg}`,
        errorType: 'ignored-negative-cos',
        message:
          'Fast! Das Skalarprodukt ist **negativ**, also ist der Winkel stumpf ($> 90^\\circ$): $\\rho = 180^\\circ - ' +
          `${180 - tpl.angleDeg}^\\circ = ${tpl.angleDeg}^\\circ$.`,
      });
    }
  }

  return {
    id: nextTaskId('m1-dot'),
    generatorId: 'm1-dot-angle',
    moduleId: 'm1',
    topicLabel: 'Skalarprodukt & Winkel',
    paperRecommended: true,
    prompt: `Gegeben sind die Vektoren $$\\vec{a} = ${a.toLatex()} \\quad \\text{und} \\quad \\vec{b} = ${b.toLatex()}.$$ Berechne zuerst das Skalarprodukt $\\vec{a}\\cdot\\vec{b}$ und bestimme anschließend den eingeschlossenen Winkel $\\rho$ (in Grad, ohne Taschenrechner).`,
    checkpoints: [
      {
        id: 'dot',
        label: '1. Skalarprodukt $\\vec{a} \\cdot \\vec{b}$',
        kind: 'scalar',
        expected: dot.toString(),
        solutionLatex: dot.toLatex(),
        points: 1,
      },
      {
        id: 'angle',
        label: '2. Eingeschlossener Winkel $\\rho$',
        kind: 'scalar',
        expected: `${tpl.angleDeg}`,
        unit: '°',
        solutionLatex: `${tpl.angleDeg}^\\circ`,
        points: 2,
        bugDiagnostics: angleBugs,
      },
    ],
    hints: [
      'Skalarprodukt: $\\vec{a}\\cdot\\vec{b} = a_x b_x + a_y b_y + a_z b_z$. Danach $\\cos\\rho = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\cdot|\\vec{b}|}$.',
      `$\\vec{a}\\cdot\\vec{b} = ${dot.toLatex()}$, $|\\vec{a}| = \\sqrt{${normASq}}$, $|\\vec{b}| = \\sqrt{${normBSq}}$, also $\\cos\\rho = ${tpl.cosLatex}$.`,
      `$\\rho = \\arccos\\left(${tpl.cosLatex}\\right) = ${tpl.angleDeg}^\\circ$.`,
    ],
    fullSolutionSteps: [
      `1. Skalarprodukt: $(${aArr[0]})(${bArr[0]}) + (${aArr[1]})(${bArr[1]}) + (${aArr[2]})(${bArr[2]}) = ${dot.toLatex()}$`,
      `2. Beträge: $|\\vec{a}| = \\sqrt{${normASq}}$, $|\\vec{b}| = \\sqrt{${normBSq}}$`,
      `3. Winkel: $\\cos\\rho = \\frac{${dot.toLatex()}}{\\sqrt{${normASq}}\\cdot\\sqrt{${normBSq}}} = ${tpl.cosLatex} \\Rightarrow \\rho = ${tpl.angleDeg}^\\circ$`,
    ],
  };
}

/** 4. Kreuzprodukt & Parallelogrammfläche (sauberer ganzzahliger Betrag!) */
interface CrossTemplate {
  a: [number, number, number];
  b: [number, number, number];
}

const NICE_CROSS_TEMPLATES: readonly CrossTemplate[] = [
  { a: [2, 0, 0], b: [1, 3, 0] }, // cross = (0, 0, 6), |c| = 6
  { a: [1, 0, 0], b: [2, 3, 4] }, // cross = (0, -4, 3), |c| = 5
  { a: [0, 2, 0], b: [3, 1, 4] }, // cross = (8, 0, -6), |c| = 10
  { a: [1, 2, 0], b: [1, 0, 2] }, // cross = (4, -2, -2) -> wait norm sqrt(24), skip!
  { a: [1, 0, 1], b: [0, 2, 2] }, // cross = (-2, -2, 2) -> sqrt(12), skip!
];

// Only verified integer-norm cross-product pairs!
const VERIFIED_CROSS_TEMPLATES: readonly CrossTemplate[] = [
  { a: [2, 0, 0], b: [1, 3, 0] }, // (0, 0, 6) -> norm 6
  { a: [1, 0, 0], b: [2, 3, 4] }, // (0, -4, 3) -> norm 5
  { a: [0, 2, 0], b: [3, 1, 4] }, // (8, 0, -6) -> norm 10
  { a: [0, 0, 3], b: [4, 0, 2] }, // (0, 12, 0) -> norm 12
  { a: [2, 1, 0], b: [0, 2, 0] }, // (0, 0, 4) -> norm 4
  { a: [1, -1, 0], b: [0, 2, 2] }, // (-2, -2, 2)? No: (-2, -2, 2) norm sqrt(12). Let's replace!
  { a: [1, 2, 2], b: [2, 1, 0] }, // (-2, 4, -3)? norm sqrt(29). Let's keep only exact integer norms!
];
void NICE_CROSS_TEMPLATES;
void VERIFIED_CROSS_TEMPLATES;

const EXACT_CROSS_TEMPLATES: readonly CrossTemplate[] = [
  { a: [2, 0, 0], b: [1, 3, 0] }, // cross = (0, 0, 6), norm = 6
  { a: [1, 0, 0], b: [2, 3, 4] }, // cross = (0, -4, 3), norm = 5
  { a: [0, 2, 0], b: [3, 1, 4] }, // cross = (8, 0, -6), norm = 10
  { a: [0, 0, 3], b: [4, 0, 2] }, // cross = (0, 12, 0), norm = 12
  { a: [2, 1, 0], b: [0, 2, 0] }, // cross = (0, 0, 4), norm = 4
  { a: [1, 1, 0], b: [2, 0, 1] }, // wait: (1, -1, -2) sqrt(6) -> no! Let's use (2,-1,0) x (0,0,3) = (-3,-6,0)? no.
  // Exact integer-norm non-axis pairs:
  // a=(1, 2, -2), b=(2, 1, 2) -> cross: (2*2 - (-2)*1, (-2)*2 - 1*2, 1*1 - 2*2) = (6, -6, -3) -> 36+36+9=81 -> norm = 9!!
  { a: [1, 2, -2], b: [2, 1, 2] },
  // a=(2, -1, 0), b=(2, 1, 0) -> cross: (0, 0, 4) -> norm = 4
  { a: [2, -1, 0], b: [2, 1, 0] },
  // a=(0, 3, 4), b=(1, 0, 0) -> cross: (0, 4, -3) -> norm = 5
  { a: [0, 3, 4], b: [1, 0, 0] },
];

export function genM1CrossAndArea(rng: Rng = createRng()): GeneratedTask {
  // Filter defensively just in case, pick from clean templates
  const cleanList = [
    EXACT_CROSS_TEMPLATES[0],
    EXACT_CROSS_TEMPLATES[1],
    EXACT_CROSS_TEMPLATES[2],
    EXACT_CROSS_TEMPLATES[3],
    EXACT_CROSS_TEMPLATES[4],
    EXACT_CROSS_TEMPLATES[6],
    EXACT_CROSS_TEMPLATES[7],
    EXACT_CROSS_TEMPLATES[8],
  ];
  const tpl = rng.pick(cleanList);
  // Apply cyclic permutation (preserves orientation / integer norm!) and optional overall sign
  const shift = rng.int(0, 2);
  const rot = (v: [number, number, number]): [number, number, number] => [
    v[shift % 3],
    v[(shift + 1) % 3],
    v[(shift + 2) % 3],
  ];
  const sA = rng.sign();
  const sB = rng.sign();
  const aArr = rot(tpl.a).map((n) => n * sA) as [number, number, number];
  const bArr = rot(tpl.b).map((n) => n * sB) as [number, number, number];

  const a = new Vec3(aArr[0], aArr[1], aArr[2]);
  const b = new Vec3(bArr[0], bArr[1], bArr[2]);
  const cross = a.cross(b);
  const flippedCross = b.cross(a);
  const normSq = cross.normSquared().toNumber();
  const area = Math.round(Math.sqrt(normSq));

  return {
    id: nextTaskId('m1-cross'),
    generatorId: 'm1-cross-area',
    moduleId: 'm1',
    topicLabel: 'Kreuzprodukt & Parallelogrammfläche',
    paperRecommended: true,
    prompt: `Berechne das Kreuzprodukt $\\vec{c} = \\vec{a} \\times \\vec{b}$ sowie den Flächeninhalt $A$ des von $\\vec{a}$ und $\\vec{b}$ aufgespannten Parallelogramms für: $$\\vec{a} = ${a.toLatex()}, \\quad \\vec{b} = ${b.toLatex()}$$`,
    checkpoints: [
      {
        id: 'cross',
        label: '1. Kreuzprodukt $\\vec{c} = \\vec{a} \\times \\vec{b}$',
        kind: 'vector3',
        expected: cross.toStringArray(),
        solutionLatex: cross.toLatex(),
        points: 2,
        bugDiagnostics: [
          {
            matchVector: flippedCross.toStringArray(),
            errorType: 'anticommutative-flip',
            message:
              'Genau das umgekehrte Vorzeichen! Du hast $\\vec{b}\\times\\vec{a}$ statt $\\vec{a}\\times\\vec{b}$ berechnet (Anti-Kommutativgesetz: $\\vec{a}\\times\\vec{b} = -(\\vec{b}\\times\\vec{a})$).',
          },
        ],
      },
      {
        id: 'area',
        label: '2. Flächeninhalt $A = |\\vec{c}|$',
        kind: 'scalar',
        expected: `${area}`,
        solutionLatex: `${area}`,
        points: 1,
        bugDiagnostics: [
          {
            matchScalar: `${normSq}`,
            errorType: 'forgot-sqrt',
            message: `Das ist $|\\vec{c}|^2 = ${normSq}$ – ziehe noch die Wurzel für den Flächeninhalt!`,
          },
        ],
      },
    ],
    hints: [
      'Formel: $\\vec{a}\\times\\vec{b} = \\begin{pmatrix} a_y b_z - a_z b_y \\\\ a_z b_x - a_x b_z \\\\ a_x b_y - a_y b_x \\end{pmatrix}$. Tipp: Mache danach kurz die Probe $\\vec{c}\\cdot\\vec{a}=0$.',
      `Das Kreuzprodukt lautet $\\vec{c} = ${cross.toLatex()}$. Der Flächeninhalt ist sein Betrag $|\\vec{c}|$.`,
      `$A = |\\vec{c}| = \\sqrt{${normSq}} = ${area}$.`,
    ],
    fullSolutionSteps: [
      `1. Kreuzprodukt: $\\vec{c} = \\begin{pmatrix} (${aArr[1]})(${bArr[2]})-(${aArr[2]})(${bArr[1]}) \\\\ (${aArr[2]})(${bArr[0]})-(${aArr[0]})(${bArr[2]}) \\\\ (${aArr[0]})(${bArr[1]})-(${aArr[1]})(${bArr[0]}) \\end{pmatrix} = ${cross.toLatex()}$`,
      `2. Orthogonalitäts-Check: $\\vec{c}\\cdot\\vec{a} = 0$ und $\\vec{c}\\cdot\\vec{b} = 0$ ✓`,
      `3. Parallelogrammfläche: $A = |\\vec{c}| = \\sqrt{${normSq}} = ${area}$`,
    ],
  };
}

/** 5. Orthogonale Projektion eines Vektors b auf a */
export function genM1Projection(rng: Rng = createRng()): GeneratedTask {
  // Construct a with small clean norm^2 (e.g. 2, 4, 5, 9) and choose b so factor = (a·b)/|a|^2 is clean (integer or half)
  const baseChoices: { a: [number, number, number]; b: [number, number, number] }[] = [
    { a: [1, 1, 0], b: [3, 1, 2] }, // |a|^2 = 2, a·b = 4 -> factor = 2
    { a: [1, 1, 0], b: [2, -1, 4] }, // |a|^2 = 2, a·b = 1 -> factor = 1/2
    { a: [2, 0, 0], b: [3, 4, -2] }, // |a|^2 = 4, a·b = 6 -> factor = 3/2
    { a: [1, 2, 2], b: [3, 3, 0] }, // |a|^2 = 9, a·b = 9 -> factor = 1
    { a: [1, 2, 2], b: [4, 2, 5] }, // |a|^2 = 9, a·b = 18 -> factor = 2
    { a: [0, 3, 4], b: [5, 3, 4] }, // |a|^2 = 25, a·b = 25 -> factor = 1
    { a: [1, -1, 0], b: [4, -2, 3] }, // |a|^2 = 2, a·b = 6 -> factor = 3
  ];
  const tpl = rng.pick(baseChoices);
  const perm = rng.shuffle([0, 1, 2]);
  const signs: [number, number, number] = [rng.sign(), rng.sign(), rng.sign()];
  const aArr: [number, number, number] = [
    tpl.a[perm[0]] * signs[0],
    tpl.a[perm[1]] * signs[1],
    tpl.a[perm[2]] * signs[2],
  ];
  const bArr: [number, number, number] = [
    tpl.b[perm[0]] * signs[0],
    tpl.b[perm[1]] * signs[1],
    tpl.b[perm[2]] * signs[2],
  ];

  const a = new Vec3(aArr[0], aArr[1], aArr[2]);
  const b = new Vec3(bArr[0], bArr[1], bArr[2]);
  const dot = a.dot(b);
  const normASq = a.normSquared();
  const factor = dot.div(normASq);
  const proj = a.scale(factor);

  // Classic mistake: projecting a onto b instead of b onto a!
  const wrongTarget = a.projectOnto(b);

  return {
    id: nextTaskId('m1-proj'),
    generatorId: 'm1-projection',
    moduleId: 'm1',
    topicLabel: 'Vektorprojektion',
    paperRecommended: true,
    prompt: `Projiziere den Vektor $\\vec{b}$ orthogonal auf den Vektor $\\vec{a}$ (gesucht: Komponente $\\vec{b}_a$ in Richtung $\\vec{a}$): $$\\vec{a} = ${a.toLatex()}, \\quad \\vec{b} = ${b.toLatex()}$$`,
    checkpoints: [
      {
        id: 'factor',
        label: '1. Skalierungsfaktor $\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|^2}$',
        kind: 'scalar',
        expected: factor.toString(),
        solutionLatex: factor.toLatex(),
        points: 1,
      },
      {
        id: 'proj',
        label: '2. Projektionsvektor $\\vec{b}_a$',
        kind: 'vector3',
        expected: proj.toStringArray(),
        solutionLatex: proj.toLatex(),
        points: 2,
        bugDiagnostics: [
          {
            matchVector: wrongTarget.toStringArray(),
            errorType: 'swapped-projection-target',
            message:
              'Du hast $\\vec{a}$ auf $\\vec{b}$ projiziert statt umgekehrt! Der Zielvektor $\\vec{a}$ steht im Nenner ($|\\vec{a}|^2$) und außen als Richtungsvektor.',
          },
        ],
      },
    ],
    hints: [
      'Formel (Folie Vektoralgebra S. 37): $\\vec{b}_a = \\left(\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|^2}\\right) \\cdot \\vec{a}$.',
      `$\\vec{a}\\cdot\\vec{b} = ${dot.toLatex()}$ und $|\\vec{a}|^2 = ${normASq.toLatex()}$, also Faktor $= ${factor.toLatex()}$.`,
      `Multipliziere $\\vec{a}$ mit $${factor.toLatex()}$: $\\vec{b}_a = ${proj.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Skalarprodukt: $\\vec{a}\\cdot\\vec{b} = ${dot.toLatex()}$`,
      `2. Betragsquadrat von $\\vec{a}$: $|\\vec{a}|^2 = ${normASq.toLatex()}$`,
      `3. Faktor: $\\frac{${dot.toLatex()}}{${normASq.toLatex()}} = ${factor.toLatex()}$`,
      `4. Projektion: $\\vec{b}_a = ${factor.toLatex()} \\cdot ${a.toLatex()} = ${proj.toLatex()}$`,
    ],
  };
}

/** 6. Fehler-finden-Aufgabe für M1 */
export function genM1FindMistake(rng: Rng = createRng()): GeneratedTask {
  const variant = rng.pick(['cross-sign', 'proj-no-square', 'connect-order'] as const);

  if (variant === 'cross-sign') {
    return {
      id: nextTaskId('m1-mistake'),
      generatorId: 'm1-find-mistake',
      moduleId: 'm1',
      topicLabel: 'Fehler finden (Kreuzprodukt)',
      prompt: `Ein Kommilitone berechnet das Kreuzprodukt $\\vec{c} = \\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix} \\times \\begin{pmatrix}2\\\\0\\\\1\\end{pmatrix}$. In welcher Zeile steckt der Rechenfehler?`,
      mistakeLines: [
        { id: 'L1', text: 'Zeile 1 ($c_x$): $2 \\cdot 1 - 3 \\cdot 0 = 2$' },
        { id: 'L2', text: 'Zeile 2 ($c_y$): $1 \\cdot 1 - 3 \\cdot 2 = -5$' },
        { id: 'L3', text: 'Zeile 3 ($c_z$): $1 \\cdot 0 - 2 \\cdot 2 = -4$' },
      ],
      checkpoints: [
        {
          id: 'line',
          label: 'Welche Zeile ist fehlerhaft?',
          kind: 'mistake-line',
          expected: 'L2',
          options: [
            { id: 'L1', label: 'Zeile 1 ($c_x$)' },
            { id: 'L2', label: 'Zeile 2 ($c_y$)' },
            { id: 'L3', label: 'Zeile 3 ($c_z$)' },
          ],
          solutionLatex: '\\text{Zeile 2: } a_z b_x - a_x b_z = 3\\cdot 2 - 1\\cdot 1 = +5',
          points: 1,
        },
        {
          id: 'fix',
          label: 'Wie lautet der korrekte Wert dieser Komponente?',
          kind: 'scalar',
          expected: '5',
          solutionLatex: '5',
          points: 1,
        },
      ],
      hints: [
        'Prüfe die Reihenfolge der Indizes in der Kreuzprodukt-Formel – besonders bei der mittleren Zeile $c_y$!',
        'In Zeile 2 gilt $c_y = a_z b_x - a_x b_z$ (nicht $a_x b_z - a_z b_x$).',
        'Korrekt ist $c_y = 3\\cdot 2 - 1\\cdot 1 = 6 - 1 = 5$.',
      ],
      fullSolutionSteps: [
        'Der Fehler liegt in Zeile 2: Für die $y$-Komponente gilt $a_z b_x - a_x b_z$.',
        'Eingesetzt: $3\\cdot 2 - 1\\cdot 1 = 5$ (Vorzeichen war vertauscht).',
      ],
    };
  }

  if (variant === 'proj-no-square') {
    return {
      id: nextTaskId('m1-mistake'),
      generatorId: 'm1-find-mistake',
      moduleId: 'm1',
      topicLabel: 'Fehler finden (Projektion)',
      prompt: `Ein Student projiziert $\\vec{b} = \\begin{pmatrix}4\\\\2\\\\0\\end{pmatrix}$ auf $\\vec{a} = \\begin{pmatrix}3\\\\4\\\\0\\end{pmatrix}$. Wo liegt der Fehler?`,
      mistakeLines: [
        { id: 'L1', text: 'Zeile 1: Skalarprodukt $\\vec{a}\\cdot\\vec{b} = 3\\cdot 4 + 4\\cdot 2 + 0 = 20$' },
        { id: 'L2', text: 'Zeile 2: Betrag $|\\vec{a}| = \\sqrt{3^2 + 4^2} = 5$' },
        { id: 'L3', text: 'Zeile 3: Projektion $\\vec{b}_a = \\frac{20}{5} \\cdot \\vec{a} = 4\\vec{a}$' },
      ],
      checkpoints: [
        {
          id: 'line',
          label: 'Welche Zeile ist fehlerhaft?',
          kind: 'mistake-line',
          expected: 'L3',
          options: [
            { id: 'L1', label: 'Zeile 1 (Skalarprodukt)' },
            { id: 'L2', label: 'Zeile 2 (Betrag)' },
            { id: 'L3', label: 'Zeile 3 (Projektionsformel)' },
          ],
          solutionLatex: '\\text{Zeile 3: Im Nenner steht } |\\vec{a}|^2 = 25',
          points: 1,
        },
        {
          id: 'fix',
          label: 'Wie lautet der korrekte Vorfaktor vor $\\vec{a}$?',
          kind: 'scalar',
          expected: '4/5',
          solutionLatex: '\\frac{4}{5}',
          points: 1,
        },
      ],
      hints: [
        'Vergleiche Zeile 3 genau mit der Projektionsformel $\\vec{b}_a = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|^2}\\vec{a}$.',
        'Im Nenner wurde durch $|\\vec{a}| = 5$ geteilt statt durch $|\\vec{a}|^2 = 25$!',
        'Korrekter Faktor: $\\frac{20}{25} = \\frac{4}{5} = 0{,}8$.',
      ],
      fullSolutionSteps: [
        'In Zeile 3 fehlt das Quadrat am Betrag im Nenner ($|\\vec{a}|^2 = 5^2 = 25$).',
        'Korrekter Vorfaktor: $\\frac{20}{25} = \\frac{4}{5}$.',
      ],
    };
  }

  return {
    id: nextTaskId('m1-mistake'),
    generatorId: 'm1-find-mistake',
    moduleId: 'm1',
    topicLabel: 'Fehler finden (Verbindungsvektor)',
    prompt: `Gesucht ist der Verbindungsvektor $\\overrightarrow{AB}$ von $A(2, -1, 3)$ nach $B(5, 3, 1)$ und sein Betrag. Wo steckt der Fehler?`,
    mistakeLines: [
      { id: 'L1', text: 'Zeile 1: $\\overrightarrow{AB} = A - B = \\begin{pmatrix}2-5\\\\-1-3\\\\3-1\\end{pmatrix} = \\begin{pmatrix}-3\\\\-4\\\\2\\end{pmatrix}$' },
      { id: 'L2', text: 'Zeile 2: Quadrate: $(-3)^2 = 9,\\; (-4)^2 = 16,\\; 2^2 = 4$' },
      { id: 'L3', text: 'Zeile 3: Betrag: $\\sqrt{9 + 16 + 4} = \\sqrt{29}$' },
    ],
    checkpoints: [
      {
        id: 'line',
        label: 'Welche Zeile enthält den Konzeptfehler?',
        kind: 'mistake-line',
        expected: 'L1',
        options: [
          { id: 'L1', label: 'Zeile 1 (Verbindungsvektor)' },
          { id: 'L2', label: 'Zeile 2 (Quadrate)' },
          { id: 'L3', label: 'Zeile 3 (Betrag)' },
        ],
        solutionLatex: '\\text{Zeile 1: Spitze minus Fuß ist } B - A',
        points: 1,
      },
      {
        id: 'fix',
        label: 'Wie lautet der korrekte Verbindungsvektor $\\overrightarrow{AB}$?',
        kind: 'vector3',
        expected: ['3', '4', '-2'],
        solutionLatex: '\\begin{pmatrix}3\\\\4\\\\-2\\end{pmatrix}',
        points: 1,
      },
    ],
    hints: [
      'Achte auf die Richtung des Pfeils: Der Vektor startet bei $A$ und endet bei $B$.',
      '„Spitze minus Fuß“ bedeutet $B - A$, nicht $A - B$!',
      '$B - A = (5-2,\\; 3-(-1),\\; 1-3)^T = (3, 4, -2)^T$.',
    ],
    fullSolutionSteps: [
      'In Zeile 1 wurde $A - B$ statt $B - A$ gerechnet (zeigt in die entgegengesetzte Richtung!).',
      'Korrekt: $\\overrightarrow{AB} = B - A = \\begin{pmatrix}3\\\\4\\\\-2\\end{pmatrix}$.',
    ],
  };
}

export const M1_GENERATOR_MAP: Record<string, (rng?: Rng) => GeneratedTask> = {
  'm1-vec-ops': genM1VecOps,
  'm1-connect-norm': genM1ConnectAndNorm,
  'm1-dot-angle': genM1DotAndAngle,
  'm1-cross-area': genM1CrossAndArea,
  'm1-projection': genM1Projection,
  'm1-find-mistake': genM1FindMistake,
};
