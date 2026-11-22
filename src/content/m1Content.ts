import type { LessonDefinition } from '../types/learning';

export const M1_LESSONS: LessonDefinition[] = [
  {
    id: 'm1-1-vektoren-grundlagen',
    moduleId: 'm1',
    order: 1,
    title: 'Vektoren, Addition, Betrag & Einheitsvektor',
    subtitle: 'Pfeile im Raum verstehen, rechnen und auf Länge 1 normieren',
    slideRef: 'Mathe II: Vektoralgebra S. 4–21',
    estimatedMinutes: 18,
    intuition: {
      hook: 'Eine Zahl allein (z. B. „5 km/h“ = Skalar) sagt dir noch nicht, wohin du fährst. Erst Zahl + Richtung zusammen ergeben einen Vektor.',
      analogy:
        'Stell dir einen Vektor als Wegbeschreibung vor: „Gehe 3 Schritte nach rechts und 4 nach oben.“ Wo du startest, ist dem Vektor egal – zwei gleich lange, parallele Pfeile sind derselbe Vektor! Vektoraddition bedeutet schlicht: zwei Wegbeschreibungen hintereinander ablaufen.',
    },
    visualization: {
      type: 'vector-2d-ops',
      discoveryPrompt:
        'Ziehe die Spitzen von $\\vec{a}$ und $\\vec{b}$ im Koordinatensystem. Schalte zwischen Addition, Subtraktion und Skalarmultiplikation um: Was passiert mit dem Pfeil, wenn der Skalar $\\lambda$ negativ wird?',
    },
    explanation: {
      paragraphs: [
        'Ein **Vektor** $\\vec{a}$ wird als Spaltenvektor aus seinen Koordinaten (Komponenten) geschrieben. Es gibt drei wichtige Spezial-Vektoren: den **Nullvektor** $\\vec{0}$ (Betrag $0$), den **Ortsvektor** $\\vec{r}(P) = \\overrightarrow{OP}$ (zeigt vom Ursprung $O$ zum Punkt $P$) und den **Einheitsvektor** $\\vec{e}_a$ (hat genau die Länge $1$).',
        '**Addition, Subtraktion und Skalarmultiplikation** funktionieren herrlich einfach **komponentenweise** (Zeile für Zeile). Ein negativer Skalar $\\lambda < 0$ kehrt die Richtung um (anti-parallel) und streckt die Länge um $|\\lambda|$.',
        'Den **Verbindungsvektor** zwischen zwei Punkten $P_1$ und $P_2$ berechnest du immer nach der Merkregel **„Spitze minus Fuß“**: $\\overrightarrow{P_1 P_2} = P_2 - P_1$. Seine Länge (**Betrag** $|\\vec{a}|$) liefert der 3D-Pythagoras. Teilst du $\\vec{a}$ durch seine Länge $|\\vec{a}|$, erhältst du den **Einheitsvektor** (Normieren).',
      ],
      keyFormulas: [
        {
          label: 'Komponentenweise Rechnen',
          latex: '\\vec{a} \\pm \\vec{b} = \\begin{pmatrix} a_x \\pm b_x \\\\ a_y \\pm b_y \\\\ a_z \\pm b_z \\end{pmatrix}, \\qquad \\lambda\\vec{a} = \\begin{pmatrix} \\lambda a_x \\\\ \\lambda a_y \\\\ \\lambda a_z \\end{pmatrix}',
        },
        {
          label: 'Verbindungsvektor & Betrag',
          latex: '\\overrightarrow{P_1 P_2} = \\begin{pmatrix} x_2 - x_1 \\\\ y_2 - y_1 \\\\ z_2 - z_1 \\end{pmatrix}, \\qquad |\\vec{a}| = \\sqrt{a_x^2 + a_y^2 + a_z^2}',
        },
        {
          label: 'Einheitsvektor (Normieren)',
          latex: '\\vec{e}_a = \\frac{\\vec{a}}{|\\vec{a}|} \\qquad (|\\vec{e}_a| = 1)',
        },
      ],
      symbolTooltips: [
        { symbol: '|a⃗|', latex: '|\\vec{a}|', meaning: 'Betrag = geometrische Länge des Pfeils (immer ≥ 0)' },
        { symbol: 'e⃗ₐ', latex: '\\vec{e}_a', meaning: 'Einheitsvektor: zeigt in exakt dieselbe Richtung wie a⃗, hat aber Länge 1' },
        { symbol: 'λ', latex: '\\lambda', meaning: 'Skalar (reelle Zahl), mit dem ein Vektor gestreckt oder umgedreht wird' },
      ],
      slideNote:
        'Hinweis zu Folie S. 15–16: Auf den Originalfolien steht zwischen den beiden Spaltenvektoren versehentlich ein „=“ statt „+“ bzw. „−“. Gemeint ist natürlich die Summe bzw. Differenz der beiden Spaltenvektoren.',
    },
    example: {
      title: 'Verbindungsvektor, Betrag & Einheitsvektor berechnen',
      problem:
        'Gegeben sind $P_1(1, -1, 2)$ und $P_2(2, 1, 4)$. Bestimme $\\vec{a} = \\overrightarrow{P_1 P_2}$, den Betrag $|\\vec{a}|$ und den Einheitsvektor $\\vec{e}_a$.',
      steps: [
        {
          label: 'Schritt 1: Spitze minus Fuß',
          content: '$\\vec{a} = \\begin{pmatrix} 2 - 1 \\\\ 1 - (-1) \\\\ 4 - 2 \\end{pmatrix} = \\begin{pmatrix} 1 \\\\ 2 \\\\ 2 \\end{pmatrix}$.',
          trick: 'Aufpassen beim doppelten Minus in der zweiten Zeile: $1 - (-1) = 1 + 1 = 2$!',
        },
        {
          label: 'Schritt 2: Betrag (3D-Pythagoras)',
          content: '$|\\vec{a}| = \\sqrt{1^2 + 2^2 + 2^2} = \\sqrt{1 + 4 + 4} = \\sqrt{9} = 3$.',
        },
        {
          label: 'Schritt 3: Durch den Betrag teilen',
          content: '$\\vec{e}_a = \\frac{1}{3}\\begin{pmatrix} 1 \\\\ 2 \\\\ 2 \\end{pmatrix} = \\begin{pmatrix} 1/3 \\\\ 2/3 \\\\ 2/3 \\end{pmatrix}$.',
          trick: 'Kurze Probe: $(1/3)^2 + (2/3)^2 + (2/3)^2 = 9/9 = 1$ ✓.',
        },
      ],
      finalResult: '$\\vec{a} = (1, 2, 2)^T$, $|\\vec{a}| = 3$, $\\vec{e}_a = (\\frac{1}{3}, \\frac{2}{3}, \\frac{2}{3})^T$',
    },
    generatorIds: ['m1-vec-ops', 'm1-connect-norm'],
    summaryBullets: [
      'Addition/Subtraktion & Skalarmultiplikation erfolgen immer zeilenweise.',
      'Verbindungsvektor = Spitze minus Fuß ($P_2 - P_1$).',
      'Normieren = Vektor durch seinen eigenen Betrag teilen ($\\vec{e}_a = \\vec{a}/|\\vec{a}|$).',
    ],
    formulaSheetIds: ['fs-m1-connect-unit'],
  },
  {
    id: 'm1-2-skalarprodukt-winkel',
    moduleId: 'm1',
    order: 2,
    title: 'Skalarprodukt, Orthogonalität & Winkel',
    subtitle: 'Wie stark zeigen zwei Vektoren in dieselbe Richtung?',
    slideRef: 'Mathe II: Vektoralgebra S. 22–28',
    estimatedMinutes: 18,
    intuition: {
      hook: 'Das Skalarprodukt zweier Vektoren ergibt keinen neuen Pfeil, sondern eine **einzige Zahl** – ein direktes Maß dafür, ob zwei Richtungen zusammenarbeiten, senkrecht aufeinander stehen oder gegeneinander arbeiten.',
      analogy:
        'Denke an Wind beim Fahrradfahren: Rückenwind = positives Skalarprodukt (Winkel $< 90^\\circ$). Seitenwind exakt von der Seite ($90^\\circ$) = Skalarprodukt **genau Null**! Gegenwind ($> 90^\\circ$) = negatives Skalarprodukt.',
    },
    visualization: {
      type: 'vector-2d-dot',
      discoveryPrompt:
        'Ziehe den grünen Vektor $\\vec{b}$ im Kreis um den Ursprung: Finde mindestens zwei Positionen, an denen das Skalarprodukt exakt $0$ wird! Welcher Winkel leuchtet dabei auf?',
    },
    explanation: {
      paragraphs: [
        'Das **Skalarprodukt** $\\vec{a}\\cdot\\vec{b}$ hat zwei Gesichter – und genau das Gleichsetzen beider Seiten liefert uns die Winkelformel! **Rechnerisch** multiplizierst du die Komponenten zeilenweise und addierst alles: $a_x b_x + a_y b_y + a_z b_z$.',
        '**Geometrisch** gilt $\\vec{a}\\cdot\\vec{b} = |\\vec{a}|\\cdot|\\vec{b}|\\cdot\\cos\\rho$. Daraus folgt die wichtigste Prüfregel der gesamten Linearen Algebra: Zwei (von $\\vec{0}$ verschiedene) Vektoren stehen genau dann **senkrecht (orthogonal)** aufeinander, wenn **$\\vec{a}\\cdot\\vec{b} = 0$** gilt!',
        'Stellt man nach $\\cos\\rho$ um, kann man jeden Winkel zwischen zwei Vektoren berechnen. Ohne Taschenrechner kürzen sich die Wurzeln dabei immer auf einen Standardwert ($0, \\pm\\frac{1}{2}, \\pm\\frac{\\sqrt{2}}{2}, \\pm\\frac{\\sqrt{3}}{2}, \\pm 1$).',
      ],
      keyFormulas: [
        {
          label: 'Skalarprodukt (Rechnung & Geometrie)',
          latex: '\\vec{a}\\cdot\\vec{b} = a_x b_x + a_y b_y + a_z b_z = |\\vec{a}|\\cdot|\\vec{b}|\\cdot\\cos\\rho',
        },
        { label: 'Orthogonalitäts-Test', latex: '\\vec{a} \\perp \\vec{b} \\iff \\vec{a}\\cdot\\vec{b} = 0' },
        {
          label: 'Winkel zwischen zwei Vektoren',
          latex: '\\rho = \\arccos\\left(\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\cdot|\\vec{b}|}\\right)',
        },
      ],
      symbolTooltips: [
        { symbol: '·', latex: '\\vec{a}\\cdot\\vec{b}', meaning: 'Skalarprodukt (Punktprodukt): Ergebnis ist eine reelle Zahl!' },
        { symbol: 'ρ', latex: '\\rho', meaning: 'Griechisches „Rho“ – eingeschlossener Winkel (0° bis 180°)' },
        { symbol: '⊥', latex: '\\perp', meaning: 'Orthogonal = rechtwinklig (90°)' },
      ],
    },
    example: {
      title: 'Skalarprodukt und exakten Winkel ohne TR berechnen',
      problem:
        'Berechne $\\vec{a}\\cdot\\vec{b}$ und den eingeschlossenen Winkel $\\rho$ für $\\vec{a} = \\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix}$ und $\\vec{b} = \\begin{pmatrix}1\\\\0\\\\1\\end{pmatrix}$.',
      steps: [
        {
          label: 'Schritt 1: Skalarprodukt berechnen',
          content: '$\\vec{a}\\cdot\\vec{b} = 1\\cdot 1 + 1\\cdot 0 + 0\\cdot 1 = 1$.',
        },
        {
          label: 'Schritt 2: Beide Beträge bestimmen',
          content: '$|\\vec{a}| = \\sqrt{1^2+1^2+0^2} = \\sqrt{2}$ und $|\\vec{b}| = \\sqrt{1^2+0^2+1^2} = \\sqrt{2}$.',
        },
        {
          label: 'Schritt 3: Einsetzen & Wurzelprodukt kürzen',
          content: '$\\cos\\rho = \\frac{1}{\\sqrt{2}\\cdot\\sqrt{2}} = \\frac{1}{2} \\Rightarrow \\rho = \\arccos\\left(\\frac{1}{2}\\right) = 60^\\circ$.',
          trick: 'Lass Wurzeln wie $\\sqrt{2}$ stehen – im Produkt $\\sqrt{2}\\cdot\\sqrt{2}$ verschwindet die Wurzel sofort!',
        },
      ],
      finalResult: '$\\vec{a}\\cdot\\vec{b} = 1$ und $\\rho = 60^\\circ$',
    },
    generatorIds: ['m1-dot-angle'],
    summaryBullets: [
      'Skalarprodukt = komponentenweise multiplizieren und aufsummieren → Ergebnis ist eine Zahl.',
      '$\\vec{a}\\cdot\\vec{b} = 0 \\iff$ rechter Winkel ($90^\\circ$).',
      'Ist das Skalarprodukt negativ, liegt der Winkel zwischen $90^\\circ$ und $180^\\circ$ (stumpfer Winkel).',
    ],
    formulaSheetIds: ['fs-m1-dot-angle'],
  },
  {
    id: 'm1-3-kreuzprodukt',
    moduleId: 'm1',
    order: 3,
    title: 'Kreuzprodukt (Vektorprodukt) & Parallelogrammfläche',
    subtitle: 'Einen senkrechten Vektor im 3D-Raum konstruieren',
    slideRef: 'Mathe II: Vektoralgebra S. 28–35',
    estimatedMinutes: 20,
    intuition: {
      hook: 'Im 3D-Raum brauchen wir ständig einen Vektor, der auf einer Fläche (z. B. einem 3D-Dreieck oder einer Ebene) exakt **senkrecht** steht. Genau diesen Pfeil liefert das Kreuzprodukt.',
      analogy:
        'Lege zwei Stifte $\\vec{a}$ und $\\vec{b}$ auf den Tisch: Das Kreuzprodukt $\\vec{a}\\times\\vec{b}$ schießt wie ein Fahnenmast senkrecht aus dem Tisch heraus. Zeigt dein rechter Daumen entlang $\\vec{a}$ und der Zeigefinger entlang $\\vec{b}$, zeigt dein Mittelfinger exakt in Richtung $\\vec{a}\\times\\vec{b}$ (Rechte-Hand-Regel)!',
    },
    visualization: {
      type: 'cross-product-3d',
      discoveryPrompt:
        'Drehe die 3D-Szene mit der Maus! Klicke dann auf „Reihenfolge tauschen ($\\vec{b}\\times\\vec{a}$)“ und stelle die Vektoren einmal parallel ein: Was passiert mit der Richtung von $\\vec{c}$ und der Fläche des Parallelogramms?',
    },
    explanation: {
      paragraphs: [
        'Anders als das Skalarprodukt ist das **Kreuzprodukt** $\\vec{c} = \\vec{a}\\times\\vec{b}$ wieder ein **3D-Vektor** (es existiert nur in 3D!). Es besitzt drei goldene Eigenschaften: (1) $\\vec{c}$ steht senkrecht auf $\\vec{a}$ **und** auf $\\vec{b}$, (2) seine Länge $|\\vec{c}| = |\\vec{a}||\\vec{b}|\\sin\\rho$ ist exakt der **Flächeninhalt des aufgespannten Parallelogramms**, und (3) $(\\vec{a}, \\vec{b}, \\vec{c})$ bilden ein **rechtshändiges System**.',
        'Wichtige Rechenregeln: Es gilt das Distributivgesetz, aber **kein** Kommutativgesetz – stattdessen das **Anti-Kommutativgesetz**: $\\vec{a}\\times\\vec{b} = -(\\vec{b}\\times\\vec{a})$. Vertauschen dreht den Pfeil also exakt um $180^\\circ$ um! Sind $\\vec{a}$ und $\\vec{b}$ parallel, ist die Fläche Null und damit $\\vec{a}\\times\\vec{b} = \\vec{0}$.',
        'Für die Berechnung von Hand schreibst du die Komponenten am besten zweimal untereinander, streichst die oberste und unterste Zeile und rechnest dreimal „über Kreuz“ (abwärts minus aufwärts).',
      ],
      keyFormulas: [
        {
          label: 'Komponentenformel',
          latex: '\\vec{a}\\times\\vec{b} = \\begin{pmatrix} a_y b_z - a_z b_y \\\\ a_z b_x - a_x b_z \\\\ a_x b_y - a_y b_x \\end{pmatrix}',
        },
        {
          label: 'Geometrische Bedeutung',
          latex: '|\\vec{a}\\times\\vec{b}| = |\\vec{a}|\\cdot|\\vec{b}|\\cdot\\sin\\rho = A_{\\text{Parallelogramm}}',
        },
        {
          label: 'Anti-Kommutativität & Parallelität',
          latex: '\\vec{a}\\times\\vec{b} = -(\\vec{b}\\times\\vec{a}), \\qquad \\vec{a} \\parallel \\vec{b} \\iff \\vec{a}\\times\\vec{b} = \\vec{0}',
        },
      ],
      symbolTooltips: [
        { symbol: '×', latex: '\\vec{a}\\times\\vec{b}', meaning: 'Kreuzprodukt (Vektorprodukt): Ergebnis ist ein 3D-Vektor, senkrecht zu a⃗ und b⃗' },
        { symbol: 'A', latex: 'A = |\\vec{a}\\times\\vec{b}|', meaning: 'Flächeninhalt des Parallelogramms (Dreiecksfläche wäre genau die Hälfte!)' },
      ],
    },
    example: {
      title: 'Kreuzprodukt, Orthogonalitätsprobe & Fläche',
      problem:
        'Berechne $\\vec{c} = \\begin{pmatrix}2\\\\0\\\\0\\end{pmatrix} \\times \\begin{pmatrix}1\\\\3\\\\0\\end{pmatrix}$, prüfe die Orthogonalität und gib die Parallelogrammfläche an.',
      steps: [
        {
          label: 'Schritt 1: Komponenten über Kreuz berechnen',
          content:
            '$c_x = 0\\cdot 0 - 0\\cdot 3 = 0$, $c_y = 0\\cdot 1 - 2\\cdot 0 = 0$, $c_z = 2\\cdot 3 - 0\\cdot 1 = 6$. Also $\\vec{c} = (0, 0, 6)^T$.',
          trick: 'Aufpassen in Zeile 2: Erst $a_z b_x$, dann minus $a_x b_z$!',
        },
        {
          label: 'Schritt 2: Blitz-Probe per Skalarprodukt',
          content: '$\\vec{c}\\cdot\\vec{a} = 0\\cdot 2 + 0 + 0 = 0$ ✓ und $\\vec{c}\\cdot\\vec{b} = 0 + 0 + 6\\cdot 0 = 0$ ✓.',
          trick: 'Diese 5-Sekunden-Probe deckt in der Klausur fast jeden Vorzeichenfehler im Kreuzprodukt sofort auf!',
        },
        {
          label: 'Schritt 3: Flächeninhalt ablesen',
          content: '$A = |\\vec{c}| = \\sqrt{0^2 + 0^2 + 6^2} = 6$.',
        },
      ],
      finalResult: '$\\vec{c} = (0, 0, 6)^T$ und $A = 6$',
    },
    generatorIds: ['m1-cross-area', 'm1-find-mistake'],
    summaryBullets: [
      'Kreuzprodukt liefert einen 3D-Vektor, der auf beiden Ausgangsvektoren senkrecht steht.',
      'Sein Betrag ist die Parallelogrammfläche; ist das Kreuzprodukt $\\vec{0}$, sind die Vektoren parallel.',
      'Immer kurz die Probe $\\vec{c}\\cdot\\vec{a} = 0$ im Kopf rechnen – sie rettet vor dem klassischen Vorzeichenfehler in Zeile 2!',
    ],
    formulaSheetIds: ['fs-m1-cross'],
  },
  {
    id: 'm1-4-projektion',
    moduleId: 'm1',
    order: 4,
    title: 'Orthogonale Projektion eines Vektors',
    subtitle: 'Den „Schatten“ von b⃗ auf a⃗ berechnen – direkte Basis für Abstände',
    slideRef: 'Mathe II: Vektoralgebra S. 36–37',
    estimatedMinutes: 15,
    intuition: {
      hook: 'Stell dir vor, die Sonne scheint exakt senkrecht von oben auf die Richtung von $\\vec{a}$. Der Schatten, den der Vektor $\\vec{b}$ dabei auf $\\vec{a}$ wirft, ist die Projektion $\\vec{b}_a$.',
      analogy:
        'Du ziehst einen schweren Schlitten an einem schrägen Seil ($\\vec{b}$) vorwärts ($\\vec{a}$). Nur der waagerechte Schattenanteil $\\vec{b}_a$ zieht den Schlitten tatsächlich nach vorn! Genau dieselbe Idee nutzt dein Dozent später in Modul 3 für den Abstand Punkt–Ebene.',
    },
    visualization: {
      type: 'vector-2d-projection',
      discoveryPrompt:
        'Ziehe den blauen Vektor $\\vec{b}$ herum und beobachte seinen gelben Schatten $\\vec{b}_a$ auf $\\vec{a}$: Wann verschwindet der Schatten völlig? Wann zeigt der Schatten in die Gegenrichtung von $\\vec{a}$?',
    },
    explanation: {
      paragraphs: [
        'Die Projektion $\\vec{b}_a$ („Komponente von $\\vec{b}$ in Richtung $\\vec{a}$“) ist ein **Vektor**, der auf derselben Linie liegt wie $\\vec{a}$ – also ein Vielfaches von $\\vec{a}$: $\\vec{b}_a = k \\cdot \\vec{a}$.',
        'Aus der Trigonometrie im rechtwinkligen Schattendreieck folgt für die Schattenlänge $|\\vec{b}_a| = |\\vec{b}|\\cos\\alpha = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|}$. Multipliziert man diese Länge mit dem Einheitsvektor $\\vec{e}_a = \\frac{\\vec{a}}{|\\vec{a}|}$, verschwinden die Wurzeln im Nenner elegant zu $|\\vec{a}|^2$!',
        'Deshalb ist die fertige Formel perfekt taschenrechnerfrei: **$\\vec{b}_a = \\left(\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|^2}\\right)\\cdot\\vec{a}$**. Es wird gar keine Wurzel gezogen!',
      ],
      keyFormulas: [
        {
          label: 'Projektion von b⃗ auf a⃗',
          latex: '\\vec{b}_a = \\left(\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|^2}\\right) \\cdot \\vec{a} = (\\vec{e}_a \\cdot \\vec{b}) \\cdot \\vec{e}_a',
        },
      ],
      symbolTooltips: [
        { symbol: 'b⃗ₐ', latex: '\\vec{b}_a', meaning: 'Projektionsvektor: der Anteil von b⃗, der in Richtung a⃗ zeigt' },
        { symbol: '|a⃗|²', latex: '|\\vec{a}|^2', meaning: 'a_x² + a_y² + a_z² (einfach a⃗·a⃗ – ganz ohne Wurzel!)' },
      ],
    },
    example: {
      title: 'Projektion ohne Wurzelziehen berechnen',
      problem:
        'Projiziere $\\vec{b} = \\begin{pmatrix}3\\\\1\\\\2\\end{pmatrix}$ auf $\\vec{a} = \\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix}$.',
      steps: [
        {
          label: 'Schritt 1: Skalarprodukt im Zähler',
          content: '$\\vec{a}\\cdot\\vec{b} = 1\\cdot 3 + 1\\cdot 1 + 0\\cdot 2 = 4$.',
        },
        {
          label: 'Schritt 2: Betragsquadrat von a⃗ im Nenner',
          content: '$|\\vec{a}|^2 = 1^2 + 1^2 + 0^2 = 2$.',
          trick: 'Achtung Klassiker-Falle: Im Nenner steht $|\\vec{a}|^2$, NICHT $|\\vec{a}|$! Das spart dir sogar die Wurzel.',
        },
        {
          label: 'Schritt 3: Faktor mal Zielvektor a⃗',
          content: '$\\vec{b}_a = \\frac{4}{2} \\cdot \\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix} = 2 \\cdot \\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix} = \\begin{pmatrix}2\\\\2\\\\0\\end{pmatrix}$.',
        },
      ],
      finalResult: '$\\vec{b}_a = (2, 2, 0)^T$',
    },
    generatorIds: ['m1-projection', 'm1-find-mistake'],
    summaryBullets: [
      'Der Zielvektor (auf den projiziert wird) steht sowohl im Nenner als $|\\vec{a}|^2$ als auch außen als Faktor $\\vec{a}$.',
      'Kein Wurzelziehen nötig, weil $|\\vec{a}|^2 = a_x^2 + a_y^2 + a_z^2$.',
      'Ist $\\vec{a}\\cdot\\vec{b} = 0$, ist der Schatten der Nullvektor (Vektoren stehen senkrecht).',
    ],
    formulaSheetIds: ['fs-m1-projection'],
  },
];
