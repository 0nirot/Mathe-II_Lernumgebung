import type { GeneratedTask } from '../../types/learning';
import { Matrix, Vec3 } from '../exactMath';
import { createRng, nextTaskId, type Rng } from './random';

/** Helper: construct an integer unimodular 3x3 matrix (det = ±1) by applying elementary ops to I */
function makeUnimodular3x3(rng: Rng): Matrix {
  // Start with upper triangular U with diag ±1, multiply by lower triangular L with diag 1
  const l21 = rng.pick([-2, -1, 1, 2]);
  const l31 = rng.pick([-1, 0, 1]);
  const l32 = rng.pick([-2, -1, 1, 2]);
  const u12 = rng.pick([-2, -1, 1, 2]);
  const u13 = rng.pick([-1, 0, 1]);
  const u23 = rng.pick([-2, -1, 1, 2]);
  const d1 = rng.sign();
  const d2 = rng.sign();
  const d3 = rng.sign();
  const L = new Matrix([
    [1, 0, 0],
    [l21, 1, 0],
    [l31, l32, 1],
  ]);
  const U = new Matrix([
    [d1, u12, u13],
    [0, d2, u23],
    [0, 0, d3],
  ]);
  return L.mul(U);
}

function formatLinEq(coeffs: number[], rhs: number, label: string): string {
  const vars = ['x', 'y', 'z'];
  const parts: string[] = [];
  coeffs.forEach((c, idx) => {
    if (c === 0) return;
    const absC = Math.abs(c);
    const term = absC === 1 ? vars[idx] : `${absC}${vars[idx]}`;
    if (parts.length === 0) {
      parts.push(c < 0 ? `-${term}` : term);
    } else {
      parts.push(c < 0 ? `- ${term}` : `+ ${term}`);
    }
  });
  return `(${label})\\quad ${parts.join(' ')} = ${rhs}`;
}

/** 1. 3x3 LGS mit Gauß-Algorithmus (garantiert ganzzahlige Lösung!) */
export function genM2GaussLgs(rng: Rng = createRng()): GeneratedTask {
  const xSol = rng.int(-3, 4);
  const ySol = rng.int(-3, 4);
  const zSol = rng.int(-3, 4);
  const A = makeUnimodular3x3(rng);
  const rhs = A.mulVec([xSol, ySol, zSol]).map((f) => f.toNumber());
  const rows = A.data.map((r) => r.map((f) => f.toNumber()));

  const eqLatex = `\\begin{aligned} ${formatLinEq(rows[0], rhs[0], 'I')} \\\\ ${formatLinEq(rows[1], rhs[1], 'II')} \\\\ ${formatLinEq(rows[2], rhs[2], 'III')} \\end{aligned}`;
  const solVec = new Vec3(xSol, ySol, zSol);

  return {
    id: nextTaskId('m2-gauss'),
    generatorId: 'm2-gauss-lgs',
    moduleId: 'm2',
    topicLabel: '3×3-LGS (Gauß-Verfahren)',
    paperRecommended: true,
    prompt: `Löse das folgende lineare Gleichungssystem mit dem **Gaußschen Eliminationsverfahren** auf Papier und gib den Lösungsvektor $\\vec{x} = (x, y, z)^T$ an: $$${eqLatex}$$`,
    checkpoints: [
      {
        id: 'sol',
        label: 'Lösungsvektor $\\vec{x} = (x, y, z)^T$',
        kind: 'vector3',
        expected: solVec.toStringArray(),
        solutionLatex: solVec.toLatex(),
        points: 3,
      },
    ],
    hints: [
      'Eliminiere zuerst $x$ aus Gleichung $(II)$ und $(III)$, indem du geeignete Vielfache von $(I)$ addierst/subtrahierst.',
      'Danach eliminierst du $y$ aus der neuen $(III^*)$, erhältst $z$, und setzt rückwärts nach oben ein.',
      `Kontrollwert: $z = ${zSol}$, daraus $y = ${ySol}$ und schließlich $x = ${xSol}$.`,
    ],
    fullSolutionSteps: [
      `1. Koeffizientenmatrix $A = ${A.toLatex()}$ mit $\\det(A) = ${A.det().toLatex()} \\neq 0$ (eindeutige Lösung).`,
      `2. Nach schrittweiser Elimination auf Stufenform und Rückwärtseinsetzen folgt: $z = ${zSol}$, $y = ${ySol}$, $x = ${xSol}$.`,
      `3. Probe in allen 3 Gleichungen mit $\\vec{x} = ${solVec.toLatex()}$ ergibt exakt $(${rhs.join(', ')})^T$ ✓.`,
    ],
  };
}

