import type { GeneratedTask } from '../../types/learning';
import { Fraction } from '../exactMath';
import { createRng, nextTaskId, type Rng } from './random';

/** 1. Lineare Interpolation (1D) */
export function genM5Linear1D(rng: Rng = createRng()): GeneratedTask {
  const x1 = rng.int(0, 4);
  const dx = rng.pick([2, 4]);
  const x2 = x1 + dx;
  const m = rng.pick([-3, -2, -1, 1, 2, 3, 4]);
  const y1 = rng.int(0, 8);
  const y2 = y1 + m * dx;
  const step = rng.pick(dx === 2 ? [1] : [1, 2, 3]);
  const xQuery = x1 + step;
  const yQuery = y1 + m * step;

  return {
    id: nextTaskId('m5-lin1d'),
    generatorId: 'm5-linear-1d',
    moduleId: 'm5',
    topicLabel: 'Lineare Interpolation (1D)',
    prompt: `Gegeben sind die diskreten Stützstellen $P_1(${x1}, ${y1})$ und $P_2(${x2}, ${y2})$. Ermittle per **linearer Interpolation** die Steigung $m$ und den interpolierten Funktionswert $f(${xQuery})$.`,
    checkpoints: [
      {
        id: 'm',
        label: '1. Steigung $m = \\frac{y_2 - y_1}{x_2 - x_1}$',
        kind: 'scalar',
        expected: `${m}`,
        solutionLatex: `${m}`,
        points: 1,
      },
      {
        id: 'val',
        label: `2. Interpolierter Wert $f(${xQuery})$`,
        kind: 'scalar',
        expected: `${yQuery}`,
        solutionLatex: `${yQuery}`,
        points: 1,
      },
    ],
    hints: [
      'Formel (Interpolation S. 17): $f(x) = \\frac{y_2-y_1}{x_2-x_1}\\cdot x + y_1 - \\frac{y_2-y_1}{x_2-x_1}\\cdot x_1 = y_1 + m\\cdot(x - x_1)$.',
      `$m = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = ${m}$. Damit $f(${xQuery}) = ${y1} + (${m})\\cdot(${xQuery} - ${x1})$.`,
      `$f(${xQuery}) = ${yQuery}$.`,
    ],
    fullSolutionSteps: [
      `1. Steigung: $m = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = \\frac{${y2 - y1}}{${dx}} = ${m}$`,
      `2. Einsetzen bei $x = ${xQuery}$: $f(${xQuery}) = ${y1} + (${m})\\cdot(${step}) = ${yQuery}$`,
    ],
  };
}

