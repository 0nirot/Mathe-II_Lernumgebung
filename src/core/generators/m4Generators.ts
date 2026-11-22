import type { GeneratedTask } from '../../types/learning';
import { Matrix, Vec2, Vec3 } from '../exactMath';
import { createRng, nextTaskId, type Rng } from './random';

/** 1. Linear vs. Affin & Invarianten (Theorie + Kurzcheck) */
export function genM4LinearVsAffine(rng: Rng = createRng()): GeneratedTask {
  const cases = [
    {
      expr: 'f\\begin{pmatrix}x\\\\y\\end{pmatrix} = \\begin{pmatrix}2x - y\\\\3y\\end{pmatrix}',
      expected: 'linear',
      reason: '$f(\\vec{0}) = \\vec{0}$ und darstellbar als $A\\vec{x}$ ohne Verschiebung → **linear** (und damit auch ein Spezialfall einer affinen Abbildung).',
    },
    {
      expr: 'f\\begin{pmatrix}x\\\\y\\end{pmatrix} = \\begin{pmatrix}x + 4\\\\y - 1\\end{pmatrix}',
      expected: 'affine-only',
      reason: '$f(0,0)^T = (4,-1)^T \\neq \\vec{0}$ → Ursprung wird verschoben! Daher **nicht linear**, aber **affin** (Translation).',
    },
    {
      expr: 'f\\begin{pmatrix}x\\\\y\\end{pmatrix} = \\begin{pmatrix}-y\\\\x\\end{pmatrix}',
      expected: 'linear',
      reason: 'Das ist eine $90^\\circ$-Rotation um den Ursprung ($f(\\vec{0})=\\vec{0}$, homogen & additiv) → **linear**.',
    },
    {
      expr: 'f\\begin{pmatrix}x\\\\y\\end{pmatrix} = \\begin{pmatrix}x^2\\\\y\\end{pmatrix}',
      expected: 'neither',
      reason: 'Wegen $x^2$ ist $f(2x) = 4x^2 \\neq 2f(x)$ (nicht homogen, Geraden werden zu Kurven) → **weder linear noch affin**.',
    },
  ];
  const c = rng.pick(cases);

  return {
    id: nextTaskId('m4-lin'),
    generatorId: 'm4-linear-vs-affine',
    moduleId: 'm4',
    topicLabel: 'Linear vs. Affin prüfen',
    prompt: `Klassifiziere die folgende Abbildung: $$${c.expr}$$`,
    checkpoints: [
      {
        id: 'cls',
        label: 'Welcher Abbildungstyp liegt vor?',
        kind: 'choice',
        expected: c.expected,
        options: [
          { id: 'linear', label: 'Linear (und damit auch affin)' },
          { id: 'affine-only', label: 'Nur affin (nicht linear, da Ursprung verschoben)' },
          { id: 'neither', label: 'Weder linear noch affin' },
        ],
        solutionLatex: c.expected === 'linear' ? '\\text{Linear}' : c.expected === 'affine-only' ? '\\text{Nur affin}' : '\\text{Weder noch}',
        points: 1,
      },
    ],
    hints: [
      'Prüfe zuerst den Blitz-Test: Bleibt der Ursprung fix ($f(\\vec{0}) = \\vec{0}$)?',
      'Kommen nur lineare Terme ($a\\cdot x + b\\cdot y$) plus evtl. eine Konstante vor, ist die Abbildung affin. Ohne Konstante (Ursprung fix) ist sie linear.',
      c.reason,
    ],
    fullSolutionSteps: [c.reason],
  };
}