/** 2. Lösungsverhalten (Homogen / Inhomogen / Determinante) */
export function genM2LgsBehavior(rng: Rng = createRng()): GeneratedTask {
  const variant = rng.pick(['homog', 'inhomog-det0', 'inhomog-det-nonzero'] as const);

  if (variant === 'homog') {
    return {
      id: nextTaskId('m2-behav'),
      generatorId: 'm2-lgs-behavior',
      moduleId: 'm2',
      topicLabel: 'Homogenes LGS & Lösungsverhalten',
      prompt: `Gegeben ist ein **homogenes** lineares Gleichungssystem $A\\cdot\\vec{x} = \\vec{0}$ (Folie LGS S. 16). Welche Aussage über die Lösungsmenge ist **immer** korrekt?`,
      checkpoints: [
        {
          id: 'mc',
          label: 'Wähle die richtige Aussage',
          kind: 'choice',
          expected: 'B',
          options: [
            { id: 'A', label: 'Es kann auch unlösbar sein (0 Lösungen).' },
            { id: 'B', label: 'Es hat immer mind. die triviale Lösung $\\vec{x}=\\vec{0}$ (also 1 oder $\\infty$ viele Lösungen).' },
            { id: 'C', label: 'Es hat immer unendlich viele Lösungen.' },
          ],
          solutionLatex: '\\text{B: } \\vec{x}=\\vec{0} \\text{ löst } A\\vec{x}=\\vec{0} \\text{ immer!}',
          points: 1,
          bugDiagnostics: [
            {
              matchScalar: 'A',
              errorType: 'homog-unsolvable',
              message: 'Ein homogenes LGS $A\\vec{x}=\\vec{0}$ ist **niemals** unlösbar, weil $\\vec{x}=\\vec{0}$ immer funktioniert!',
            },
          ],
        },
      ],
      hints: [
        'Setze einfach einmal den Nullvektor $\\vec{x} = \\vec{0}$ in $A\\cdot\\vec{x} = \\vec{0}$ ein!',
        '$A\\cdot\\vec{0} = \\vec{0}$ ist immer erfüllt – es gibt also mindestens diese sogenannte triviale Lösung.',
        'Daher hat ein homogenes LGS entweder genau 1 Lösung (die triviale) oder unendlich viele Lösungen (Antwort B).',
      ],
      fullSolutionSteps: [
        'Folie LGS S. 16: Ein homogenes LGS $A\\vec{x}=\\vec{0}$ besitzt entweder genau eine (triviale Lösung $\\vec{x}=\\vec{0}$) oder unendlich viele Lösungen.',
      ],
    };
  }

  const isZero = variant === 'inhomog-det0';
  const a = rng.pick([2, 3, 4]);
  const b = rng.pick([-3, -2, 1, 2, 3]);
  const k = rng.pick([-2, 2, 3]);
  const mat = isZero
    ? new Matrix([
        [a, b],
        [a * k, b * k],
      ])
    : new Matrix([
        [a, b],
        [a, b + rng.pick([-2, -1, 1, 2])],
      ]);
  const det = mat.det();

  return {
    id: nextTaskId('m2-behav'),
    generatorId: 'm2-lgs-behavior',
    moduleId: 'm2',
    topicLabel: 'LGS-Lösbarkeit über Determinante',
    prompt: `Ein quadratisches $2\\times 2$-LGS hat die Koeffizientenmatrix $$A = ${mat.toLatex()}.$$ Berechne $\\det(A)$ und beurteile, ob das LGS **eindeutig lösbar** ist.`,
    checkpoints: [
      {
        id: 'det',
        label: '1. Determinante $\\det(A)$',
        kind: 'scalar',
        expected: det.toString(),
        solutionLatex: det.toLatex(),
        points: 1,
      },
      {
        id: 'unique',
        label: '2. Ist das LGS eindeutig lösbar?',
        kind: 'choice',
        expected: isZero ? 'no' : 'yes',
        options: [
          { id: 'yes', label: 'Ja, genau eine eindeutige Lösung ($\\det A \\neq 0$)' },
          { id: 'no', label: 'Nein, nicht eindeutig (unlösbar oder $\\infty$ viele Lösungen, $\\det A = 0$)' },
        ],
        solutionLatex: isZero ? '\\det A = 0 \\Rightarrow \\text{nicht eindeutig}' : '\\det A \\neq 0 \\Rightarrow \\text{eindeutig}',
        points: 1,
      },
    ],
    hints: [
      'Für $2\\times 2$ gilt $\\det A = a_{11}a_{22} - a_{12}a_{21}$.',
      `Hier ist $\\det A = ${det.toLatex()}$.`,
      'Merke (Matrizen S. 37): $\\det A \\neq 0 \\Rightarrow$ eindeutige Lösung; $\\det A = 0 \\Rightarrow$ keine eindeutige Lösung.',
    ],
    fullSolutionSteps: [
      `1. $\\det(A) = (${mat.get(0, 0).toLatex()})(${mat.get(1, 1).toLatex()}) - (${mat.get(0, 1).toLatex()})(${mat.get(1, 0).toLatex()}) = ${det.toLatex()}$`,
      `2. Da $\\det(A) ${isZero ? '= 0' : '\\neq 0'}$, ist das LGS ${isZero ? 'nicht eindeutig lösbar (unlösbar oder unendlich viele Lösungen)' : 'eindeutig lösbar'}.`,
    ],
  };
}

