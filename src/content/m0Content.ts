import type { LessonDefinition } from '../types/learning';

export const M0_LESSONS: LessonDefinition[] = [
  {
    id: 'm0-1-arithmetik',
    moduleId: 'm0',
    order: 1,
    title: 'Vorzeichen, Klammern & Bruchrechnung',
    subtitle: 'Fehlerfrei im Kopf rechnen – die Basis für jedes Verfahren',
    slideRef: 'Vorwissen (für LGS, Matrizen, Interpolation)',
    estimatedMinutes: 12,
    intuition: {
      hook: '90 % aller Klausurpunkte gehen nicht an komplizierter Hochschulmathematik verloren, sondern an einem vergessenen Minuszeichen oder einem falsch addierten Bruch.',
      analogy:
        'Stell dir ein Minus vor einer Klammer wie einen „Umdreh-Schalter“ vor: Alles in der Klammer klappt sein Vorzeichen um. Und Brüche sind Kuchenstücke – man darf nur gleich große Stücke (gleicher Nenner) zusammenzählen.',
    },
    explanation: {
      paragraphs: [
        'Bei Ausdrücken wie $a - b\\cdot(c - d)$ gilt strikt **Klammer vor Punkt vor Strich**. Beim Ausmultiplizieren gilt die Vorzeichenregel: **Minus mal Minus ergibt Plus**, Plus mal Minus ergibt Minus.',
        'Für **Brüche** brauchst du in der Prüfung genau vier sichere Handgriffe: (1) **Addieren/Subtrahieren** nur mit gemeinsamem Hauptnenner, (2) **Multiplizieren** direkt Zähler mal Zähler und Nenner mal Nenner, (3) **Dividieren** durch Multiplikation mit dem Kehrwert, und (4) **Kürzen** wann immer möglich – das hält die Zahlen ohne Taschenrechner winzig!',
      ],
      keyFormulas: [
        { label: 'Vorzeichenregel', latex: '-(-a) = +a, \\qquad -(a - b) = -a + b' },
        {
          label: 'Bruchaddition',
          latex: '\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{a\\cdot d \\pm c\\cdot b}{b\\cdot d}',
        },
        {
          label: 'Bruchdivision (Kehrwert)',
          latex: '\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}',
        },
      ],
      symbolTooltips: [
        { symbol: 'a/b', latex: '\\frac{a}{b}', meaning: 'Zähler oben (wie viele Stücke), Nenner unten (wie groß ein Stück ist)' },
        { symbol: '−(…)', latex: '-(a-b)', meaning: 'Minus vor der Klammer dreht jedes Vorzeichen darin um' },
      ],
    },
    example: {
      title: 'Klammer & Bruch sauber auflösen',
      problem: 'Berechne ohne Taschenrechner: $4 - 3\\cdot(2 - 5)$ sowie $\\frac{2}{3} : \\frac{4}{9}$.',
      steps: [
        {
          label: 'Schritt 1: Klammer ausrechnen',
          content: '$2 - 5 = -3$. Jetzt steht dort $4 - 3\\cdot(-3)$.',
        },
        {
          label: 'Schritt 2: Punkt vor Strich & Minus mal Minus',
          content: '$-3 \\cdot (-3) = +9$, also $4 + 9 = 13$.',
          trick: 'Schreibe das Minus vor der 3 gedanklich direkt zur 3 dazu: (−3)·(−3) = +9.',
        },
        {
          label: 'Schritt 3: Bruchdivision über Kehrwert + vorher kürzen',
          content: '$\\frac{2}{3} : \\frac{4}{9} = \\frac{2}{3} \\cdot \\frac{9}{4} = \\frac{1}{1} \\cdot \\frac{3}{2} = \\frac{3}{2}$.',
          trick: 'Kürze über Kreuz (2 mit 4 und 3 mit 9), BEVOR du multiplizierst – so bleiben die Zahlen winzig!',
        },
      ],
      finalResult: '$13$ und $\\frac{3}{2}$',
    },
    generatorIds: ['m0-arithmetic', 'm0-fractions'],
    summaryBullets: [
      'Klammer → Punkt → Strich; Minus mal Minus = Plus.',
      'Brüche beim Addieren erst gleichnamig machen; beim Teilen mit dem Kehrwert multiplizieren.',
      'Immer erst kürzen, dann multiplizieren – das spart enorme Kopfrechenzeit.',
    ],
    formulaSheetIds: [],
  },
  {
    id: 'm0-2-gleichungen-wurzeln',
    moduleId: 'm0',
    order: 2,
    title: 'Gleichungen umstellen & Wurzeln ohne TR',
    subtitle: 'Variablen isolieren und Wurzeln wie √18 elegant zähmen',
    slideRef: 'Vorwissen (für Beträge, Winkel, Schnittpunkte)',
    estimatedMinutes: 15,
    intuition: {
      hook: 'Ohne Taschenrechner wirken Wurzeln wie $\\sqrt{18}$ oder $\\frac{6}{\\sqrt{18}}$ erstmal bedrohlich – dabei stecken fast immer einfache Quadratzahlen darin, die sich gegenseitig wegkürzen.',
      analogy:
        'Eine Gleichung ist eine Balkenwaage: Was du links tust, musst du auch rechts tun, bis dein gesuchter Buchstabe (z. B. $\\lambda$) ganz allein auf einer Seite steht. Und Quadratzahlen ($4, 9, 16, 25, \\dots$) sind deine „Ausgangstüren“ aus der Wurzel.',
    },
    explanation: {
      paragraphs: [
        'Beim **Umstellen nach $\\lambda$** gehst du in zwei Schritten vor: Zuerst alles ohne $\\lambda$ per Addition/Subtraktion auf die andere Seite bringen, danach durch den Faktor vor $\\lambda$ teilen.',
        'Beim **teilweisen Wurzelziehen** zerlegst du die Zahl unter der Wurzel in ein Produkt aus einer Quadratzahl und einem kleinen Rest (z. B. $18 = 9 \\cdot 2 \\Rightarrow \\sqrt{18} = \\sqrt{9}\\cdot\\sqrt{2} = 3\\sqrt{2}$).',
        'Steht eine Wurzel im Nenner (z. B. $\\frac{1}{\\sqrt{2}}$), machst du den **Nenner rational**, indem du oben und unten mit genau dieser Wurzel erweiterst: $\\frac{1\\cdot\\sqrt{2}}{\\sqrt{2}\\cdot\\sqrt{2}} = \\frac{\\sqrt{2}}{2}$.',
      ],
      keyFormulas: [
        { label: 'Wurzel-Produktregel', latex: '\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}' },
        { label: 'Nenner rational machen', latex: '\\frac{c}{\\sqrt{r}} = \\frac{c\\cdot\\sqrt{r}}{r}' },
        {
          label: 'Wichtigste Quadratzahlen',
          latex: '2^2=4,\\; 3^2=9,\\; 4^2=16,\\; 5^2=25,\\; 6^2=36,\\; 7^2=49,\\; 8^2=64,\\; 9^2=81,\\; 10^2=100,\\; 12^2=144',
        },
      ],
      symbolTooltips: [
        { symbol: 'λ', latex: '\\lambda', meaning: 'Griechisches „Lambda“ – Lieblingsbuchstabe deines Dozenten für Parameter und Skalare' },
        { symbol: '√a', latex: '\\sqrt{a}', meaning: 'Die nicht-negative Zahl, die mit sich selbst multipliziert a ergibt' },
      ],
    },
    example: {
      title: 'Bruch mit Wurzel im Nenner vereinfachen',
      problem: 'Vereinfache $\\frac{6}{\\sqrt{18}}$ und $\\sqrt{12} \\cdot \\sqrt{3}$ ohne Taschenrechner.',
      steps: [
        {
          label: 'Schritt 1: Quadratzahl in 18 finden',
          content: '$18 = 9 \\cdot 2 \\Rightarrow \\sqrt{18} = \\sqrt{9}\\cdot\\sqrt{2} = 3\\sqrt{2}$.',
        },
        {
          label: 'Schritt 2: Kürzen & Nenner rational machen',
          content: '$\\frac{6}{3\\sqrt{2}} = \\frac{2}{\\sqrt{2}} = \\frac{2\\sqrt{2}}{2} = \\sqrt{2}$.',
          trick: 'Kürze ganze Zahlen immer zuerst (6/3 = 2), dann wird das Rationalisieren kinderleicht.',
        },
        {
          label: 'Schritt 3: Produkt zweier Wurzeln',
          content: '$\\sqrt{12}\\cdot\\sqrt{3} = \\sqrt{12\\cdot 3} = \\sqrt{36} = 6$.',
        },
      ],
      finalResult: '$\\sqrt{2}$ und $6$',
    },
    generatorIds: ['m0-linear-equation', 'm0-roots'],
    summaryBullets: [
      'Gleichung umstellen: erst Strichrechnung (Konstanten rüber), dann Punktrechnung (durch Faktor teilen).',
      'Teilweises Wurzelziehen: größte Quadratzahl (4, 9, 16, 25, …) herausziehen.',
      'Achtung: $\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$! Die Zerlegung gilt nur bei Multiplikation.',
    ],
    formulaSheetIds: [],
  },
  {
    id: 'm0-3-koordinaten-geraden',
    moduleId: 'm0',
    order: 3,
    title: 'Koordinaten, Pythagoras (2D/3D) & 2D-Gerade',
    subtitle: 'Abstände messen und die klassische Geradengleichung auffrischen',
    slideRef: 'Trig. S. 8 · AnaGeo S. 6–8 · Interp. S. 16',
    estimatedMinutes: 15,
    intuition: {
      hook: 'Ein Koordinatensystem ist schlicht ein Stadtplan mit Hausnummern nach rechts ($x$), nach oben ($y$) – und im 3D-Raum zusätzlich in die Höhe ($z$).',
      analogy:
        'Wenn du 3 Blocks nach Osten und 4 Blocks nach Norden gehst, zeigt dir der Satz des Pythagoras die Luftlinie ($5$ Blocks). Im 3D-Raum kommt einfach noch das Stockwerk $z^2$ unter dieselbe Wurzel.',
    },
    visualization: {
      type: 'line-2d',
      discoveryPrompt:
        'Verändere Steigung $m$ und Achsenabschnitt $c$: Was passiert, wenn $m = 0$ ist (Konstante)? Wann verläuft die Gerade exakt durch den Ursprung mit $45^\\circ$ (Identität $y = x$)?',
    },
    explanation: {
      paragraphs: [
        'Der **Satz des Pythagoras** ($c^2 = a^2 + b^2$) gilt in jedem rechtwinkligen Dreieck. Im 3D-Raum wendet man ihn einfach zweimal an und erhält für die Raumdiagonale $d = \\sqrt{x^2 + y^2 + z^2}$ – das ist später exakt die Formel für den **Vektorbetrag**!',
        'Eine **2D-Gerade** hat die Form $f(x) = m\\cdot x + c$. Dabei gibt $m$ die **Steigung** an (wie weit geht es hoch/runter, wenn $x$ um 1 wächst?) und $c$ den **$y$-Achsenabschnitt** (Startwert bei $x = 0$). Diese Formel begegnet dir 1:1 bei der linearen Interpolation wieder.',
      ],
      keyFormulas: [
        { label: 'Pythagoras 2D & 3D', latex: 'c = \\sqrt{a^2 + b^2}, \\qquad d_{3D} = \\sqrt{x^2 + y^2 + z^2}' },
        { label: '2D-Geradengleichung', latex: 'f(x) = m \\cdot x + c, \\qquad m = \\frac{y_2 - y_1}{x_2 - x_1}' },
      ],
      symbolTooltips: [
        { symbol: 'm', latex: 'm', meaning: 'Steigung: positiv = bergauf, negativ = bergab, 0 = waagerechte Konstante' },
        { symbol: 'c', latex: 'c', meaning: 'y-Achsenabschnitt: der y-Wert an der Stelle x = 0' },
      ],
    },
    example: {
      title: 'Geradengleichung durch 2 Punkte & 3D-Abstand',
      problem: 'Bestimme $f(x)=m\\cdot x + c$ durch $P_1(1, 5)$ und $P_2(3, 9)$ sowie den Abstand von $Q(1, 2, 2)$ zum Ursprung.',
      steps: [
        {
          label: 'Schritt 1: Steigung m berechnen',
          content: '$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{9 - 5}{3 - 1} = \\frac{4}{2} = 2$.',
        },
        {
          label: 'Schritt 2: c durch Einsetzen von P1 finden',
          content: '$5 = 2\\cdot 1 + c \\Rightarrow c = 3$. Also $f(x) = 2x + 3$ (genau das Beispiel aus AnaGeo S. 6!).',
        },
        {
          label: 'Schritt 3: 3D-Pythagoras für Q(1, 2, 2)',
          content: '$d = \\sqrt{1^2 + 2^2 + 2^2} = \\sqrt{1 + 4 + 4} = \\sqrt{9} = 3$.',
          trick: 'Merke dir die „schönen 3D-Tripel“ (1, 2, 2) → 3 und (2, 3, 6) → 7 – die tauchen in Klausuren ohne TR ständig auf!',
        },
      ],
      finalResult: '$f(x) = 2x + 3$ und $d = 3$',
    },
    generatorIds: ['m0-pythagoras', 'm0-line-2d'],
    summaryBullets: [
      '2D- und 3D-Pythagoras sind die direkte Grundlage für Vektorlängen.',
      'Steigung immer „Delta y durch Delta x“ ($\\frac{y_2-y_1}{x_2-x_1}$).',
      'Sonderfälle (AnaGeo S. 7–8): $m=0$ ergibt eine waagerechte Konstante ($y=c$); $m=1, c=0$ ist die Identität $y=x$.',
    ],
    formulaSheetIds: ['fs-m0-pyth3d'],
  },
  {
    id: 'm0-4-trigonometrie',
    moduleId: 'm0',
    order: 4,
    title: 'Einheitskreis, Grad ↔ Bogenmaß & exakte Trig-Werte',
    subtitle: 'Alle Winkelwerte der Prüfung mühelos ohne Taschenrechner ablesen',
    slideRef: 'Mathe II: Trigonometrie S. 5–12',
    estimatedMinutes: 18,
    intuition: {
      hook: 'Ohne Taschenrechner kannst du Winkel wie $37{,}4^\\circ$ nicht ausrechnen – deshalb verwenden taschenrechnerfreie Klausuren immer dieselben Standardwinkel ($0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ, 180^\\circ, 270^\\circ$).',
      analogy:
        'Denke an eine Uhr mit Radius 1 (Einheitskreis): Der Zeiger dreht sich ab 3 Uhr gegen den Uhrzeigersinn. Wie weit die Zeigerspitze nach **rechts** zeigt, ist der **Kosinus**; wie weit sie nach **oben** zeigt, ist der **Sinus**.',
    },
    visualization: {
      type: 'unit-circle',
      discoveryPrompt:
        'Drehe den Punkt auf dem Einheitskreis durch $0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$ und $180^\\circ$: Wann ist $\\cos = 0$? Wann sind $\\sin$ und $\\cos$ exakt gleich groß? Und wie lautet $180^\\circ$ im Bogenmaß?',
    },
    explanation: {
      paragraphs: [
        'Winkel lassen sich in **Grad (deg)** ($360^\\circ$ = Vollkreis) oder im **Bogenmaß (rad)** ($2\\pi$ = Vollkreis, weil der Kreisumfang $2\\pi r$ bei Radius $r=1$ genau $2\\pi$ ist) angeben. Der schnellste Kopfrechentrick: **$\\pi$ entspricht exakt $180^\\circ$**!',
        'Im rechtwinkligen Dreieck gilt: $\\cos\\alpha = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}}$, $\\sin\\alpha = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}}$ und $\\tan\\alpha = \\frac{\\text{Gegenkathete}}{\\text{Ankathete}} = \\frac{\\sin\\alpha}{\\cos\\alpha}$.',
        'Für die fünf wichtigsten Winkel ($0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$) brauchst du nichts stur auswendig zu pauken – nutze den **$\\frac{\\sqrt{n}}{2}$-Trick**: Für $\\sin$ zählst du unter der Wurzel einfach von $0$ bis $4$ hoch ($\\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2}$), für $\\cos$ von $4$ bis $0$ herunter!',
      ],
      keyFormulas: [
        {
          label: 'Umrechnung Grad ↔ Bogenmaß',
          latex: '\\text{rad} = \\frac{\\pi}{180^\\circ} \\cdot \\text{deg}, \\qquad \\text{deg} = \\frac{180^\\circ}{\\pi} \\cdot \\text{rad}',
        },
        {
          label: 'Rechtwinkliges Dreieck',
          latex: '\\cos\\alpha = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}}, \\quad \\sin\\alpha = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}}, \\quad \\tan\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}',
        },
        {
          label: 'Der √n / 2 - Merktrick',
          latex: '\\sin(0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ) = \\frac{\\sqrt{0}}{2},\\; \\frac{\\sqrt{1}}{2},\\; \\frac{\\sqrt{2}}{2},\\; \\frac{\\sqrt{3}}{2},\\; \\frac{\\sqrt{4}}{2}',
        },
      ],
      symbolTooltips: [
        { symbol: 'π', latex: '\\pi', meaning: 'Kreiszahl Pi – im Bogenmaß genau ein Halbkreis (180°)' },
        { symbol: 'arccos', latex: '\\arccos(x)', meaning: 'Umkehrfunktion von cos: „Welcher Winkel hat diesen Kosinuswert?“' },
        { symbol: 'arcsin', latex: '\\arcsin(x)', meaning: 'Umkehrfunktion von sin: „Welcher Winkel hat diesen Sinuswert?“' },
      ],
    },
    example: {
      title: 'Grad ↔ Bogenmaß & Winkel rückwärts bestimmen',
      problem: 'Rechne $135^\\circ$ ins Bogenmaß um und bestimme $\\alpha = \\arccos\\left(\\frac{1}{2}\\right)$ ohne Taschenrechner.',
      steps: [
        {
          label: 'Schritt 1: 135° in Bogenmaß',
          content: '$\\frac{135}{180}\\pi$ – beide Zahlen sind durch $45$ teilbar ($135 = 3\\cdot 45$, $180 = 4\\cdot 45$), also $\\frac{3\\pi}{4}$.',
          trick: 'Merke dir die Bausteine $45^\\circ = \\frac{\\pi}{4}$ und $30^\\circ = \\frac{\\pi}{6}$: Dann ist $135^\\circ = 3 \\cdot 45^\\circ = \\frac{3\\pi}{4}$ sofort klar!',
        },
        {
          label: 'Schritt 2: arccos(1/2) mit dem √n/2-Trick',
          content: '$\\frac{1}{2} = \\frac{\\sqrt{1}}{2}$. Kosinus zählt rückwärts ($4, 3, 2, 1, 0$ für $0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$) – bei $1$ steht $60^\\circ$!',
        },
      ],
      finalResult: '$\\frac{3\\pi}{4}$ und $\\alpha = 60^\\circ$',
    },
    generatorIds: ['m0-deg-rad', 'm0-exact-trig'],
    summaryBullets: [
      '$180^\\circ = \\pi$, $90^\\circ = \\frac{\\pi}{2}$, $60^\\circ = \\frac{\\pi}{3}$, $45^\\circ = \\frac{\\pi}{4}$, $30^\\circ = \\frac{\\pi}{6}$.',
      'Am Einheitskreis: waagerecht = $\\cos$, senkrecht = $\\sin$.',
      'Bei negativem Kosinus liegt der Winkel zwischen $90^\\circ$ und $180^\\circ$ (Spiegelung: $180^\\circ - \\alpha$).',
    ],
    formulaSheetIds: ['fs-m0-degrad', 'fs-m0-trig-table'],
  },
];
