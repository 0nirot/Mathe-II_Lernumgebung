import type { SkillStatRow } from '../store/db';
import type { SrsState } from '../core/srs';
import type { ModuleId, SrsCardDefinition } from '../types/learning';

export const STATIC_SRS_CARDS: SrsCardDefinition[] = [
  // =========================================================================
  // KATEGORIE A: ENTSCHEIDUNGS-KARTEN (Formel- & Kriterienwahl)
  // =========================================================================
  {
    id: 'dec-m1-dot-vs-cross',
    category: 'decision',
    moduleId: 'm1',
    question: 'Du hast zwei 3D-Vektoren $\\vec{a}, \\vec{b}$. Wann brauchst du das **Skalarprodukt** $\\vec{a}\\cdot\\vec{b}$, wann das **Kreuzprodukt** $\\vec{a}\\times\\vec{b}$?',
    answer: '**Skalarprodukt** für Winkel, Orthogonalität ($=0$) und Projektionen. **Kreuzprodukt** für einen Normalenvektor $\\perp$ auf beide, Flächeninhalte ($|\\vec{a}\\times\\vec{b}|$) und Abstand Punkt–Gerade.',
    explanation: 'Ergebnis-Check: Skalarprodukt liefert eine **Zahl** (Skalar); Kreuzprodukt liefert einen **3D-Vektor** (und existiert nur im $\\mathbb{R}^3$!).',
  },
  {
    id: 'dec-m1-area-triangle',
    category: 'decision',
    moduleId: 'm1',
    question: 'Gesucht ist der Flächeninhalt eines **Dreiecks** $ABC$ (nicht Parallelogramm!). Welche Formel wählst du?',
    answer: '$A_{\\triangle} = \\frac{1}{2} |\\overrightarrow{AB} \\times \\overrightarrow{AC}|$',
    explanation: 'Stolperfalle: $|\\overrightarrow{AB} \\times \\overrightarrow{AC}|$ ist das volle Parallelogramm – für das Dreieck immer den Faktor $\\frac{1}{2}$ davorsetzen! Beide Kanten müssen am selben Eckpunkt starten.',
  },
  {
    id: 'dec-m2-lgs-cases',
    category: 'decision',
    moduleId: 'm2',
    question: 'Nach dem Gauß-Algorithmus entsteht in der letzten Zeile $[0\\; 0\\; 0 \\mid b]$. Wie liest du das **Lösungsverhalten** ab?',
    answer: '$b \\neq 0 \\Rightarrow$ **keine Lösung** (Widerspruch $0=b$). $b = 0 \\Rightarrow$ **unendlich viele Lösungen** (eine freie Variable). Keine Nullzeile $\\Rightarrow$ **genau eine Lösung**.',
    explanation: 'Bei einem homogenen LGS ($A\\vec{x}=\\vec{0}$) gibt es niemals "keine Lösung", denn $\\vec{x}=\\vec{0}$ löst immer! Dort gilt: $\\det(A)\\neq 0 \\Rightarrow$ nur triviale Lösung.',
  },
  {
    id: 'dec-m2-sarrus-vs-laplace',
    category: 'decision',
    moduleId: 'm2',
    question: 'Du sollst eine **4×4-Determinante** berechnen. Darfst du die Regel von Sarrus verwenden?',
    answer: '**NEIN!** Sarrus gilt **ausschließlich für 3×3-Determinanten**. Bei 4×4 (oder größer) entwickelst du nach **Laplace** entlang der Zeile/Spalte mit den meisten Nullen (oder machst vorher per Gauß Nullen).',
    explanation: 'Das Anwenden von Sarrus auf 4×4-Matrizen ist einer der häufigsten Klausurfehler überhaupt.',
  },
  {
    id: 'dec-m2-inverse-method',
    category: 'decision',
    moduleId: 'm2',
    question: 'Wann nimmst du für $A^{-1}$ die **Kurzformel** und wann **Gauß-Jordan** $[A \\mid E] \\to [E \\mid A^{-1}]$?',
    answer: 'Bei **2×2**: immer Kurzformel $\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$. Ab **3×3**: Gauß-Jordan (oder Transponieren bei reinen Drehmatrizen: $R^{-1} = R^T$!).',
    explanation: 'Prüfe vorher kurz, ob $A$ eine orthogonale Drehmatrix ist – dann sparst du dir den kompletten Gauß-Jordan!',
  },
  {
    id: 'dec-m3-distance-choice',
    category: 'decision',
    moduleId: 'm3',
    question: 'Drei Abstandsaufgaben im $\\mathbb{R}^3$: (1) Punkt–Ebene, (2) Punkt–Gerade, (3) windschiefe Geraden. Welche Formel gehört wohin?',
    answer: '(1) **Punkt–Ebene:** Hesse-Normalform $d = \\frac{|(\\vec{p}-\\vec{p}_0)\\cdot\\vec{n}|}{|\\vec{n}|}$. (2) **Punkt–Gerade:** $d = \\frac{|(\\vec{p}-\\vec{p}_0)\\times\\vec{u}|}{|\\vec{u}|}$. (3) **Windschief:** $d = \\frac{|(\\vec{q}_0-\\vec{p}_0)\\cdot(\\vec{u}\\times\\vec{v})|}{|\\vec{u}\\times\\vec{v}|}$.',
    explanation: 'Merke die Struktur: Immer Verbindungsvektor der Stützpunkte, dann Projektion auf die richtige Senkrechte (oder Parallelogramm-Höhe bei Punkt–Gerade).',
  },
  {
    id: 'dec-m3-angle-sine-cosine',
    category: 'decision',
    moduleId: 'm3',
    question: 'Wann steht in der Winkelformel im $\\mathbb{R}^3$ ein **$\\cos\\alpha$** und wann ein **$\\sin\\alpha$**?',
    answer: '**$\\cos\\alpha$** bei Gerade–Gerade ($\\vec{u},\\vec{v}$) und Ebene–Ebene ($\\vec{n}_1,\\vec{n}_2$). **$\\sin\\alpha$** nur bei **Gerade–Ebene** ($\\vec{u}$ gegen $\\vec{n}$)!',
    explanation: 'Weil $\\vec{n}$ senkrecht auf der Ebene steht, misst der Cosinus den Komplementärwinkel $90^\\circ - \\alpha$, und $\\cos(90^\\circ - \\alpha) = \\sin\\alpha$. Betragsstriche im Zähler nicht vergessen!',
  },
  {
    id: 'dec-m4-linear-vs-affine',
    category: 'decision',
    moduleId: 'm4',
    question: 'Warum braucht eine **Translation (Verschiebung)** in 2D eine **3×3-Matrix** (homogene Koordinaten), eine Drehung um den Ursprung aber nur 2×2?',
    answer: 'Eine lineare 2×2-Abbildung lässt den Ursprung immer fest ($A\\vec{0}=\\vec{0}$). Eine Translation verschiebt den Ursprung und ist daher **affin, nicht linear** – erst durch Anhängen von $w=1$ wird sie zur Matrixmultiplikation.',
    explanation: 'Durch homogene Koordinaten lassen sich Translation, Skalierung, Scherung und Rotation einheitlich zu einer einzigen Gesamtmatrix multiplizieren.',
  },
  {
    id: 'dec-m4-chain-order',
    category: 'decision',
    moduleId: 'm4',
    question: 'Ein Objekt soll **zuerst** um $T_1$ verschoben und **danach** mit $T_2$ gedreht werden (Spaltenvektor-Konvention $\\vec{x}\' = M\\vec{x}$). Wie lautet die Gesamtmatrix $M$?',
    answer: '$M = T_2 \\cdot T_1$ — **von rechts nach links!** Die zuerst ausgeführte Transformation steht direkt am Vektor $\\vec{x}$ (ganz rechts).',
    explanation: 'Bei Drehung um ein Zentrum $Z$: (1) $-Z$ verschieben, (2) drehen $R$, (3) $+Z$ zurück $\\Rightarrow M = T(+Z) \\cdot R \\cdot T(-Z)$.',
  },
  {
    id: 'dec-m5-interp-methods',
    category: 'decision',
    moduleId: 'm5',
    question: 'Bildvergrößerung: Wie unterscheiden sich **Nearest-Neighbor**, **Bilinear** und **Bikubisch** visuell und rechnerisch?',
    answer: '**Nearest-Neighbor:** 1 Nachbar, sehr schnell, aber Block-Artefakte/Treppchen. **Bilinear:** 4 Nachbarn ($2\\times 2$), weich ohne harte Stufen, leicht unscharf. **Bikubisch:** 16 Nachbarn ($4\\times 4$), schärfer/glatter, aber hoher Rechenaufwand & leichtes Ringing.',
    explanation: 'Für die Klausur von Hand: 1D linear & 2D bilinear sicher rechnen können; Polynom-, Spline- und bikubische Interpolation konzeptuell einordnen.',
  },

  // =========================================================================
  // KATEGORIE B: KOPFRECHEN-REFLEXE (Exakte Werte, Vorzeichen, Standardgriffe)
  // =========================================================================
  {
    id: 'ref-m0-trig-table',
    category: 'reflex',
    moduleId: 'm0',
    question: 'Nenne aus dem Kopf $\\sin$ und $\\cos$ für $0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$!',
    answer: '$\\sin$: $\\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2}$ (= $0, \\frac{1}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, 1$). $\\cos$ läuft genau **rückwärts**: $1, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{1}{2}, 0$.',
    explanation: 'Die Finger-/Wurzel-Eselsbrücke $\\frac{\\sqrt{0,1,2,3,4}}{2}$ spart im Kopf jede Unsicherheit!',
  },
  {
    id: 'ref-m0-deg-rad',
    category: 'reflex',
    moduleId: 'm0',
    question: 'Blitz-Umrechnung: Was sind $30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ, 120^\\circ, 180^\\circ$ im **Bogenmaß**?',
    answer: '$30^\\circ = \\frac{\\pi}{6}$, $45^\\circ = \\frac{\\pi}{4}$, $60^\\circ = \\frac{\\pi}{3}$, $90^\\circ = \\frac{\\pi}{2}$, $120^\\circ = \\frac{2\\pi}{3}$, $180^\\circ = \\pi$.',
    explanation: 'Merkregel: $180^\\circ = \\pi$, also einfach durch $6, 4, 3, 2$ teilen!',
  },
  {
    id: 'ref-m1-pyth-triples',
    category: 'reflex',
    moduleId: 'm1',
    question: 'Welche **pythagoreischen Tripel & 3D-Quadrupel** liefern im Kopf glatte Vektorbeträge?',
    answer: '2D: $(3,4,5)$, $(5,12,13)$, $(8,15,17)$. 3D: $(1,2,2)\\to 3$, $(2,3,6)\\to 7$, $(1,4,8)\\to 9$, $(2,6,9)\\to 11$.',
    explanation: 'Wenn du z. B. $|(2,-3,6)|$ siehst, erkennst du sofort $4+9+36=49 \\Rightarrow |\\vec{v}|=7$.',
  },
  {
    id: 'ref-m2-laplace-signs',
    category: 'reflex',
    moduleId: 'm2',
    question: 'Wie lautet das **Schachbrett-Vorzeichen** $(-1)^{i+k}$ bei Laplace für Position $(1,2)$, $(2,3)$ und $(3,1)$?',
    answer: '$(1,2) \\to (-1)^3 = -$ · $(2,3) \\to (-1)^5 = -$ · $(3,1) \\to (-1)^4 = +$.',
    explanation: 'Oben links $(1,1)$ ist immer $+$, dann bei jedem Schritt nach rechts oder unten wechselt das Vorzeichen.',
  },
  {
    id: 'ref-m2-det-2x2-inv',
    category: 'reflex',
    moduleId: 'm2',
    question: 'Wie lautet die **2×2-Inversenformel** für $A = \\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$?',
    answer: '$A^{-1} = \\frac{1}{ad-bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$ (existiert nur für $ad - bc \\neq 0$).',
    explanation: 'Hauptdiagonale **tauschen**, Nebendiagonale **Vorzeichen umdrehen**, durch $\\det(A)$ teilen!',
  },
  {
    id: 'ref-m4-ry-sign-trap',
    category: 'reflex',
    moduleId: 'm4',
    question: 'Berühmte Klausurfalle in 3D: Wo steht das **$-\\sin\\alpha$** in den 3D-Rotationsmatrizen $T_{Rx}, T_{Ry}, T_{Rz}$?',
    answer: 'Bei $T_{Rx}$ und $T_{Rz}$ steht $-\\sin\\alpha$ **oben rechts** (über der Diagonalen). Bei **$T_{Ry}$** steht $-\\sin\\alpha$ **unten links** (unter der Diagonalen, Position $(3,1)$)!',
    explanation: 'Grund ist die zyklische Rechte-Hand-Reihenfolge $(x\\to y\\to z\\to x)$: bei der $y$-Achse dreht $+z$ in Richtung $+x$.',
  },
  {
    id: 'ref-m4-rot-2d',
    category: 'reflex',
    moduleId: 'm4',
    question: 'Wie lautet die 2D-Drehmatrix $R(\\alpha)$ gegen den Uhrzeigersinn — und speziell für $+90^\\circ$?',
    answer: '$R(\\alpha) = \\begin{pmatrix} \\cos\\alpha & -\\sin\\alpha \\\\ \\sin\\alpha & \\cos\\alpha \\end{pmatrix}$. Für $+90^\\circ$: $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$, also $(x,y) \\mapsto (-y, x)$.',
    explanation: 'Schnellcheck: Der Einheitsvektor $(1,0)^T$ landet nach $+90^\\circ$ auf $(0,1)^T$ (= erste Spalte von $R$!).',
  },
  {
    id: 'ref-m5-lerp-formula',
    category: 'reflex',
    moduleId: 'm5',
    question: 'Wie lautet die **lineare Interpolationsformel** zwischen $(x_0, y_0)$ und $(x_1, y_1)$ mit normiertem $t = \\frac{x-x_0}{x_1-x_0}$?',
    answer: '$y = (1 - t)\\cdot y_0 + t\\cdot y_1 = y_0 + t\\cdot (y_1 - y_0)$.',
    explanation: 'Wichtig für den Check: Das kleinere Gewicht gehört zum **weiter entfernten** Punkt! Bei $t = 0{,}25$ wiegt $y_0$ also $0{,}75$ und $y_1$ nur $0{,}25$.',
  },
];