/** 2. Homogene 3x3-Grundtransformationen in 2D aufstellen & auf Punkt anwenden */
export function genM4Basic2DTransform(rng: Rng = createRng()): GeneratedTask {
  const kind = rng.pick(['translate', 'scale', 'shear', 'rotate'] as const);
  const px = rng.int(-3, 4);
  const py = rng.int(-3, 4);
  let desc = '';
  let T: Matrix;

  if (kind === 'translate') {
    const tx = rng.int(-4, 5);
    const ty = rng.int(-4, 5);
    desc = `Verschiebung (Translation) um $t_x = ${tx}$ und $t_y = ${ty}$`;
    T = new Matrix([
      [1, 0, tx],
      [0, 1, ty],
      [0, 0, 1],
    ]);
  } else if (kind === 'scale') {
    const sx = rng.pick([-2, 2, 3]);
    const sy = rng.pick([1, 2, 3]);
    desc = `Skalierung um $s_x = ${sx}$ und $s_y = ${sy}$`;
    T = new Matrix([
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1],
    ]);
  } else if (kind === 'shear') {
    const lx = rng.pick([-2, 1, 2]);
    const ly = rng.pick([0, 1]);
    desc = `Scherung mit $\\lambda_x = ${lx}$ und $\\lambda_y = ${ly}$`;
    T = new Matrix([
      [1, lx, 0],
      [ly, 1, 0],
      [0, 0, 1],
    ]);
  } else {
    const deg = rng.pick([90, 180, 270] as const);
    const cos = deg === 180 ? -1 : 0;
    const sin = deg === 90 ? 1 : deg === 270 ? -1 : 0;
    desc = `Rotation um den Ursprung um $${deg}^\\circ$ gegen den Uhrzeigersinn`;
    T = new Matrix([
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1],
    ]);
  }

  const resH = T.mulVec([px, py, 1]);
  const res2 = new Vec2(resH[0], resH[1]);

  return {
    id: nextTaskId('m4-2d'),
    generatorId: 'm4-2d-basic-transform',
    moduleId: 'm4',
    topicLabel: '2D-Transformationsmatrix (3×3 homogen)',
    paperRecommended: true,
    prompt: `Stelle die homogene $3\\times 3$-Transformationsmatrix $T_{2D}$ für die **${desc}** auf und wende sie auf den Punkt $P(${px}, ${py})$ an.`,
    checkpoints: [
      {
        id: 'mat',
        label: '1. Homogene $3\\times 3$-Matrix $T_{2D}$',
        kind: 'matrix',
        matrixShape: { rows: 3, cols: 3 },
        expected: T.toFlatStrings(),
        solutionLatex: T.toLatex(),
        points: 2,
      },
      {
        id: 'pt',
        label: '2. Transformierter Bildpunkt $P\' = (x\', y\')^T$',
        kind: 'vector2',
        expected: res2.toStringArray(),
        solutionLatex: res2.toLatex(),
        points: 1,
      },
    ],
    hints: [
      'In homogenen 2D-Koordinaten lautet die letzte Zeile immer $(0, 0, 1)$ und der Punkt wird als $(x, y, 1)^T$ geschrieben.',
      `Die Matrix lautet $T_{2D} = ${T.toLatex()}$. Multipliziere $T_{2D} \\cdot (${px}, ${py}, 1)^T$.`,
      `Ergebnis: $P' = ${res2.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Homogene Matrix: $T_{2D} = ${T.toLatex()}$`,
      `2. Anwendung auf $(${px}, ${py}, 1)^T$: $T_{2D} \\cdot \\begin{pmatrix}${px}\\\\${py}\\\\1\\end{pmatrix} = \\begin{pmatrix}${res2.x.toLatex()}\\\\${res2.y.toLatex()}\\\\1\\end{pmatrix} \\Rightarrow P'(${res2.x.toString()}, ${res2.y.toString()})$`,
    ],
  };
}