/** 3. Matrix-Addition, Skalarmultiplikation & Transponieren */
export function genM2MatrixOps(rng: Rng = createRng()): GeneratedTask {
  const A = new Matrix([
    [rng.int(-4, 5), rng.int(-4, 5)],
    [rng.int(-4, 5), rng.int(-4, 5)],
  ]);
  const B = new Matrix([
    [rng.int(-4, 5), rng.int(-4, 5)],
    [rng.int(-4, 5), rng.int(-4, 5)],
  ]);
  const k = rng.pick([-2, 2, 3]);
  const res = A.add(B.scale(k));
  const trans = A.transpose();

  return {
    id: nextTaskId('m2-ops'),
    generatorId: 'm2-matrix-ops',
    moduleId: 'm2',
    topicLabel: 'Matrizen: Rechnen & Transponieren',
    prompt: `Gegeben sind $$A = ${A.toLatex()} \\quad \\text{und} \\quad B = ${B.toLatex()}.$$ Berechne $C = A + ${k}\\cdot B$ sowie die transponierte Matrix $A^T$.`,
    checkpoints: [
      {
        id: 'sum',
        label: `1. Matrix $C = A + ${k}\\cdot B$`,
        kind: 'matrix',
        matrixShape: { rows: 2, cols: 2 },
        expected: res.toFlatStrings(),
        solutionLatex: res.toLatex(),
        points: 1,
      },
      {
        id: 'trans',
        label: '2. Transponierte Matrix $A^T$',
        kind: 'matrix',
        matrixShape: { rows: 2, cols: 2 },
        expected: trans.toFlatStrings(),
        solutionLatex: trans.toLatex(),
        points: 1,
      },
    ],
    hints: [
      'Addition und Skalarmultiplikation laufen einfach eintragweise an derselben Position. Beim Transponieren werden Zeilen zu Spalten.',
      `$${k}\\cdot B = ${B.scale(k).toLatex()}$. Addiere das eintragweise zu $A$.`,
      `$C = ${res.toLatex()}$ und $A^T = ${trans.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. $${k}\\cdot B = ${B.scale(k).toLatex()}$, also $C = ${res.toLatex()}$.`,
      `2. Zeilen und Spalten von $A$ vertauschen: $A^T = ${trans.toLatex()}$.`,
    ],
  };
}