const GENERATOR_LABELS: Record<string, { moduleId: ModuleId; label: string }> = {
  'm0-arithmetic': { moduleId: 'm0', label: 'Vorzeichen & Klammern' },
  'm0-fractions': { moduleId: 'm0', label: 'Bruchrechnung' },
  'm0-roots': { moduleId: 'm0', label: 'Wurzeln vereinfachen' },
  'm0-equations': { moduleId: 'm0', label: 'Gleichungen umstellen' },
  'm0-pythagoras': { moduleId: 'm0', label: 'Pythagoras & Abstand' },
  'm0-line2d': { moduleId: 'm0', label: '2D-Gerade aus 2 Punkten' },
  'm0-deg-rad': { moduleId: 'm0', label: 'Grad ↔ Bogenmaß' },
  'm0-exact-trig': { moduleId: 'm0', label: 'Exakte sin/cos-Werte' },
  'm1-vec-ops': { moduleId: 'm1', label: 'Vektoraddition & Skalarmultiplikation' },
  'm1-connect-norm': { moduleId: 'm1', label: 'Verbindungsvektor & Betrag' },
  'm1-dot-angle': { moduleId: 'm1', label: 'Skalarprodukt & Winkel' },
  'm1-projection': { moduleId: 'm1', label: 'Vektorprojektion' },
  'm1-cross-area': { moduleId: 'm1', label: 'Kreuzprodukt & Fläche' },
  'm1-find-mistake': { moduleId: 'm1', label: 'Fehler finden (Vektoren)' },
  'm2-gauss-lgs': { moduleId: 'm2', label: 'Gauß-Algorithmus (3×3 LGS)' },
  'm2-lgs-behavior': { moduleId: 'm2', label: 'LGS-Lösungsverhalten' },
  'm2-matrix-ops': { moduleId: 'm2', label: 'Matrix-Addition & Transponieren' },
  'm2-matrix-mul': { moduleId: 'm2', label: 'Matrixmultiplikation (Falk)' },
  'm2-det-2x2-inv': { moduleId: 'm2', label: '2×2-Determinante & Inverse' },
  'm2-det-3x3-sarrus': { moduleId: 'm2', label: '3×3-Determinante (Sarrus)' },
  'm2-det-4x4-laplace': { moduleId: 'm2', label: '4×4-Determinante (Laplace)' },
  'm2-gauss-jordan-3x3': { moduleId: 'm2', label: '3×3-Inverse (Gauß-Jordan)' },
  'm2-find-mistake': { moduleId: 'm2', label: 'Fehler finden (Matrizen)' },
  'm3-line-2pts': { moduleId: 'm3', label: 'Gerade aus 2 Punkten (3D)' },
  'm3-dist-point-line': { moduleId: 'm3', label: 'Abstand Punkt–Gerade' },
  'm3-lines-intersect': { moduleId: 'm3', label: 'Lage & Schnitt zweier Geraden' },
  'm3-dist-skew-lines': { moduleId: 'm3', label: 'Abstand windschiefer Geraden' },
  'm3-dist-point-plane': { moduleId: 'm3', label: 'Abstand Punkt–Ebene (Hesse)' },
  'm3-line-plane-intersect': { moduleId: 'm3', label: 'Schnitt Gerade–Ebene' },
  'm3-plane-plane-line': { moduleId: 'm3', label: 'Schnittgerade zweier Ebenen' },
  'm4-linear-vs-affine': { moduleId: 'm4', label: 'Linear vs. Affin' },
  'm4-2d-basic-transform': { moduleId: 'm4', label: '2D-Homogene Grundmatrix' },
  'm4-2d-rotate-point': { moduleId: 'm4', label: '2D-Drehung (Standardwinkel)' },
  'm4-2d-chain': { moduleId: 'm4', label: '2D-Verkettung / Drehung um Punkt' },
  'm4-3d-transform': { moduleId: 'm4', label: '3D-Rotation & Transformation' },
  'm4-3d-axis-concept': { moduleId: 'm4', label: '3D-Drehung um freie Achse' },
  'm5-linear-1d': { moduleId: 'm5', label: '1D Lineare Interpolation' },
  'm5-bilinear-2d': { moduleId: 'm5', label: '2D Bilineare Interpolation' },
  'm5-concepts': { moduleId: 'm5', label: 'Interpolations-Verfahren' },
};

