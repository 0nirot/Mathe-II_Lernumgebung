import type { GeneratedTask } from '../../types/learning';
import { Fraction, formatSimplifiedSqrtInput, formatSimplifiedSqrtLatex } from '../exactMath';
import { createRng, nextTaskId, type Rng } from './random';

/** 1. Vorzeichen & Klammern */
export function genM0Arithmetic(rng: Rng = createRng()): GeneratedTask {
  const a = rng.int(2, 9) * rng.sign();
  const b = rng.int(2, 6);
  const c = rng.int(1, 7) * rng.sign();
  const d = rng.int(2, 8);
  // Compute a - b * (c - d)
  const inside = c - d;
  const result = a - b * inside;
  // Classic mistake: forgetting sign on -b * (-d) -> a - b*c - b*d
  const wrongSign = a - b * c - b * d;
  // Classic mistake: ignoring Punkt-vor-Strich -> (a - b) * (c - d)
  const wrongOrder = (a - b) * inside;

  const cStr = c < 0 ? `${c}` : `${c}`;
  return {
    id: nextTaskId('m0-arith'),
    generatorId: 'm0-arithmetic',
    moduleId: 'm0',
    topicLabel: 'Vorzeichen & Klammern',
    prompt: `Berechne ohne Taschenrechner: $$${a} - ${b} \\cdot (${cStr} - ${d})$$`,
    checkpoints: [
      {
        id: 'ans',
        label: 'Ergebnis',
        kind: 'scalar',
        expected: `${result}`,
        solutionLatex: `${result}`,
        points: 1,
        bugDiagnostics: [
          {
            matchScalar: `${wrongSign}`,
            errorType: 'sign-in-brackets',
            message:
              'Vorzeichenfehler beim Ausmultiplizieren! Minus mal Minus ergibt Plus: $-b \\cdot (-d) = +b\\cdot d$.',
          },
          {
            matchScalar: `${wrongOrder}`,
            errorType: 'order-of-operations',
            message:
              'Punkt-vor-Strich beachten! Erst das Produkt mit der Klammer berechnen, nicht zuerst vorne subtrahieren.',
          },
        ],
      },
    ],
    hints: [
      'Rechne zuerst den Ausdruck in der Klammer aus, danach gilt Punkt-vor-Strich.',
      `In der Klammer steht $${cStr} - ${d} = ${inside}$. Jetzt berechne $${a} - ${b} \\cdot (${inside})$.`,
      `$-${b} \\cdot (${inside}) = ${-b * inside}$, also $${a} + (${-b * inside}) = ${result}$.`,
    ],
    fullSolutionSteps: [
      `1. Klammer zuerst: $${cStr} - ${d} = ${inside}$`,
      `2. Multiplikation (Punkt vor Strich): $${b} \\cdot (${inside}) = ${b * inside}$`,
      `3. Subtraktion (Achtung bei doppeltem Minus!): $${a} - (${b * inside}) = ${result}$`,
    ],
  };
}