/** 4. Matrizenmultiplikation mit Falk-Schema */
export function genM2MatrixMul(rng: Rng = createRng()): GeneratedTask {
  const is2x3 = rng.next() < 0.45;
  const A = new Matrix([
    [rng.int(-3, 4), rng.int(-3, 4)],
    [rng.int(-3, 4), rng.int(-3, 4)],
  ]);
  const B = is2x3
    ? new Matrix([
        [rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4)],
        [rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4)],
      ])
    : new Matrix([
        [rng.int(-3, 4), rng.int(-3, 4)],
        [rng.int(-3, 4), rng.int(-3, 4)],
      ]);

  const C = A.mul(B);
  const bugs = [];
  if (!is2x3) {
    const BA = B.mul(A);
    if (!BA.equals(C)) {
      bugs.push({
        matchMatrix: BA.toFlatStrings(),
        errorType: 'matrix-mul-order',
        message:
          'Du hast $B\\cdot A$ statt $A\\cdot B$ berechnet! Bei Matrizen ist die Reihenfolge nicht vertauschbar ($A$ steht im Falk-Schema links, $B$ oben).',
      });
    }
    const elementwise = new Matrix([
      [A.get(0, 0).mul(B.get(0, 0)), A.get(0, 1).mul(B.get(0, 1))],
      [A.get(1, 0).mul(B.get(1, 0)), A.get(1, 1).mul(B.get(1, 1))],
    ]);
    if (!elementwise.equals(C)) {
      bugs.push({
        matchMatrix: elementwise.toFlatStrings(),
        errorType: 'elementwise-mul',
        message:
          'Achtung: Matrizen werden NICHT eintragweise multipliziert, sondern Zeile mal Spalte (Skalarprodukt nach dem Falk-Schema)!',
      });
    }
  }

  return {
    id: nextTaskId('m2-mul'),
    generatorId: 'm2-matrix-mul',
    moduleId: 'm2',
    topicLabel: 'Matrizenmultiplikation (Falk-Schema)',
    paperRecommended: true,
    prompt: `Berechne das Matrixprodukt $C = A \\cdot B$ mithilfe des **Falk-Schemas**: $$A = ${A.toLatex()}, \\qquad B = ${B.toLatex()}$$`,
    checkpoints: [
      {
        id: 'prod',
        label: `Ergebnismatrix $C$ (Typ ${C.rows}×${C.cols})`,
        kind: 'matrix',
        matrixShape: { rows: C.rows, cols: C.cols },
        expected: C.toFlatStrings(),
        solutionLatex: C.toLatex(),
        points: 2,
        bugDiagnostics: bugs,
      },
    ],
    hints: [
      'Schreibe $A$ links unten und $B$ rechts oben (Falk-Schema). Jeder Eintrag $c_{ik}$ ist das Skalarprodukt aus $i$-ter Zeile von $A$ und $k$-ter Spalte von $B$.',
      `Erster Eintrag oben links: $c_{11} = (${A.get(0, 0).toLatex()})(${B.get(0, 0).toLatex()}) + (${A.get(0, 1).toLatex()})(${B.get(1, 0).toLatex()}) = ${C.get(0, 0).toLatex()}$.`,
      `Komplettes Ergebnis: $C = ${C.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `Dimension: $(2,2) \\cdot (2,${C.cols}) \\to (2,${C.cols})$ ✓`,
      `Zeile mal Spalte nach Falk ergibt $C = ${C.toLatex()}$.`,
    ],
  };
}

/** 5. 2x2-Determinante & Inverse Matrix (det ∈ {±1, ±2}) */
export function genM2Det2x2Inverse(rng: Rng = createRng()): GeneratedTask {
  // Construct 2x2 matrix with det = ±1 or ±2
  const templates: [number, number, number, number][] = [
    [3, 2, 4, 3], // det = 1
    [2, 1, 3, 2], // det = 1
    [4, 3, 3, 2], // det = -1
    [5, 2, 2, 1], // det = 1
    [3, 1, 4, 2], // det = 2
    [4, 2, 3, 1], // det = -2
    [2, -1, 3, -1], // det = 1
    [3, -2, 2, -1], // det = 1
  ];
  const [a, b, c, d] = rng.pick(templates);
  const flip = rng.sign();
  const A = new Matrix([
    [a * flip, b * flip],
    [c, d],
  ]);
  const det = A.det();
  const inv = A.inverse()!;
  const wrongDetPlus = A.get(0, 0).mul(A.get(1, 1)).add(A.get(0, 1).mul(A.get(1, 0)));

  return {
    id: nextTaskId('m2-inv2'),
    generatorId: 'm2-det-2x2-inv',
    moduleId: 'm2',
    topicLabel: '2×2-Determinante & Inverse',
    paperRecommended: true,
    prompt: `Gegeben ist die Matrix $$A = ${A.toLatex()}.$$ Berechne zuerst $\\det(A)$ und bestimme anschließend die inverse Matrix $A^{-1}$.`,
    checkpoints: [
      {
        id: 'det',
        label: '1. Determinante $\\det(A)$',
        kind: 'scalar',
        expected: det.toString(),
        solutionLatex: det.toLatex(),
        points: 1,
        bugDiagnostics: [
          {
            matchScalar: wrongDetPlus.toString(),
            errorType: 'det-plus-instead-minus',
            message:
              'Du hast die Nebendiagonale addiert statt subtrahiert! Merke: Hauptdiagonale MINUS Nebendiagonale ($ad - bc$).',
          },
        ],
      },
      {
        id: 'inv',
        label: '2. Inverse Matrix $A^{-1}$',
        kind: 'matrix',
        matrixShape: { rows: 2, cols: 2 },
        expected: inv.toFlatStrings(),
        solutionLatex: inv.toLatex(),
        points: 2,
      },
    ],
    hints: [
      '2×2-Formel (Matrizen S. 23): $A^{-1} = \\frac{1}{\\det A} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$ (Hauptdiagonale tauschen, Nebendiagonale Vorzeichen umdrehen).',
      `$\\det(A) = ${det.toLatex()}$. Damit $A^{-1} = \\frac{1}{${det.toLatex()}} \\begin{pmatrix} ${A.get(1, 1).toLatex()} & ${A.get(0, 1).neg().toLatex()} \\\\ ${A.get(1, 0).neg().toLatex()} & ${A.get(0, 0).toLatex()} \\end{pmatrix}$.`,
      `$A^{-1} = ${inv.toLatex()}$. Probe: $A \\cdot A^{-1} = E$ ✓.`,
    ],
    fullSolutionSteps: [
      `1. $\\det(A) = (${A.get(0, 0).toLatex()})(${A.get(1, 1).toLatex()}) - (${A.get(0, 1).toLatex()})(${A.get(1, 0).toLatex()}) = ${det.toLatex()} \\neq 0$`,
      `2. $A^{-1} = ${inv.toLatex()}$`,
    ],
  };
}

/** 6. 3x3-Determinante per Regel von Sarrus */
export function genM2Det3x3Sarrus(rng: Rng = createRng()): GeneratedTask {
  const zeroCase = rng.next() < 0.2;
  let A: Matrix;
  if (zeroCase) {
    // Proportional rows -> det = 0 immediately visible!
    const r1 = [rng.int(-3, 3), rng.int(1, 4), rng.int(-3, 3)];
    const mult = rng.pick([-2, 2]);
    A = new Matrix([
      r1,
      [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)],
      [r1[0] * mult, r1[1] * mult, r1[2] * mult],
    ]);
  } else {
    A = new Matrix([
      [rng.int(-2, 4), rng.int(-2, 3), rng.int(0, 3)],
      [rng.int(-2, 3), rng.int(-2, 4), rng.int(-2, 3)],
      [rng.int(0, 3), rng.int(-2, 3), rng.int(-2, 4)],
    ]);
  }
  const det = A.det();
  const a = A.data.map((r) => r.map((f) => f.toNumber()));
  const mainSum =
    a[0][0] * a[1][1] * a[2][2] +
    a[0][1] * a[1][2] * a[2][0] +
    a[0][2] * a[1][0] * a[2][1];
  const antiSum =
    a[0][2] * a[1][1] * a[2][0] +
    a[0][0] * a[1][2] * a[2][1] +
    a[0][1] * a[1][0] * a[2][2];

  return {
    id: nextTaskId('m2-sarrus'),
    generatorId: 'm2-det-3x3-sarrus',
    moduleId: 'm2',
    topicLabel: '3×3-Determinante (Sarrus)',
    paperRecommended: true,
    prompt: `Berechne die $3\\times 3$-Determinante mithilfe der **Regel von Sarrus** (oder erkenne ein Null-Kriterium!): $$D = ${A.toLatex('vmatrix')}$$`,
    checkpoints: [
      {
        id: 'det',
        label: 'Determinantenwert $D$',
        kind: 'scalar',
        expected: det.toString(),
        solutionLatex: det.toLatex(),
        points: 2,
        bugDiagnostics: [
          {
            matchScalar: `${mainSum + antiSum}`,
            errorType: 'sarrus-added-antidiags',
            message:
              'Du hast die drei Nebendiagonalen addiert statt subtrahiert! Merke: Hauptdiagonalen (+) MINUS Nebendiagonalen (−).',
          },
          {
            matchScalar: `${antiSum - mainSum}`,
            errorType: 'sarrus-swapped-sign',
            message: 'Vorzeichen genau umgekehrt – erst die absteigenden Hauptdiagonalen, dann MINUS die aufsteigenden Nebendiagonalen.',
          },
        ],
      },
    ],
    hints: [
      zeroCase
        ? 'Schau dir Zeile 1 und Zeile 3 genau an – bevor du rechnest!'
        : 'Schreibe Spalte 1 und Spalte 2 rechts neben die Determinante und bilde die 3 absteigenden Haupt- und 3 aufsteigenden Nebendiagonalprodukte.',
      `Summe der 3 Hauptdiagonalen = $${mainSum}$, Summe der 3 Nebendiagonalen = $${antiSum}$.`,
      `$D = ${mainSum} - (${antiSum}) = ${det.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      zeroCase
        ? 'Schnellblick (Matrizen S. 65): Zeile 3 ist ein direktes Vielfaches von Zeile 1 (proportional) → Determinante ist sofort $0$!'
        : `1. Hauptdiagonalen (+): $${mainSum}$`,
      `2. Nebendiagonalen (−): $${antiSum}$`,
      `3. Differenz: $D = ${mainSum} - (${antiSum}) = ${det.toLatex()}$`,
    ],
  };
}