export function getGeneratorMeta(generatorId: string): { moduleId: ModuleId; label: string } {
  return GENERATOR_LABELS[generatorId] ?? { moduleId: 'm1', label: generatorId };
}

/**
 * Builds dynamic weakness cards from:
 * 1) Any generator in skillStats with attempts > correct (accuracy < 80% or recent errors)
 * 2) Any explicit weakness cards enqueued from the Exam Simulator in srsQueue
 */
export function buildWeaknessCards(
  skillStats: Record<string, SkillStatRow>,
  srsQueue: Record<string, SrsState>
): SrsCardDefinition[] {
  const genIds = new Set<string>();

  for (const stat of Object.values(skillStats)) {
    const errors = stat.attempts - stat.correct;
    const acc = stat.attempts > 0 ? stat.correct / stat.attempts : 1;
    if (errors > 0 && acc < 0.85) {
      genIds.add(stat.generatorId);
    }
  }

  for (const row of Object.values(srsQueue)) {
    if (row.cardId.startsWith('weak:') && row.generatorId) {
      genIds.add(row.generatorId);
    }
  }

  return Array.from(genIds).map((gid) => {
    const meta = getGeneratorMeta(gid);
    const stat = skillStats[gid];
    const statsHint = stat
      ? `Bisherige Quote: ${stat.correct}/${stat.attempts} richtig.`
      : 'Aus einer Klausur-Simulation übernommen.';
    return {
      id: `weak:${gid}`,
      category: 'weakness',
      moduleId: meta.moduleId,
      question: `Schwächen-Training: **${meta.label}**`,
      answer: 'Löse die frisch generierte Übungsaufgabe unten ohne Taschenrechner und bewerte danach, wie sicher dir der Rechenweg fiel.',
      explanation: statsHint,
      generatorId: gid,
    };
  });
}