/** 2. Bilineare Interpolation (2D, garantiert glatte ganze Zahlen!) */
export function genM5Bilinear2D(rng: Rng = createRng()): GeneratedTask {
  const x1 = rng.pick([0, 2]);
  const y1 = rng.pick([0, 2]);
  const dx = rng.pick([2, 4]);
  const dy = rng.pick([2, 4]);
  const x2 = x1 + dx;
  const y2 = y1 + dy;

  const stepX = rng.pick(dx === 2 ? [1] : [1, 2, 3]);
  const stepY = rng.pick(dy === 2 ? [1] : [1, 2, 3]);
  const xq = x1 + stepX;
  const yq = y1 + stepY;

  // Choose corner values as multiples of 8 (or 16) so 1/4 and 1/2 steps stay clean integers!
  const q11 = rng.int(1, 5) * 8;
  const q21 = rng.int(2, 8) * 8;
  const q12 = rng.int(2, 8) * 8;
  const q22 = rng.int(3, 10) * 8;

  const tx = new Fraction(stepX, dx);
  const ty = new Fraction(stepY, dy);
  const r1 = Fraction.from(q11).add(tx.mul(q21 - q11));
  const r2 = Fraction.from(q12).add(tx.mul(q22 - q12));
  const pVal = r1.add(ty.mul(r2.sub(r1)));

  return {
    id: nextTaskId('m5-bilin'),
    generatorId: 'm5-bilinear-2d',
    moduleId: 'm5',
    topicLabel: 'Bilineare Interpolation (2D)',
    paperRecommended: true,
    prompt: `Auf einem 2D-Raster sind vier Pixel-Helligkeitswerte gegeben:
$$Q_{11}(${x1}, ${y1}) = ${q11}, \\quad Q_{21}(${x2}, ${y1}) = ${q21}, \\quad Q_{12}(${x1}, ${y2}) = ${q12}, \\quad Q_{22}(${x2}, ${y2}) = ${q22}$$
Berechne per **bilinearer Interpolation** (erst entlang $x$ zu $R_1, R_2$, dann entlang $y$) den Wert am Punkt $P(${xq}, ${yq})$.`,
    checkpoints: [
      {
        id: 'r1',
        label: `1. Zwischenwert unten $R_1(${xq}, ${y1})$`,
        kind: 'scalar',
        expected: r1.toString(),
        solutionLatex: r1.toLatex(),
        points: 1,
      },
      {
        id: 'r2',
        label: `2. Zwischenwert oben $R_2(${xq}, ${y2})$`,
        kind: 'scalar',
        expected: r2.toString(),
        solutionLatex: r2.toLatex(),
        points: 1,
      },
      {
        id: 'p',
        label: `3. Endwert $P(${xq}, ${yq})$`,
        kind: 'scalar',
        expected: pVal.toString(),
        solutionLatex: pVal.toLatex(),
        points: 2,
      },
    ],
    hints: [
      `Anteil entlang $x$: $t_x = \\frac{${xq}-${x1}}{${x2}-${x1}} = ${tx.toLatex()}$. Berechne damit $R_1$ zwischen $Q_{11}$ und $Q_{21}$ sowie $R_2$ zwischen $Q_{12}$ und $Q_{22}$.`,
      `$R_1 = ${r1.toLatex()}$ und $R_2 = ${r2.toLatex()}$. Jetzt linear in $y$-Richtung mit Anteil $t_y = \\frac{${yq}-${y1}}{${y2}-${y1}} = ${ty.toLatex()}$.`,
      `$P(${xq}, ${yq}) = ${r1.toLatex()} + ${ty.toLatex()}\\cdot(${r2.toLatex()} - ${r1.toLatex()}) = ${pVal.toLatex()}$.`,
    ],
    fullSolutionSteps: [
      `1. Anteil in $x$-Richtung: $t_x = ${tx.toLatex()}$`,
      `   $R_1 = ${q11} + ${tx.toLatex()}\\cdot(${q21} - ${q11}) = ${r1.toLatex()}$`,
      `   $R_2 = ${q12} + ${tx.toLatex()}\\cdot(${q22} - ${q12}) = ${r2.toLatex()}$`,
      `2. Anteil in $y$-Richtung: $t_y = ${ty.toLatex()}$`,
      `   $P = ${r1.toLatex()} + ${ty.toLatex()}\\cdot(${r2.toLatex()} - ${r1.toLatex()}) = ${pVal.toLatex()}$`,
    ],
  };
}