/** 7. 4x4-Determinante per Laplaceschem Entwicklungssatz (Zeile/Spalte mit 3 Nullen!) */
export function genM2Det4x4Laplace(rng: Rng = createRng()): GeneratedTask {
  // Put a single non-zero pivot in a random row/col with 3 zeros!
  const pivotRow = rng.int(0, 3);
  const pivotCol = rng.int(0, 3);
  const pivotVal = rng.pick([-3, -2, 2, 3]);
  const useRowZeros = rng.next() < 0.5;

  // Build clean 3x3 minor with small numbers
  const sub3 = new Matrix([
    [rng.int(1, 3), rng.int(-2, 2), rng.int(0, 2)],
    [rng.int(0, 2), rng.int(1, 3), rng.int(-2, 2)],
    [rng.int(-1, 2), rng.int(0, 2), rng.int(1, 3)],
  ]);
  const subDet = sub3.det();

  // Assemble 4x4 matrix
  const raw: number[][] = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  let sr = 0;
  for (let r = 0; r < 4; r++) {
    if (r === pivotRow) continue;
    let sc = 0;
    for (let c = 0; c < 4; c++) {
      if (c === pivotCol) continue;
      raw[r][c] = sub3.get(sr, sc).toNumber();
      sc++;
    }
    sr++;
  }
  // Fill non-zero decoy values in the perpendicular line (not the zero line)
  if (useRowZeros) {
    // Row pivotRow has zeros except pivotCol; col pivotCol can have decoys
    for (let r = 0; r < 4; r++) {
      if (r !== pivotRow) raw[r][pivotCol] = rng.int(-2, 3);
    }
  } else {
    // Col pivotCol has zeros except pivotRow; row pivotRow can have decoys
    for (let c = 0; c < 4; c++) {
      if (c !== pivotCol) raw[pivotRow][c] = rng.int(-2, 3);
    }
  }
  raw[pivotRow][pivotCol] = pivotVal;

  const M = new Matrix(raw);
  const det = M.det();
  const sign = (pivotRow + pivotCol) % 2 === 0 ? 1 : -1;
  const wrongSignDet = det.neg();

  return {
    id: nextTaskId('m2-laplace'),
    generatorId: 'm2-det-4x4-laplace',
    moduleId: 'm2',
    topicLabel: '4×4-Determinante (Laplace + Sarrus)',
    paperRecommended: true,
    prompt: `Berechne die $4\\times 4$-Determinante geschickt über den **Laplaceschen Entwicklungssatz**: $$D = ${M.toLatex('vmatrix')}$$`,
    checkpoints: [
      {
        id: 'minor',
        label: '1. Wert der $3\\times 3$-Unterdeterminante $D_{ik}$',
        kind: 'scalar',
        expected: subDet.toString(),
        solutionLatex: subDet.toLatex(),
        points: 2,
      },
      {
        id: 'det',
        label: '2. Gesamte $4\\times 4$-Determinante $D$',
        kind: 'scalar',
        expected: det.toString(),
        solutionLatex: det.toLatex(),
        points: 2,
        bugDiagnostics:
          !det.isZero()
            ? [
                {
                  matchScalar: wrongSignDet.toString(),
                  errorType: 'laplace-checkerboard-sign',
                  message: `Vorzeichenfehler beim Laplace-Schachbrett! An Position $(${pivotRow + 1},${pivotCol + 1})$ gilt $(-1)^{${pivotRow + 1}+${pivotCol + 1}} = ${sign > 0 ? '+1' : '-1'}$.`,
                },
              ]
            : [],
      },
    ],
    hints: [
      `Suche zuerst die ${useRowZeros ? 'Zeile' : 'Spalte'} mit den meisten Nullen (${useRowZeros ? `Zeile ${pivotRow + 1}` : `Spalte ${pivotCol + 1}`})!`,
      `Streiche Zeile ${pivotRow + 1} und Spalte ${pivotCol + 1}. Das Schachbrett-Vorzeichen ist $(-1)^{${pivotRow + 1}+${pivotCol + 1}} = ${sign > 0 ? '+1' : '-1'}$. Berechne die $3\\times 3$-Unterdeterminante per Sarrus.`,
      `Unterdeterminante $D_{${pivotRow + 1},${pivotCol + 1}} = ${subDet.toLatex()}$. Gesamt: $(${sign > 0 ? '+' : '-'}${pivotVal}) \\cdot (${subDet.toLatex()}) = ${det.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Entwicklung nach ${useRowZeros ? `Zeile ${pivotRow + 1}` : `Spalte ${pivotCol + 1}`} (3 Nullen!). Einziger Beitrag: Element $a_{${pivotRow + 1},${pivotCol + 1}} = ${pivotVal}$.`,
      `2. Schachbrett-Vorzeichen: $(-1)^{${pivotRow + 1}+${pivotCol + 1}} = ${sign > 0 ? '+1' : '-1'}$.`,
      `3. $3\\times 3$-Unterdeterminante $D_{${pivotRow + 1},${pivotCol + 1}} = ${sub3.toLatex('vmatrix')} = ${subDet.toLatex()}$.`,
      `4. Gesamt: $D = (${sign}) \\cdot (${pivotVal}) \\cdot (${subDet.toLatex()}) = ${det.toLatex()}$.`,
    ],
  };
}