/** 3. 2D-Rotation um beliebigen Punkt P(x0, y0) (Folie Abbildungen S. 55-59) */
export function genM4RotateAroundPoint2D(rng: Rng = createRng()): GeneratedTask {
  const cx = rng.int(-3, 4);
  const cy = rng.int(-3, 4);
  const qx = cx + rng.pick([-3, -2, 1, 2, 3]);
  const qy = cy + rng.pick([-2, 0, 1, 2, 3]);
  const deg = rng.pick([90, 180, 270] as const);
  const cos = deg === 180 ? -1 : 0;
  const sin = deg === 90 ? 1 : deg === 270 ? -1 : 0;

  const T_toOrigin = new Matrix([
    [1, 0, -cx],
    [0, 1, -cy],
    [0, 0, 1],
  ]);
  const T_rot = new Matrix([
    [cos, -sin, 0],
    [sin, cos, 0],
    [0, 0, 1],
  ]);
  const T_back = new Matrix([
    [1, 0, cx],
    [0, 1, cy],
    [0, 0, 1],
  ]);

  const T_ges = T_back.mul(T_rot).mul(T_toOrigin);
  const T_wrongOrder = T_toOrigin.mul(T_rot).mul(T_back);

  const qPrimeH = T_ges.mulVec([qx, qy, 1]);
  const qPrime = new Vec2(qPrimeH[0], qPrimeH[1]);

  return {
    id: nextTaskId('m4-rotp'),
    generatorId: 'm4-2d-rotate-point',
    moduleId: 'm4',
    topicLabel: '2D-Rotation um beliebigen Punkt',
    paperRecommended: true,
    prompt: `Rotiere den Punkt $Q(${qx}, ${qy})$ um $${deg}^\\circ$ gegen den Uhrzeigersinn um das Drehzentrum $P(${cx}, ${cy})$ mittels homogener $3\\times 3$-Matrizen ($T = T_T^{-1} \\cdot T_R \\cdot T_T$).`,
    checkpoints: [
      {
        id: 'T',
        label: '1. Kombinierte Gesamtmatrix $T$ (3×3)',
        kind: 'matrix',
        matrixShape: { rows: 3, cols: 3 },
        expected: T_ges.toFlatStrings(),
        solutionLatex: T_ges.toLatex(),
        points: 2,
        bugDiagnostics: !T_wrongOrder.equals(T_ges)
          ? [
              {
                matchMatrix: T_wrongOrder.toFlatStrings(),
                errorType: 'reversed-pivot-translation',
                message:
                  'Achtung Reihenfolge! Zuerst wird $P$ in den Ursprung geschoben ($-P$ steht RECHTS!), dann rotiert, dann zurückgeschoben ($+P$ steht LINKS!).',
              },
            ]
          : [],
      },
      {
        id: 'Q',
        label: '2. Bildpunkt $Q\' = (x\', y\')^T$',
        kind: 'vector2',
        expected: qPrime.toStringArray(),
        solutionLatex: qPrime.toLatex(),
        points: 1,
      },
    ],
    hints: [
      '3-Schritte-Schema (Abbildungen S. 56–57): $T = T(+P) \\cdot T_R(${deg}^\\circ) \\cdot T(-P)$ (Anwendung von rechts nach links!).',
      `Mit $\\cos(${deg}^\\circ)=${cos}, \\sin(${deg}^\\circ)=${sin}$ ergibt $T_R\\cdot T_T = ${T_rot.mul(T_toOrigin).toLatex()}$. Jetzt von links mit $T_T^{-1}$ multiplizieren.`,
      `$T = ${T_ges.toLatex()}$ und $Q' = ${qPrime.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. $T_T = ${T_toOrigin.toLatex()}$, $T_R(${deg}^\\circ) = ${T_rot.toLatex()}$, $T_T^{-1} = ${T_back.toLatex()}$`,
      `2. Gesamtmatrix (rechts nach links!): $T = T_T^{-1}\\cdot T_R\\cdot T_T = ${T_ges.toLatex()}$`,
      `3. $Q' = T \\cdot (${qx}, ${qy}, 1)^T \\Rightarrow Q'(${qPrime.x.toString()}, ${qPrime.y.toString()})$`,
    ],
  };
}