/** 2. Bruchrechnung */
export function genM0Fractions(rng: Rng = createRng()): GeneratedTask {
  const mode = rng.pick(['add', 'sub', 'mul', 'div'] as const);
  const dens = [2, 3, 4, 5, 6];
  const d1 = rng.pick(dens);
  const d2 = rng.pick(dens);
  const n1 = rng.int(1, d1 + 2) * rng.sign();
  const n2 = rng.int(1, d2 + 2);
  const f1 = new Fraction(n1, d1);
  const f2 = new Fraction(n2, d2);

  let opSymbol = '+';
  let result: Fraction;
  let wrongDirect: Fraction | undefined;

  if (mode === 'add') {
    opSymbol = '+';
    result = f1.add(f2);
    // Classic mistake: adding numerators & denominators directly
    if (f1.den + f2.den !== 0) {
      wrongDirect = new Fraction(f1.num + f2.num, f1.den + f2.den);
    }
  } else if (mode === 'sub') {
    opSymbol = '-';
    result = f1.sub(f2);
  } else if (mode === 'mul') {
    opSymbol = '\\cdot';
    result = f1.mul(f2);
  } else {
    opSymbol = ':';
    result = f1.div(f2);
    // Classic mistake: multiplying instead of dividing by reciprocal
    wrongDirect = f1.mul(f2);
  }

  const bugs = [];
  if (wrongDirect && !wrongDirect.equals(result)) {
    bugs.push({
      matchScalar: wrongDirect.toString(),
      errorType: mode === 'div' ? 'forgot-reciprocal' : 'added-denominators',
      message:
        mode === 'div'
          ? 'Beim Teilen durch einen Bruch musst du mit dem Kehrwert multiplizieren (Zähler und Nenner des zweiten Bruchs tauschen)!'
          : 'Achtung: Beim Addieren von Brüchen darfst du Nenner nicht einfach addieren – erst auf den gemeinsamen Hauptnenner erweitern!',
    });
  }

  const hint1 =
    mode === 'add' || mode === 'sub'
      ? 'Bringe beide Brüche zuerst auf einen gemeinsamen Hauptnenner.'
      : mode === 'mul'
        ? 'Brüche multipliziert man direkt: Zähler mal Zähler, Nenner mal Nenner.'
        : 'Durch einen Bruch teilen = mit dem Kehrwert multiplizieren!';

  const commonDen = (f1.den * f2.den) / new Fraction(f1.den, f2.den).den * f2.den; // simply f1.den * f2.den works cleanly
  const lcd = f1.den * f2.den;
  const hint2 =
    mode === 'add' || mode === 'sub'
      ? `Erweitere auf Nenner $${lcd}$: $\\frac{${f1.num * f2.den}}{${lcd}} ${opSymbol} \\frac{${f2.num * f1.den}}{${lcd}}$.`
      : mode === 'mul'
        ? `$\\frac{${f1.num} \\cdot ${f2.num}}{${f1.den} \\cdot ${f2.den}} = \\frac{${f1.num * f2.num}}{${f1.den * f2.den}}$ und dann kürzen.`
        : `$${f1.toLatex()} \\cdot \\frac{${f2.den}}{${f2.num}} = \\frac{${f1.num * f2.den}}{${f1.den * f2.num}}$ und dann kürzen.`;
  void commonDen;

  return {
    id: nextTaskId('m0-frac'),
    generatorId: 'm0-fractions',
    moduleId: 'm0',
    topicLabel: 'Bruchrechnung',
    prompt: `Berechne und kürze das Ergebnis so weit wie möglich: $$${f1.toLatex()} ${opSymbol} ${f2.toLatex()}$$`,
    checkpoints: [
      {
        id: 'ans',
        label: 'Ergebnis (als Bruch oder ganze Zahl)',
        kind: 'scalar',
        expected: result.toString(),
        solutionLatex: result.toLatex(),
        points: 1,
        bugDiagnostics: bugs,
      },
    ],
    hints: [hint1, hint2, `Gekürztes Endergebnis: $${result.toLatex()}$.`],
    fullSolutionSteps: [
      `Ausgangsaufgabe: $${f1.toLatex()} ${opSymbol} ${f2.toLatex()}$`,
      hint2,
      `Vollständig gekürzt: $${result.toLatex()}$`,
    ],
  };
}