/** 8. 3x3-Inverse mit Gauß-Jordan (garantiert ganzzahlige Inverse!) */
export function genM2GaussJordan3x3(rng: Rng = createRng()): GeneratedTask {
  // Start with identity and apply 3 super clean elementary row ops (det = ±1)
  const k1 = rng.pick([-2, -1, 1, 2]);
  const k2 = rng.pick([-2, -1, 1, 2]);
  const k3 = rng.pick([-1, 1]);
  const E1 = new Matrix([
    [1, k1, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  const E2 = new Matrix([
    [1, 0, 0],
    [0, 1, k2],
    [0, 0, 1],
  ]);
  const E3 = new Matrix([
    [1, 0, 0],
    [0, 1, 0],
    [k3, 0, 1],
  ]);
  const A = E3.mul(E2).mul(E1);
  const inv = A.inverse()!;

  return {
    id: nextTaskId('m2-gj'),
    generatorId: 'm2-gauss-jordan-3x3',
    moduleId: 'm2',
    topicLabel: '3×3-Inverse (Gauß-Jordan)',
    paperRecommended: true,
    prompt: `Bestimme die inverse Matrix $A^{-1}$ mit dem **Gauß-Jordan-Verfahren** $[A \\mid E] \\to [E \\mid A^{-1}]$ auf Papier: $$A = ${A.toLatex()}$$`,
    checkpoints: [
      {
        id: 'inv',
        label: 'Inverse Matrix $A^{-1}$ (3×3)',
        kind: 'matrix',
        matrixShape: { rows: 3, cols: 3 },
        expected: inv.toFlatStrings(),
        solutionLatex: inv.toLatex(),
        points: 3,
      },
    ],
    hints: [
      'Schreibe rechts neben $A$ die $3\\times 3$-Einheitsmatrix $E$ und forme mit elementaren Zeilenoperationen so um, dass links $E$ entsteht.',
      'Räume zuerst Spalte 1 unterhalb der $1$ auf, danach Spalte 2 und Spalte 3 oberhalb der Diagonalen. Die Ergebnisse sind hier alle glatte ganze Zahlen!',
      `Die Inverse lautet $A^{-1} = ${inv.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Starte mit $[A \\mid E]$ und überführe die linke Seite schrittweise in die Einheitsmatrix $E$.`,
      `2. Auf der rechten Seite entsteht $A^{-1} = ${inv.toLatex()}$.`,
      `3. Probe: $A \\cdot A^{-1} = E$ ✓.`,
    ],
  };
}

/** 9. Fehler-finden für Modul 2 */
export function genM2FindMistake(rng: Rng = createRng()): GeneratedTask {
  const variant = rng.pick(['det-swap', 'laplace-sign'] as const);

  if (variant === 'laplace-sign') {
    return {
      id: nextTaskId('m2-mistake'),
      generatorId: 'm2-find-mistake',
      moduleId: 'm2',
      topicLabel: 'Fehler finden (Laplace-Vorzeichen)',
      prompt: `Bei der Laplace-Entwicklung von $D = \\begin{vmatrix} 0 & 2 & 0 \\\\ 1 & 4 & 3 \\\\ 2 & 5 & 1 \\end{vmatrix}$ nach Zeile 1 unterläuft ein Fehler. In welcher Zeile?`,
      mistakeLines: [
        { id: 'L1', text: 'Zeile 1: Einziges Element ungleich 0 in Zeile 1 ist $a_{12} = 2$.' },
        { id: 'L2', text: 'Zeile 2: Unterdeterminante $D_{12} = \\begin{vmatrix} 1 & 3 \\\\ 2 & 1 \\end{vmatrix} = 1\\cdot 1 - 3\\cdot 2 = -5$.' },
        { id: 'L3', text: 'Zeile 3: Gesamt $D = (+1) \\cdot 2 \\cdot (-5) = -10$.' },
      ],
      checkpoints: [
        {
          id: 'line',
          label: 'Welche Zeile ist fehlerhaft?',
          kind: 'mistake-line',
          expected: 'L3',
          options: [
            { id: 'L1', label: 'Zeile 1 (Elementwahl)' },
            { id: 'L2', label: 'Zeile 2 (Unterdeterminante)' },
            { id: 'L3', label: 'Zeile 3 (Vorzeichen / Endergebnis)' },
          ],
          solutionLatex: '\\text{Zeile 3: } (-1)^{1+2} = -1 \\Rightarrow D = +10',
          points: 1,
        },
        {
          id: 'fix',
          label: 'Wie lautet der korrekte Wert von $D$?',
          kind: 'scalar',
          expected: '10',
          solutionLatex: '10',
          points: 1,
        },
      ],
      hints: [
        'Achte auf das Schachbrett-Vorzeichen $(-1)^{i+k}$ für Position $(1, 2)$!',
        'Da $1 + 2 = 3$ ungerade ist, lautet das Vorzeichen $(-1)^3 = -1$, nicht $+1$!',
        '$D = (-1) \\cdot 2 \\cdot (-5) = +10$.',
      ],
      fullSolutionSteps: [
        'In Zeile 3 wurde das Schachbrett-Vorzeichen $(-1)^{1+2} = -1$ vergessen.',
        'Richtig ist $D = (-1) \\cdot 2 \\cdot (-5) = 10$.',
      ],
    };
  }

  return {
    id: nextTaskId('m2-mistake'),
    generatorId: 'm2-find-mistake',
    moduleId: 'm2',
    topicLabel: 'Fehler finden (2×2-Inverse)',
    prompt: `Gesucht ist die Inverse von $A = \\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix}$. Wo liegt der Fehler im Rechenweg?`,
    mistakeLines: [
      { id: 'L1', text: 'Zeile 1: $\\det(A) = 3\\cdot 2 - 1\\cdot 5 = 6 - 5 = 1 \\neq 0$.' },
      { id: 'L2', text: 'Zeile 2: Formel anwenden: $A^{-1} = \\frac{1}{1} \\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}$.' },
      { id: 'L3', text: 'Zeile 3: Ergebnis: $A^{-1} = \\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}$.' },
    ],
    checkpoints: [
      {
        id: 'line',
        label: 'In welcher Zeile passiert der Fehler?',
        kind: 'mistake-line',
        expected: 'L2',
        options: [
          { id: 'L1', label: 'Zeile 1 (Determinante)' },
          { id: 'L2', label: 'Zeile 2 (2×2-Inversenformel)' },
          { id: 'L3', label: 'Zeile 3 (Endergebnis)' },
        ],
        solutionLatex: '\\text{Zeile 2: Nebendiagonale braucht Minuszeichen!}',
        points: 1,
      },
      {
        id: 'fix',
        label: 'Korrekte Inverse $A^{-1}$',
        kind: 'matrix',
        matrixShape: { rows: 2, cols: 2 },
        expected: ['2', '-1', '-5', '3'],
        solutionLatex: '\\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}',
        points: 1,
      },
    ],
    hints: [
      'Vergleiche Zeile 2 mit der 2×2-Inversenformel (Matrizen S. 23).',
      'Auf der Hauptdiagonalen werden $a$ und $d$ getauscht – aber auf der Nebendiagonalen müssen $-b$ und $-c$ stehen!',
      'Korrekt ist $A^{-1} = \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$.',
    ],
    fullSolutionSteps: [
      'In Zeile 2 wurden die Minuszeichen auf der Nebendiagonalen vergessen ($-b = -1, -c = -5$).',
      'Probe: $\\begin{pmatrix}3&1\\\\5&2\\end{pmatrix}\\begin{pmatrix}2&-1\\\\-5&3\\end{pmatrix} = \\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$ ✓.',
    ],
  };
}

export const M2_GENERATOR_MAP: Record<string, (rng?: Rng) => GeneratedTask> = {
  'm2-gauss-lgs': genM2GaussLgs,
  'm2-lgs-behavior': genM2LgsBehavior,
  'm2-matrix-ops': genM2MatrixOps,
  'm2-matrix-mul': genM2MatrixMul,
  'm2-det-2x2-inv': genM2Det2x2Inverse,
  'm2-det-3x3-sarrus': genM2Det3x3Sarrus,
  'm2-det-4x4-laplace': genM2Det4x4Laplace,
  'm2-gauss-jordan-3x3': genM2GaussJordan3x3,
  'm2-find-mistake': genM2FindMistake,
};