/** 4. Verkettung zweier 2D-Transformationen (Nicht-Kommutativität!) */
export function genM4Chain2D(rng: Rng = createRng()): GeneratedTask {
  const sx = rng.pick([2, 3]);
  const sy = rng.pick([1, 2]);
  const tx = rng.pick([-3, -2, 2, 3]);
  const ty = rng.pick([-2, 1, 3]);
  const px = rng.int(1, 3);
  const py = rng.int(1, 3);
  const scaleFirst = rng.next() < 0.5;

  const T_S = new Matrix([
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1],
  ]);
  const T_T = new Matrix([
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1],
  ]);

  const T_ges = scaleFirst ? T_T.mul(T_S) : T_S.mul(T_T);
  const T_wrong = scaleFirst ? T_S.mul(T_T) : T_T.mul(T_S);
  const resH = T_ges.mulVec([px, py, 1]);
  const res = new Vec2(resH[0], resH[1]);
  const wrongH = T_wrong.mulVec([px, py, 1]);
  const wrongRes = new Vec2(wrongH[0], wrongH[1]);

  const orderText = scaleFirst
    ? `**zuerst** um $(s_x=${sx}, s_y=${sy})$ skaliert und **danach** um $(t_x=${tx}, t_y=${ty})$ verschoben`
    : `**zuerst** um $(t_x=${tx}, t_y=${ty})$ verschoben und **danach** um $(s_x=${sx}, s_y=${sy})$ skaliert`;

  return {
    id: nextTaskId('m4-chain'),
    generatorId: 'm4-2d-chain',
    moduleId: 'm4',
    topicLabel: 'Verkettung & Reihenfolge (2D)',
    paperRecommended: true,
    prompt: `Der Punkt $P(${px}, ${py})$ wird ${orderText}. Berechne die Gesamtmatrix $T_{\\text{ges}}$ und den Bildpunkt $P'$.`,
    checkpoints: [
      {
        id: 'T',
        label: '1. Gesamtmatrix $T_{\\text{ges}}$ (3×3)',
        kind: 'matrix',
        matrixShape: { rows: 3, cols: 3 },
        expected: T_ges.toFlatStrings(),
        solutionLatex: T_ges.toLatex(),
        points: 2,
        bugDiagnostics: !T_wrong.equals(T_ges)
          ? [
              {
                matchMatrix: T_wrong.toFlatStrings(),
                errorType: 'chain-wrong-order',
                message:
                  'Reihenfolge vertauscht! Bei Spaltenvektoren gilt $T_{\\text{ges}} = T_2 \\cdot T_1$ – die **erste** Transformation steht immer **rechts**!',
              },
            ]
          : [],
      },
      {
        id: 'P',
        label: '2. Bildpunkt $P\'$',
        kind: 'vector2',
        expected: res.toStringArray(),
        solutionLatex: res.toLatex(),
        points: 1,
        bugDiagnostics: !wrongRes.equals(res)
          ? [
              {
                matchVector: wrongRes.toStringArray(),
                errorType: 'chain-wrong-order',
                message:
                  'Das ist das Ergebnis bei umgekehrter Reihenfolge! Prüfe, welche Transformation zuerst auf $P$ wirkt (steht rechts).',
              },
            ]
          : [],
      },
    ],
    hints: [
      'Achtung (Abbildungen S. 56): $T_{\\text{ges}} = [\\text{2. Transf.}] \\cdot [\\text{1. Transf.}]$ (rechts nach links!).',
      scaleFirst
        ? `Da zuerst skaliert wird: $T_{\\text{ges}} = T_T \\cdot T_S$.`
        : `Da zuerst verschoben wird: $T_{\\text{ges}} = T_S \\cdot T_T$.`,
      `$T_{\\text{ges}} = ${T_ges.toLatex()}$ und $P' = ${res.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      scaleFirst
        ? `1. $T_{\\text{ges}} = T_T \\cdot T_S = ${T_T.toLatex()}${T_S.toLatex()} = ${T_ges.toLatex()}$`
        : `1. $T_{\\text{ges}} = T_S \\cdot T_T = ${T_S.toLatex()}${T_T.toLatex()} = ${T_ges.toLatex()}$`,
      `2. $P' = T_{\\text{ges}} \\cdot (${px}, ${py}, 1)^T \\Rightarrow P'(${res.x.toString()}, ${res.y.toString()})$`,
    ],
  };
}

/** 5. 3D-Transformation (4x4 homogen: Rotation um X/Y/Z + Skalierung/Translation) */
export function genM4Transform3D(rng: Rng = createRng()): GeneratedTask {
  const axis = rng.pick(['X', 'Y', 'Z'] as const);
  const deg = rng.pick([90, 180, 270] as const);
  const cos = deg === 180 ? -1 : 0;
  const sin = deg === 90 ? 1 : deg === 270 ? -1 : 0;

  let R: Matrix;
  if (axis === 'X') {
    R = new Matrix([
      [1, 0, 0, 0],
      [0, cos, -sin, 0],
      [0, sin, cos, 0],
      [0, 0, 0, 1],
    ]);
  } else if (axis === 'Y') {
    // Note sign flip on Y-axis rotation (Abbildungen S. 52)!
    R = new Matrix([
      [cos, 0, sin, 0],
      [0, 1, 0, 0],
      [-sin, 0, cos, 0],
      [0, 0, 0, 1],
    ]);
  } else {
    R = new Matrix([
      [cos, -sin, 0, 0],
      [sin, cos, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
  }

  const p = new Vec3(rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4));
  const resH = R.mulVec([p.x, p.y, p.z, 1]);
  const res = new Vec3(resH[0], resH[1], resH[2]);

  // Classic Y-axis sign flip bug diagnostic!
  const bugs = [];
  if (axis === 'Y' && deg !== 180) {
    const wrongRY = new Matrix([
      [cos, 0, -sin, 0],
      [0, 1, 0, 0],
      [sin, 0, cos, 0],
      [0, 0, 0, 1],
    ]);
    const wH = wrongRY.mulVec([p.x, p.y, p.z, 1]);
    const wVec = new Vec3(wH[0], wH[1], wH[2]);
    if (!wVec.equals(res)) {
      bugs.push({
        matchVector: wVec.toStringArray(),
        errorType: 'ry-sign-flip',
        message:
          'Klassische Klausurfalle bei $T_{Ry}$ (Abbildungen S. 52)! Bei der Y-Rotation steht $+\\sin\\phi$ oben rechts und $-\\sin\\phi$ unten links – genau umgekehrt zu $T_{Rx}$ und $T_{Rz}$!',
      });
    }
  }

  return {
    id: nextTaskId('m4-3d'),
    generatorId: 'm4-3d-transform',
    moduleId: 'm4',
    topicLabel: `3D-Rotation um ${axis}-Achse (4×4)`,
    paperRecommended: true,
    prompt: `Rotiere den 3D-Punkt $A(${p.toStringArray().join(', ')})$ um $${deg}^\\circ$ um die **${axis}-Achse** mithilfe der $4\\times 4$-Rotationsmatrix $T_{R${axis.toLowerCase()}}$. Bestimme den Bildpunkt $A'$.`,
    checkpoints: [
      {
        id: 'pt',
        label: 'Bildpunkt $A\' = (x\', y\', z\')^T$',
        kind: 'vector3',
        expected: res.toStringArray(),
        solutionLatex: res.toLatex(),
        points: 2,
        bugDiagnostics: bugs,
      },
    ],
    hints: [
      `Die ${axis}-Koordinate bleibt bei einer Rotation um die ${axis}-Achse unverändert! Schau auf dein Formelblatt für $T_{R${axis.toLowerCase()}}$.`,
      `Mit $\\cos(${deg}^\\circ)=${cos}, \\sin(${deg}^\\circ)=${sin}$ gilt $T_{R${axis.toLowerCase()}} = ${R.toLatex()}$.`,
      `Multiplikation mit $(${p.toStringArray().join(', ')}, 1)^T$ liefert $A' = ${res.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. $T_{R${axis.toLowerCase()}}(${deg}^\\circ) = ${R.toLatex()}$`,
      `2. $A' = T_{R${axis.toLowerCase()}} \\cdot (${p.toStringArray().join(', ')}, 1)^T \\Rightarrow A'(${res.toStringArray().join(', ')})$`,
    ],
  };
}