/** 3. Gleichung nach lambda/x umstellen (Vorbereitung auf Schnittpunkte) */
export function genM0LinearEquation(rng: Rng = createRng()): GeneratedTask {
  // Construct backwards from clean solution x in {-5..5} or simple halves
  const xSol = rng.pick([
    new Fraction(-4),
    new Fraction(-3),
    new Fraction(-2),
    new Fraction(-1),
    new Fraction(1),
    new Fraction(2),
    new Fraction(3),
    new Fraction(4),
    new Fraction(1, 2),
    new Fraction(-1, 2),
    new Fraction(3, 2),
  ]);
  const a = rng.pick([-4, -3, -2, 2, 3, 4]);
  const b = rng.int(-8, 8);
  // Make sure rhs = a * xSol + b is an integer!
  const rhsFrac = xSol.mul(a).add(b);
  // If rhsFrac is not integer (only possible if a is odd and xSol has den 2), double a
  const aFinal = rhsFrac.isInteger() ? a : a * 2;
  const rhs = xSol.mul(aFinal).add(b);

  const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const wrongSignB = rhs.add(b).div(aFinal);

  return {
    id: nextTaskId('m0-eq'),
    generatorId: 'm0-linear-equation',
    moduleId: 'm0',
    topicLabel: 'Gleichungen umstellen',
    prompt: `Löse die Gleichung nach $\\lambda$ auf: $$${aFinal}\\lambda ${bSign} = ${rhs.toLatex()}$$`,
    checkpoints: [
      {
        id: 'ans',
        label: '$\\lambda =$',
        kind: 'scalar',
        expected: xSol.toString(),
        solutionLatex: xSol.toLatex(),
        points: 1,
        bugDiagnostics: [
          {
            matchScalar: wrongSignB.toString(),
            errorType: 'wrong-move-sign',
            message:
              'Beim Hinüberbringen auf die andere Seite dreht sich das Vorzeichen um! (+ wird zu − und umgekehrt).',
          },
          {
            matchScalar: xSol.neg().toString(),
            errorType: 'sign-on-divide',
            message:
              'Fast! Achte beim Teilen durch den Faktor vor $\\lambda$ auf das Minuszeichen.',
          },
        ],
      },
    ],
    hints: [
      'Bringe zuerst die Zahl ohne $\\lambda$ auf die rechte Seite.',
      `$${aFinal}\\lambda = ${rhs.toLatex()} ${b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`} = ${rhs.sub(b).toLatex()}$.`,
      `Teile nun durch $${aFinal}$: $\\lambda = ${xSol.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Konstante auf die rechte Seite: $${aFinal}\\lambda = ${rhs.sub(b).toLatex()}$`,
      `2. Durch $${aFinal}$ teilen: $\\lambda = \\frac{${rhs.sub(b).toLatex()}}{${aFinal}} = ${xSol.toLatex()}$`,
    ],
  };
}

/** 4. Wurzeln vereinfachen & Nenner rational machen */
export function genM0Roots(rng: Rng = createRng()): GeneratedTask {
  const variant = rng.pick(['simplify', 'rationalize', 'product'] as const);

  if (variant === 'simplify') {
    const k = rng.pick([2, 3, 4, 5]);
    const r = rng.pick([2, 3, 5]);
    const n = k * k * r;
    return {
      id: nextTaskId('m0-root'),
      generatorId: 'm0-roots',
      moduleId: 'm0',
      topicLabel: 'Wurzeln vereinfachen',
      prompt: `Ziehe so weit wie möglich teilweise die Wurzel: $$\\sqrt{${n}}$$`,
      checkpoints: [
        {
          id: 'ans',
          label: 'Vereinfachter Ausdruck (z. B. 3*sqrt(2))',
          kind: 'scalar',
          expected: `${k}*sqrt(${r})`,
          solutionLatex: `${k}\\sqrt{${r}}`,
          points: 1,
        },
      ],
      hints: [
        `Suche die größte Quadratzahl ($4, 9, 16, 25, \\dots$), die in $${n}$ steckt.`,
        `$${n} = ${k * k} \\cdot ${r}$, und $\\sqrt{${k * k}} = ${k}$.`,
        `$\\sqrt{${n}} = \\sqrt{${k * k} \\cdot ${r}} = ${k}\\sqrt{${r}}$.`,
      ],
      fullSolutionSteps: [
        `Zerlege $${n}$ in Quadratzahl mal Rest: $${n} = ${k * k} \\cdot ${r}$`,
        `Wurzel getrennt ziehen: $\\sqrt{${k * k}} \\cdot \\sqrt{${r}} = ${k}\\sqrt{${r}}$`,
      ],
    };
  }

  if (variant === 'rationalize') {
    const r = rng.pick([2, 3, 5]);
    const mult = rng.pick([1, 2, 3]);
    const num = r * mult; // num / sqrt(r) = mult * sqrt(r)
    return {
      id: nextTaskId('m0-root'),
      generatorId: 'm0-roots',
      moduleId: 'm0',
      topicLabel: 'Nenner rational machen',
      prompt: `Vereinfache ohne Taschenrechner (Nenner wurzelfrei machen): $$\\frac{${num}}{\\sqrt{${r}}}$$`,
      checkpoints: [
        {
          id: 'ans',
          label: 'Vereinfachtes Ergebnis',
          kind: 'scalar',
          expected: mult === 1 ? `sqrt(${r})` : `${mult}*sqrt(${r})`,
          solutionLatex: mult === 1 ? `\\sqrt{${r}}` : `${mult}\\sqrt{${r}}`,
          points: 1,
        },
      ],
      hints: [
        `Erweitere Zähler und Nenner mit $\\sqrt{${r}}$.`,
        `$\\frac{${num} \\cdot \\sqrt{${r}}}{\\sqrt{${r}} \\cdot \\sqrt{${r}}} = \\frac{${num}\\sqrt{${r}}}{${r}}$.`,
        `Kürze $${num}$ durch $${r}$: Ergebnis ist $${mult === 1 ? `\\sqrt{${r}}` : `${mult}\\sqrt{${r}}`}$.`,
      ],
      fullSolutionSteps: [
        `1. Mit $\\sqrt{${r}}$ erweitern: $\\frac{${num}\\sqrt{${r}}}{${r}}$`,
        `2. Kürzen: $${mult === 1 ? `\\sqrt{${r}}` : `${mult}\\sqrt{${r}}`}$`,
      ],
    };
  }

  // product: sqrt(a) * sqrt(b) = clean integer
  const r = rng.pick([2, 3, 5]);
  const k1 = rng.pick([1, 2, 3]);
  const k2 = rng.pick([1, 2, 3]);
  const a = k1 * k1 * r;
  const b = k2 * k2 * r;
  const result = k1 * k2 * r;
  return {
    id: nextTaskId('m0-root'),
    generatorId: 'm0-roots',
    moduleId: 'm0',
    topicLabel: 'Wurzeln multiplizieren',
    prompt: `Berechne im Kopf: $$\\sqrt{${a}} \\cdot \\sqrt{${b}}$$`,
    checkpoints: [
      {
        id: 'ans',
        label: 'Ergebnis',
        kind: 'scalar',
        expected: `${result}`,
        solutionLatex: `${result}`,
        points: 1,
      },
    ],
    hints: [
      'Nutze das Wurzelgesetz $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{a \\cdot b}$ (oder ziehe vorher teilweise die Wurzel).',
      `$\\sqrt{${a}} = ${formatSimplifiedSqrtLatex(a)}$ und $\\sqrt{${b}} = ${formatSimplifiedSqrtLatex(b)}$.`,
      `Das Produkt ergibt $${k1} \\cdot ${k2} \\cdot ${r} = ${result}$.`,
    ],
    fullSolutionSteps: [
      `Teilweise Wurzelziehen: $${formatSimplifiedSqrtLatex(a)} \\cdot ${formatSimplifiedSqrtLatex(b)}$`,
      `Da $\\sqrt{${r}} \\cdot \\sqrt{${r}} = ${r}$, folgt $${k1} \\cdot ${k2} \\cdot ${r} = ${result}$.`,
    ],
  };
}

/** 5. Pythagoras in 2D & 3D (pythagoreische Tripel & Quadrupel) */
const PYTH_2D: readonly [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
];

const PYTH_3D: readonly [number, number, number, number][] = [
  [1, 2, 2, 3],
  [2, 3, 6, 7],
  [2, 4, 4, 6],
  [1, 4, 8, 9],
  [4, 4, 7, 9],
  [0, 3, 4, 5],
];

export function genM0Pythagoras(rng: Rng = createRng()): GeneratedTask {
  const is3D = rng.next() < 0.5;
  if (!is3D) {
    const [a, b, c] = rng.pick(PYTH_2D);
    return {
      id: nextTaskId('m0-pyth'),
      generatorId: 'm0-pythagoras',
      moduleId: 'm0',
      topicLabel: 'Satz des Pythagoras (2D)',
      prompt: `Ein rechtwinkliges Dreieck hat die Katheten $a = ${a}$ und $b = ${b}$. Berechne die Länge der Hypotenuse $c$.`,
      checkpoints: [
        {
          id: 'ans',
          label: 'Hypotenuse $c$',
          kind: 'scalar',
          expected: `${c}`,
          solutionLatex: `${c}`,
          points: 1,
          bugDiagnostics: [
            {
              matchScalar: `${a * a + b * b}`,
              errorType: 'forgot-sqrt',
              message: `Du hast $c^2 = ${a * a + b * b}$ berechnet – vergiss am Ende nicht die Wurzel zu ziehen!`,
            },
            {
              matchScalar: `${a + b}`,
              errorType: 'linear-add',
              message: 'Die Wurzel darf man nicht einzeln über eine Summe ziehen: $\\sqrt{a^2+b^2} \\neq a+b$.',
            },
          ],
        },
      ],
      hints: [
        'Nutze den Satz des Pythagoras: $c = \\sqrt{a^2 + b^2}$.',
        `$c = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${c * c}}$.`,
        `Die Quadratwurzel aus $${c * c}$ ist $${c}$.`,
      ],
      fullSolutionSteps: [
        `$c^2 = a^2 + b^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$`,
        `$c = \\sqrt{${c * c}} = ${c}$`,
      ],
    };
  }

  const [a, b, c, d] = rng.pick(PYTH_3D);
  return {
    id: nextTaskId('m0-pyth3d'),
    generatorId: 'm0-pythagoras',
    moduleId: 'm0',
    topicLabel: 'Pythagoras im Raum (3D)',
    prompt: `Berechne den Abstand des Punktes $P(${a}, ${b}, ${c})$ vom Koordinatenursprung $O(0, 0, 0)$ (3D-Pythagoras).`,
    checkpoints: [
      {
        id: 'ans',
        label: 'Abstand $d$',
        kind: 'scalar',
        expected: `${d}`,
        solutionLatex: `${d}`,
        points: 1,
        bugDiagnostics: [
          {
            matchScalar: `${d * d}`,
            errorType: 'forgot-sqrt',
            message: `Das ist noch $d^2 = ${d * d}$ – ziehe noch die Wurzel!`,
          },
        ],
      },
    ],
    hints: [
      'Im 3D-Raum lautet der Pythagoras: $d = \\sqrt{x^2 + y^2 + z^2}$.',
      `$d = \\sqrt{${a}^2 + ${b}^2 + ${c}^2} = \\sqrt{${a * a} + ${b * b} + ${c * c}} = \\sqrt{${d * d}}$.`,
      `$d = \\sqrt{${d * d}} = ${d}$.`,
    ],
    fullSolutionSteps: [
      `$d = \\sqrt{${a}^2 + ${b}^2 + ${c}^2} = \\sqrt{${a * a} + ${b * b} + ${c * c}} = \\sqrt{${d * d}} = ${d}$`,
    ],
  };
}

/** 6. Geradengleichung f(x) = m*x + c */
export function genM0Line2D(rng: Rng = createRng()): GeneratedTask {
  const m = rng.pick([-3, -2, -1, 1, 2, 3, 4]);
  const c = rng.int(-5, 5);
  const x1 = rng.int(-2, 2);
  const dx = rng.pick([1, 2, 3]);
  const x2 = x1 + dx;
  const y1 = m * x1 + c;
  const y2 = m * x2 + c;

  return {
    id: nextTaskId('m0-line'),
    generatorId: 'm0-line-2d',
    moduleId: 'm0',
    topicLabel: '2D-Geradengleichung',
    prompt: `Eine Gerade $f(x) = m \\cdot x + c$ verläuft durch $P_1(${x1}, ${y1})$ und $P_2(${x2}, ${y2})$. Bestimme Steigung $m$ und $y$-Achsenabschnitt $c$.`,
    checkpoints: [
      {
        id: 'm',
        label: '1. Steigung $m$',
        kind: 'scalar',
        expected: `${m}`,
        solutionLatex: `${m}`,
        points: 1,
        bugDiagnostics: [
          {
            matchScalar: new Fraction(dx, y2 - y1).toString(),
            errorType: 'inverted-slope',
            message: 'Zähler und Nenner vertauscht! Steigung ist $\\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}$, nicht umgekehrt.',
          },
        ],
      },
      {
        id: 'c',
        label: '2. $y$-Achsenabschnitt $c$',
        kind: 'scalar',
        expected: `${c}`,
        solutionLatex: `${c}`,
        points: 1,
      },
    ],
    hints: [
      'Berechne zuerst die Steigung $m = \\frac{y_2 - y_1}{x_2 - x_1}$.',
      `$m = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = \\frac{${y2 - y1}}{${dx}} = ${m}$. Setze dann $P_1$ in $y = m\\cdot x + c$ ein.`,
      `$${y1} = ${m} \\cdot (${x1}) + c \\Rightarrow c = ${y1} - (${m * x1}) = ${c}$.`,
    ],
    fullSolutionSteps: [
      `1. Steigung: $m = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = \\frac{${y2 - y1}}{${dx}} = ${m}$`,
      `2. Punkt $P_1(${x1}, ${y1})$ einsetzen: $${y1} = ${m} \\cdot (${x1}) + c \\Rightarrow c = ${c}$`,
      `Geradengleichung: $f(x) = ${m}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}$`,
    ],
  };
}

/** 7. Grad <-> Bogenmaß (Folie Trigonometrie S. 5-7) */
interface AnglePair {
  deg: number;
  radExpr: string;
  radLatex: string;
}

export const STANDARD_ANGLES: readonly AnglePair[] = [
  { deg: 30, radExpr: 'pi/6', radLatex: '\\frac{\\pi}{6}' },
  { deg: 45, radExpr: 'pi/4', radLatex: '\\frac{\\pi}{4}' },
  { deg: 60, radExpr: 'pi/3', radLatex: '\\frac{\\pi}{3}' },
  { deg: 90, radExpr: 'pi/2', radLatex: '\\frac{\\pi}{2}' },
  { deg: 120, radExpr: '2*pi/3', radLatex: '\\frac{2\\pi}{3}' },
  { deg: 135, radExpr: '3*pi/4', radLatex: '\\frac{3\\pi}{4}' },
  { deg: 150, radExpr: '5*pi/6', radLatex: '\\frac{5\\pi}{6}' },
  { deg: 180, radExpr: 'pi', radLatex: '\\pi' },
  { deg: 210, radExpr: '7*pi/6', radLatex: '\\frac{7\\pi}{6}' },
  { deg: 225, radExpr: '5*pi/4', radLatex: '\\frac{5\\pi}{4}' },
  { deg: 240, radExpr: '4*pi/3', radLatex: '\\frac{4\\pi}{3}' },
  { deg: 270, radExpr: '3*pi/2', radLatex: '\\frac{3\\pi}{2}' },
  { deg: 300, radExpr: '5*pi/3', radLatex: '\\frac{5\\pi}{3}' },
  { deg: 315, radExpr: '7*pi/4', radLatex: '\\frac{7\\pi}{4}' },
  { deg: 330, radExpr: '11*pi/6', radLatex: '\\frac{11\\pi}{6}' },
  { deg: 360, radExpr: '2*pi', radLatex: '2\\pi' },
];

export function genM0DegRad(rng: Rng = createRng()): GeneratedTask {
  const pair = rng.pick(STANDARD_ANGLES);
  const toRad = rng.next() < 0.5;

  if (toRad) {
    return {
      id: nextTaskId('m0-degrad'),
      generatorId: 'm0-deg-rad',
      moduleId: 'm0',
      topicLabel: 'Grad → Bogenmaß',
      prompt: `Rechne den Winkel $${pair.deg}^\\circ$ exakt in das **Bogenmaß** (als Vielfaches von $\\pi$) um.`,
      checkpoints: [
        {
          id: 'ans',
          label: 'Winkel im Bogenmaß (z. B. 3pi/4)',
          kind: 'scalar',
          expected: pair.radExpr,
          solutionLatex: pair.radLatex,
          points: 1,
        },
      ],
      hints: [
        'Formel (Folie Trig. S. 7): $\\text{rad} = \\frac{\\pi}{180^\\circ} \\cdot \\text{deg}$.',
        `Kürze den Bruch $\\frac{${pair.deg}}{180}$ vollständig.`,
        `$\\frac{${pair.deg}}{180}\\pi = ${pair.radLatex}$.`,
      ],
      fullSolutionSteps: [
        `$\\text{rad} = \\frac{\\pi}{180^\\circ} \\cdot ${pair.deg}^\\circ = \\frac{${pair.deg}}{180}\\pi = ${pair.radLatex}$`,
      ],
    };
  }

  return {
    id: nextTaskId('m0-raddeg'),
    generatorId: 'm0-deg-rad',
    moduleId: 'm0',
    topicLabel: 'Bogenmaß → Grad',
    prompt: `Rechne den Winkel $${pair.radLatex}$ exakt ins **Gradmaß** um.`,
    checkpoints: [
      {
        id: 'ans',
        label: 'Winkel in Grad',
        kind: 'scalar',
        expected: `${pair.deg}`,
        unit: '°',
        solutionLatex: `${pair.deg}^\\circ`,
        points: 1,
      },
    ],
    hints: [
      'Formel (Folie Trig. S. 7): $\\text{deg} = \\frac{180^\\circ}{\\pi} \\cdot \\text{rad}$ (einfach $\\pi$ durch $180^\\circ$ ersetzen!).',
      `Ersetze $\\pi$ in $${pair.radLatex}$ durch $180^\\circ$.`,
      `Ergebnis: $${pair.deg}^\\circ$.`,
    ],
    fullSolutionSteps: [
      `Ersetze $\\pi = 180^\\circ$ in $${pair.radLatex}$:`,
      `$${pair.radLatex} \\cdot \\frac{180^\\circ}{\\pi} = ${pair.deg}^\\circ$`,
    ],
  };
}

/** 8. Exakte Trigonometrie-Werte ohne Taschenrechner */
interface TrigEntry {
  deg: number;
  sinExpr: string;
  sinLatex: string;
  cosExpr: string;
  cosLatex: string;
}

const EXACT_TRIG_TABLE: readonly TrigEntry[] = [
  { deg: 0, sinExpr: '0', sinLatex: '0', cosExpr: '1', cosLatex: '1' },
  { deg: 30, sinExpr: '1/2', sinLatex: '\\frac{1}{2}', cosExpr: 'sqrt(3)/2', cosLatex: '\\frac{\\sqrt{3}}{2}' },
  { deg: 45, sinExpr: 'sqrt(2)/2', sinLatex: '\\frac{\\sqrt{2}}{2}', cosExpr: 'sqrt(2)/2', cosLatex: '\\frac{\\sqrt{2}}{2}' },
  { deg: 60, sinExpr: 'sqrt(3)/2', sinLatex: '\\frac{\\sqrt{3}}{2}', cosExpr: '1/2', cosLatex: '\\frac{1}{2}' },
  { deg: 90, sinExpr: '1', sinLatex: '1', cosExpr: '0', cosLatex: '0' },
  { deg: 180, sinExpr: '0', sinLatex: '0', cosExpr: '-1', cosLatex: '-1' },
  { deg: 270, sinExpr: '-1', sinLatex: '-1', cosExpr: '0', cosLatex: '0' },
];

export function genM0ExactTrig(rng: Rng = createRng()): GeneratedTask {
  const reverse = rng.next() < 0.45;

  if (reverse) {
    // Inverse lookup on [0°, 90°] for arccos / arcsin (super exam-relevant!)
    const acute = EXACT_TRIG_TABLE.slice(0, 5);
    const entry = rng.pick(acute);
    const useCos = rng.next() < 0.5;
    const fnName = useCos ? '\\arccos' : '\\arcsin';
    const valLatex = useCos ? entry.cosLatex : entry.sinLatex;
    const compAngle = 90 - entry.deg;

    return {
      id: nextTaskId('m0-trig-inv'),
      generatorId: 'm0-exact-trig',
      moduleId: 'm0',
      topicLabel: 'Exakte Winkel (arccos / arcsin)',
      prompt: `Bestimme den Winkel $\\alpha \\in [0^\\circ, 90^\\circ]$ ohne Taschenrechner: $$\\alpha = ${fnName}\\left(${valLatex}\\right)$$`,
      checkpoints: [
        {
          id: 'ans',
          label: 'Winkel $\\alpha$',
          kind: 'scalar',
          expected: `${entry.deg}`,
          unit: '°',
          solutionLatex: `${entry.deg}^\\circ`,
          points: 1,
          bugDiagnostics:
            compAngle !== entry.deg
              ? [
                  {
                    matchScalar: `${compAngle}`,
                    errorType: 'sin-cos-swap',
                    message: `Du hast Sinus und Kosinus verwechselt! Für $\\sin$ zählt man hoch ($\\frac{\\sqrt{0}}{2} \\dots \\frac{\\sqrt{4}}{2}$), für $\\cos$ rückwärts.`,
                  },
                ]
              : [],
        },
      ],
      hints: [
        'Nutze den $\\frac{\\sqrt{n}}{2}$-Merktrick für $0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$.',
        useCos
          ? 'Kosinus zählt von oben runter: $\\cos(0^\\circ)=\\frac{\\sqrt{4}}{2}, \\cos(30^\\circ)=\\frac{\\sqrt{3}}{2}, \\cos(45^\\circ)=\\frac{\\sqrt{2}}{2}, \\cos(60^\\circ)=\\frac{\\sqrt{1}}{2}, \\cos(90^\\circ)=0$.'
          : 'Sinus zählt von unten hoch: $\\sin(0^\\circ)=0, \\sin(30^\\circ)=\\frac{\\sqrt{1}}{2}, \\sin(45^\\circ)=\\frac{\\sqrt{2}}{2}, \\sin(60^\\circ)=\\frac{\\sqrt{3}}{2}, \\sin(90^\\circ)=1$.',
        `Der passende Winkel ist $\\alpha = ${entry.deg}^\\circ$.`,
      ],
      fullSolutionSteps: [
        `Aus der Standardwert-Tabelle: $${useCos ? '\\cos' : '\\sin'}(${entry.deg}^\\circ) = ${valLatex}$`,
        `Also $\\alpha = ${entry.deg}^\\circ$.`,
      ],
    };
  }

  const entry = rng.pick(EXACT_TRIG_TABLE);
  const useCos = rng.next() < 0.5;
  const fnName = useCos ? '\\cos' : '\\sin';
  const expectedExpr = useCos ? entry.cosExpr : entry.sinExpr;
  const expectedLatex = useCos ? entry.cosLatex : entry.sinLatex;
  const swappedExpr = useCos ? entry.sinExpr : entry.cosExpr;

  return {
    id: nextTaskId('m0-trig'),
    generatorId: 'm0-exact-trig',
    moduleId: 'm0',
    topicLabel: 'Exakte Sinus-/Kosinus-Werte',
    prompt: `Gib den exakten Wert ohne Taschenrechner an: $$${fnName}(${entry.deg}^\\circ)$$`,
    checkpoints: [
      {
        id: 'ans',
        label: 'Exakter Wert (z. B. sqrt(3)/2 oder 1/2)',
        kind: 'scalar',
        expected: expectedExpr,
        solutionLatex: expectedLatex,
        points: 1,
        bugDiagnostics:
          swappedExpr !== expectedExpr
            ? [
                {
                  matchScalar: swappedExpr,
                  errorType: 'sin-cos-swap',
                  message:
                    'Achtung: Das ist der Wert der anderen Winkelfunktion! Merke: $\\cos$ ist die waagerechte $x$-Koordinate am Einheitskreis, $\\sin$ die senkrechte $y$-Koordinate.',
                },
              ]
            : [],
      },
    ],
    hints: [
      'Stelle dir den Punkt auf dem Einheitskreis bei diesem Winkel vor ($x = \\cos$, $y = \\sin$).',
      'Für $0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$ gilt die Reihe $\\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2}$.',
      `$${fnName}(${entry.deg}^\\circ) = ${expectedLatex}$.`,
    ],
    fullSolutionSteps: [
      `Am Einheitskreis (bzw. $\\frac{\\sqrt{n}}{2}$-Regel): $${fnName}(${entry.deg}^\\circ) = ${expectedLatex}$`,
    ],
  };
}

/** 8-Fragen-Eingangscheck für Modul 0 (1 Frage pro Baustein) */
export interface DiagnosticQuestionItem {
  skillKey: string;
  lessonId: string;
  skillName: string;
  task: GeneratedTask;
}

export function generateM0DiagnosticSuite(rng: Rng = createRng()): DiagnosticQuestionItem[] {
  return [
    {
      skillKey: 'm0-arithmetic',
      lessonId: 'm0-1-arithmetik',
      skillName: 'Vorzeichen & Klammern',
      task: genM0Arithmetic(rng),
    },
    {
      skillKey: 'm0-fractions',
      lessonId: 'm0-1-arithmetik',
      skillName: 'Bruchrechnung',
      task: genM0Fractions(rng),
    },
    {
      skillKey: 'm0-linear-equation',
      lessonId: 'm0-2-gleichungen-wurzeln',
      skillName: 'Gleichungen umstellen',
      task: genM0LinearEquation(rng),
    },
    {
      skillKey: 'm0-roots',
      lessonId: 'm0-2-gleichungen-wurzeln',
      skillName: 'Wurzeln vereinfachen',
      task: genM0Roots(rng),
    },
    {
      skillKey: 'm0-pythagoras',
      lessonId: 'm0-3-koordinaten-geraden',
      skillName: 'Pythagoras (2D / 3D)',
      task: genM0Pythagoras(rng),
    },
    {
      skillKey: 'm0-line-2d',
      lessonId: 'm0-3-koordinaten-geraden',
      skillName: 'Geradengleichung y = mx + c',
      task: genM0Line2D(rng),
    },
    {
      skillKey: 'm0-deg-rad',
      lessonId: 'm0-4-trigonometrie',
      skillName: 'Grad ↔ Bogenmaß',
      task: genM0DegRad(rng),
    },
    {
      skillKey: 'm0-exact-trig',
      lessonId: 'm0-4-trigonometrie',
      skillName: 'Exakte sin/cos-Werte',
      task: genM0ExactTrig(rng),
    },
  ];
}

export const M0_GENERATOR_MAP: Record<string, (rng?: Rng) => GeneratedTask> = {
  'm0-arithmetic': genM0Arithmetic,
  'm0-fractions': genM0Fractions,
  'm0-linear-equation': genM0LinearEquation,
  'm0-roots': genM0Roots,
  'm0-pythagoras': genM0Pythagoras,
  'm0-line-2d': genM0Line2D,
  'm0-deg-rad': genM0DegRad,
  'm0-exact-trig': genM0ExactTrig,
};

// Re-export helper so tests can check simplified root input format
export { formatSimplifiedSqrtInput };