/** 3. Bildartefakte, Splines & Animation (Konzept & Zuordnung, Q3!) */
export function genM5Concepts(rng: Rng = createRng()): GeneratedTask {
  const bank = [
    {
      prompt: 'Beim Hochskalieren einer Rastergrafik entstehen stark sichtbare **Treppenstufen (Aliasing)** an schrägen Kanten. Welches Verfahren wurde typischerweise verwendet?',
      expected: 'nn',
      options: [
        { id: 'nn', label: 'Nearest-Neighbour (keine echte Glättung)' },
        { id: 'bilin', label: 'Bilineare Interpolation' },
        { id: 'bicub', label: 'Bikubische Interpolation' },
      ],
      sol: '\\text{Nearest-Neighbour} \\to \\text{Aliasing (Treppeneffekt)}',
      expl: 'Nearest-Neighbour kopiert schlicht den nächstgelegenen Pixelwert → scharfe Blöcke und Treppeneffekt (Aliasing).',
    },
    {
      prompt: 'Welches Bildartefakt ist typisch für die **bikubische Interpolation** an harten Schwarz-Weiß-Kanten (Folie Interpolation S. 7)?',
      expected: 'halo',
      options: [
        { id: 'alias', label: 'Starkes Aliasing (Treppenstufen)' },
        { id: 'blur', label: 'Reines Blurring ohne Kontrastüberhöhung' },
        { id: 'halo', label: 'Edge Halo (helle/dunkle Säume durch Überschwingen kubischer Polynome)' },
      ],
      sol: '\\text{Bikubisch} \\to \\text{Edge Halo}',
      expl: 'Kubische Polynome können an harten Kanten leicht überschwingen → es entstehen helle/dunkle Kanten-Säume (Edge Halo).',
    },
    {
      prompt: 'Welcher zentrale **Vorteil** entsteht in der 3D-Animation, wenn man nur Keyframes erstellt und alle Zwischenbilder interpoliert (Folie Interpolation S. 9–10)?',
      expected: 'fps',
      options: [
        { id: 'fps', label: 'Die Animation wird Framerate-unabhängig (adaptive Framerate möglich) und spart Speicher/Aufwand.' },
        { id: 'no-round', label: 'Es können niemals Rundungsprobleme auftreten.' },
        { id: 'always-key', label: 'Jeder Keyframe wird garantiert immer angezeigt, egal wie hoch die Abspielgeschwindigkeit ist.' },
      ],
      sol: '\\text{Framerate-unabhängig (adaptive Framerate)}',
      expl: 'Keyframe-Interpolation macht Animationen Framerate-unabhängig! Achtung: Zu hohe Geschwindigkeit kann jedoch dazu führen, dass Keyframes übersprungen werden (S. 10).',
    },
    {
      prompt: 'Was beschreibt der Begriff **Spline** (Interpolation S. 19–20)?',
      expected: 'spline',
      options: [
        { id: 'spline', label: 'Stückweise Polynome zwischen diskreten Stützstellen (harmonische Biegelinie / Straklatte)' },
        { id: 'single', label: 'Immer eine einzige Gerade durch alle Messpunkte' },
        { id: 'pixel', label: 'Ein reines Verfahren zum Verkleinern von Rasterbildern ohne Polynome' },
      ],
      sol: '\\text{Stückweise Polynome zwischen Stützstellen (Straklatte)}',
      expl: 'Spline kommt von der Straklatte aus dem Schiffsbau: Die Abschnitte zwischen den Stützstellen werden stückweise durch glatt verbundene Polynome interpoliert.',
    },
  ];
  const item = rng.pick(bank);

  return {
    id: nextTaskId('m5-concept'),
    generatorId: 'm5-concepts',
    moduleId: 'm5',
    topicLabel: 'Bildartefakte, Splines & Animation',
    prompt: item.prompt,
    checkpoints: [
      {
        id: 'mc',
        label: 'Wähle die richtige Antwort',
        kind: 'choice',
        expected: item.expected,
        options: item.options,
        solutionLatex: item.sol,
        points: 1,
      },
    ],
    hints: [
      'Denke an den Vergleich Nearest-Neighbour (Treppen) vs. Bilinear (weich/Blurring) vs. Bikubisch (scharf, aber leichtes Überschwingen/Edge Halo).',
      'Prüfe gezielt die Vor- und Nachteile auf den Folien Interpolation S. 7, 10 und 20.',
      item.expl,
    ],
    fullSolutionSteps: [item.expl],
  };
}

export const M5_GENERATOR_MAP: Record<string, (rng?: Rng) => GeneratedTask> = {
  'm5-linear-1d': genM5Linear1D,
  'm5-bilinear-2d': genM5Bilinear2D,
  'm5-concepts': genM5Concepts,
};