/** 6. Konzeptfrage zur 5-Schritte-Rotation um beliebige 3D-Achse (Q3: Konzept-Fokus!) */
export function genM4ArbitraryAxisConcept(rng: Rng = createRng()): GeneratedTask {
  const variant = rng.pick(['order', 'why-inverse'] as const);
  if (variant === 'order') {
    return {
      id: nextTaskId('m4-axis'),
      generatorId: 'm4-3d-axis-concept',
      moduleId: 'm4',
      topicLabel: '3D-Rotation um beliebige Achse (Konzept)',
      prompt: `Um in 3D um eine beliebige Ursprungsachse $P_0(0,0,0) \\to P_1(x,y,z)$ um den Winkel $\\alpha$ zu rotieren, nutzt man das **5-Schritte-Verfahren** (Abbildungen S. 61). Welche Reihenfolge ist korrekt?`,
      checkpoints: [
        {
          id: 'mc',
          label: 'Korrekte Schrittfolge',
          kind: 'choice',
          expected: 'A',
          options: [
            { id: 'A', label: '1. um X in XZ-Ebene → 2. um Y auf Z-Achse → 3. um Z um $\\alpha$ → 4. Inv. Schritt 2 → 5. Inv. Schritt 1' },
            { id: 'B', label: '1. um Z um $\\alpha$ → 2. um X in XZ-Ebene → 3. um Y auf Z-Achse → 4. Inv. Schritt 1 → 5. Inv. Schritt 2' },
            { id: 'C', label: '1. um X in XZ-Ebene → 2. um Y auf Z-Achse → 3. um Z um $\\alpha$ → 4. Inv. Schritt 1 → 5. Inv. Schritt 2' },
          ],
          solutionLatex: '\\text{A: Achse erst auf Z drehen, drehen um }\\alpha\\text{, in umgekehrter Reihenfolge zurück!}',
          points: 1,
          bugDiagnostics: [
            {
              matchScalar: 'C',
              errorType: 'wrong-undo-order',
              message: 'Achtung beim Rückgängigmachen (Schuh-und-Socken-Prinzip): Was zuletzt gedreht wurde (Schritt 2), muss zuerst wieder zurückgedreht werden (Schritt 4)!',
            },
          ],
        },
      ],
      hints: [
        'Grundidee: Bringe die beliebige Achse erst auf eine bekannte Koordinatenachse (Z), drehe dort um $\\alpha$ und mache alles rückgängig.',
        'Wie beim An- und Ausziehen von Socken und Schuhen: Rückgängigmachen erfolgt immer in umgekehrter Reihenfolge!',
        'Antwort A ist richtig: X → Y → Z($\\alpha$) → Y⁻¹ → X⁻¹.',
      ],
      fullSolutionSteps: [
        'Folie Abbildungen S. 61: 1. um X in XZ-Ebene, 2. um Y auf Z-Achse, 3. eigentliche Rotation um Z um $\\alpha$, 4. Invertierung Schritt 2, 5. Invertierung Schritt 1.',
      ],
    };
  }

  return {
    id: nextTaskId('m4-axis'),
    generatorId: 'm4-3d-axis-concept',
    moduleId: 'm4',
    topicLabel: 'Homogene Matrizen (Konzept)',
    prompt: `Warum verwenden wir in der Computergrafik für 2D-Transformationen eine **$3\\times 3$-Matrix** und für 3D-Transformationen eine **$4\\times 4$-Matrix** (Abbildungen S. 27–30)?`,
    checkpoints: [
      {
        id: 'mc',
        label: 'Wähle die zentrale Begründung',
        kind: 'choice',
        expected: 'B',
        options: [
          { id: 'A', label: 'Weil 2×2-Matrizen keine Rotationen darstellen können.' },
          { id: 'B', label: 'Damit alle affinen Transformationen inkl. Translation als quadratische Matrixmultiplikation zu einer Gesamtmatrix verkettet werden können.' },
          { id: 'C', label: 'Weil die Determinante sonst immer 0 wäre.' },
        ],
        solutionLatex: '\\text{B: Einheitliche Verkettung inkl. Translation spart Rechenleistung!}',
        points: 1,
      },
    ],
    hints: [
      'Rotation und Skalierung klappen schon mit $2\\times 2$ – welche der 4 Grundtransformationen braucht eigentlich eine Addition $+\\vec{b}$?',
      'Die Translation ist eigentlich eine Addition. Durch die extra Zeile/Spalte (homogene Koordinaten) wird auch sie zur Matrixmultiplikation!',
      'Antwort B ist korrekt: So lassen sich beliebig viele Schritte zu einer einzigen Matrix kombinieren.',
    ],
    fullSolutionSteps: [
      'Durch homogene Koordinaten ($3\\times 3$ in 2D, $4\\times 4$ in 3D) wird auch die Translation als Matrixmultiplikation darstellbar – alle Transformationen lassen sich vorab zu einer einzigen Matrix multiplizieren.',
    ],
  };
}

export const M4_GENERATOR_MAP: Record<string, (rng?: Rng) => GeneratedTask> = {
  'm4-linear-vs-affine': genM4LinearVsAffine,
  'm4-2d-basic-transform': genM4Basic2DTransform,
  'm4-2d-rotate-point': genM4RotateAroundPoint2D,
  'm4-2d-chain': genM4Chain2D,
  'm4-3d-transform': genM4Transform3D,
  'm4-3d-axis-concept': genM4ArbitraryAxisConcept,
};
