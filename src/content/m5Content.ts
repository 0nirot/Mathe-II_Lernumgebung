import type { LessonDefinition } from '../types/learning';

export const M5_LESSONS: LessonDefinition[] = [
  {
    id: 'm5-1-linear-polynom-spline',
    moduleId: 'm5',
    order: 1,
    title: 'Lineare Interpolation, Polynome & Splines',
    subtitle: 'Aus diskreten Stützstellen stetige Funktionen gewinnen',
    slideRef: '3D & CG: Interpolation S. 3–6, 16–20',
    estimatedMinutes: 15,
    intuition: {
      hook: 'Ein Digitalbild besteht nur aus einzelnen Pixeln, eine 3D-Animation oft nur aus wenigen Keyframes – **Interpolation** füllt die Lücken dazwischen mathematisch sinnvoll auf.',
      analogy:
        'Stell dir Messpunkte auf Papier vor: **Lineare Interpolation** verbindet sie mit einem Lineal (einfach, aber eckig). Ein **Spline** ist dagegen eine biegsame Holzlatte („Straklatte“ aus dem Schiffsbau), die sich harmonisch ohne Knicke durch alle Stützstellen biegt!',
    },
    visualization: {
      type: 'interp-1d-board',
      discoveryPrompt:
        'Verschiebe die 4 roten Stützstellen auf dem **Kurvenbrett** und vergleiche Nearest-Neighbour, Linear und Polynom: Wann schwingt das Polynom extrem über die Stützstellen hinaus?',
    },
    explanation: {
      paragraphs: [
        '**Interpolation** bezeichnet Verfahren, die zu diskreten Daten (**Stützstellen**) eine stetige Funktion ermitteln (Interpolation S. 3).',
        'Bei der **linearen Interpolation** zwischen $(x_1, y_1)$ und $(x_2, y_2)$ legt man schlicht die altbekannte Geradengleichung $f(x) = m\\cdot x + c$ hindurch. *Vorteil:* sehr schnell & leicht verständlich. *Nachteil:* beschränkt auf lineare Verläufe.',
        'Bei der **Polynominterpolation** nutzt man ein Polynom $P(x) = \\sum_{i=0}^n a_i x^i$ für komplexe Kurven. Bei der **Spline-Interpolation** (Folie S. 19–20 – *ohne vertiefte Mathematik!*) werden die einzelnen Abschnitte zwischen den Stützstellen stückweise durch glatt verbundene (meist kubische) Polynome interpoliert.',
      ],
      keyFormulas: [
        {
          label: 'Lineare Interpolation (1D)',
          latex: 'f(x) = \\frac{y_2 - y_1}{x_2 - x_1}\\cdot x + y_1 - \\frac{y_2 - y_1}{x_2 - x_1}\\cdot x_1 = y_1 + \\frac{x - x_1}{x_2 - x_1}\\cdot(y_2 - y_1)',
        },
        { label: 'Allgemeines Polynom', latex: 'P(x) = \\sum_{i=0}^{n} a_i x^i = a_0 + a_1 x + a_2 x^2 + \\dots + a_n x^n' },
      ],
      symbolTooltips: [
        { symbol: 'Stützstelle', latex: '(x_i, y_i)', meaning: 'Bekannter diskreter Datenpunkt, durch den die Kurve exakt hindurchlaufen muss' },
        { symbol: 'Spline', latex: '\\text{Spline}', meaning: '„Straklatte“ – stückweise Polynome zwischen Stützstellen ohne Knicke' },
      ],
    },
    example: {
      title: 'Lineare Interpolation zwischen zwei Punkten',
      problem: 'Stützstellen $P_1(2, 4)$ und $P_2(6, 12)$. Berechne $f(x)$ und den Wert an $x = 3$.',
      steps: [
        { label: 'Schritt 1: Steigung m', content: '$m = \\frac{12 - 4}{6 - 2} = \\frac{8}{4} = 2$.' },
        { label: 'Schritt 2: Geradengleichung & Wert bei x = 3', content: '$f(x) = 2x + 4 - 2\\cdot 2 = 2x \\Rightarrow f(3) = 6$.', trick: 'Schneller Kopfrechenweg: $x=3$ liegt genau bei $\\frac{1}{4}$ der Strecke von 2 nach 6 → $4 + \\frac{1}{4}(12-4) = 6$!' },
      ],
      finalResult: '$f(x) = 2x$ und $f(3) = 6$',
    },
    generatorIds: ['m5-linear-1d'],
    summaryBullets: [
      'Lineare Interpolation = klassische Geradengleichung zwischen zwei Stützstellen.',
      'Polynome bilden komplexe Kurven ab, können aber bei hohem Grad stark überschwingen.',
      'Splines verbinden Stützstellen stückweise durch harmonische (z. B. kubische) Polynome.',
    ],
    formulaSheetIds: ['fs-m5-linear-bilinear'],
  },
  {
    id: 'm5-2-bilinear-artefakte',
    moduleId: 'm5',
    order: 2,
    title: 'Bilineare Interpolation (2D), Bildartefakte & Animation',
    subtitle: 'Zweistufiges 2D-Interpolieren von Hand + Aliasing, Blurring & Edge Halo',
    slideRef: '3D & CG: Interpolation S. 4, 7–15, 21–24',
    estimatedMinutes: 18,
    intuition: {
      hook: 'Wenn du ein Rasterbild vergrößerst, liegt ein neuer Pixel zwischen **vier** Nachbarpixeln $Q_{11}, Q_{21}, Q_{12}, Q_{22}$. Die **bilineare Interpolation** löst das 2D-Problem durch drei winzige 1D-Rechnungen!',
      analogy:
        'Erst mischst du waagerecht die beiden unteren Ecken zu $R_1$ und die beiden oberen Ecken zu $R_2$. Danach mischst du einfach senkrecht zwischen $R_1$ und $R_2$ – fertig ist dein neuer Pixelwert $P(x,y)$!',
    },
    visualization: {
      type: 'bilinear-2d-grid',
      discoveryPrompt:
        'Verändere im **Bilinearen Pixel-Gitter** die Anteile $t_x$ und $t_y$ sowie die Eck-Grauwerte: Siehst du, wie $R_1$ und $R_2$ erst auf der unteren und oberen Kante entstehen und $P$ genau dazwischen gemischt wird?',
    },
    explanation: {
      paragraphs: [
        'Bei der **bilinearen Interpolation** (Interpolation S. 21–22) wendest du lineare Interpolation zuerst entlang der **$x$-Achse** an ($Q_{11}, Q_{21} \\to R_1$ und $Q_{12}, Q_{22} \\to R_2$) und danach noch einmal entlang der **$y$-Achse** zwischen $R_1$ und $R_2$ zum Endwert $P(x, y)$. *(Bikubisch nutzt dieselbe 2-Achsen-Idee mit kubischen Polynomen über $4\\times 4$ Punkte.)*',
        '**Typische Bildartefakte beim Image Resizing (Folie S. 7–8):** **Nearest-Neighbour** erzeugt harte Treppenstufen (**Aliasing**); **Bilinear** macht Kanten weich/verwaschen (**Blurring**); **Bikubisch** liefert schärfere Kanten, kann aber helle/dunkle Säume (**Edge Halo**) durch Überschwingen erzeugen.',
        '**Interpolation in der 3D-Animation (Folie S. 9–15):** Nur **Keyframes** speichern, alle Zwischenbilder interpolieren! *Vorteile:* Framerate-unabhängig (adaptive Framerate), spart enorm Rechenzeit. *Risiken:* Bei zu hoher Ausführungsgeschwindigkeit können Keyframes übersprungen werden; Rundungsprobleme beeinflussen die Animationsgeschwindigkeit.',
      ],
      keyFormulas: [
        {
          label: 'Bilineare Interpolation (2-Schritte-Rezept)',
          latex: 'R_1 = Q_{11} + t_x(Q_{21}-Q_{11}),\\quad R_2 = Q_{12} + t_x(Q_{22}-Q_{12}),\\quad P = R_1 + t_y(R_2 - R_1)',
        },
        {
          label: 'Relative Anteile t_x und t_y',
          latex: 't_x = \\frac{x - x_1}{x_2 - x_1}, \\qquad t_y = \\frac{y - y_1}{y_2 - y_1}',
        },
      ],
      symbolTooltips: [
        { symbol: 'Aliasing', latex: '\\text{Aliasing}', meaning: 'Treppeneffekt an schrägen Kanten (typisch für Nearest-Neighbour)' },
        { symbol: 'Edge Halo', latex: '\\text{Edge Halo}', meaning: 'Heller/dunkler Kanten-Saum durch Überschwingen (typisch für Bikubisch)' },
      ],
    },
    example: {
      title: 'Bilineare Interpolation auf einem 2D-Raster',
      problem: '$Q_{11}(0,0)=10$, $Q_{21}(4,0)=50$, $Q_{12}(0,2)=30$, $Q_{22}(4,2)=70$. Gesucht: $P(1, 1)$.',
      steps: [
        { label: 'Schritt 1: Relative Position t_x und t_y', content: '$t_x = \\frac{1-0}{4-0} = \\frac{1}{4}$ und $t_y = \\frac{1-0}{2-0} = \\frac{1}{2}$.' },
        { label: 'Schritt 2: Linear in x-Richtung (R1 & R2)', content: '$R_1 = 10 + \\frac{1}{4}(50-10) = 20$ und $R_2 = 30 + \\frac{1}{4}(70-30) = 40$.' },
        { label: 'Schritt 3: Linear in y-Richtung (P)', content: '$P(1,1) = 20 + \\frac{1}{2}(40-20) = 30$.' },
      ],
      finalResult: '$P(1, 1) = 30$',
    },
    generatorIds: ['m5-bilinear-2d', 'm5-concepts'],
    summaryBullets: [
      'Bilinear = 2× linear in $x$-Richtung ($R_1, R_2$), dann 1× linear in $y$-Richtung ($P$).',
      'Artefakte: Nearest-Neighbour → Aliasing; Bilinear → Blurring; Bikubisch → Edge Halo.',
      'Keyframe-Interpolation = Framerate-unabhängig, aber Achtung vor übersprungenen Keyframes & Rundungsfehlern.',
    ],
    formulaSheetIds: ['fs-m5-artifacts'],
  },
  {
    id: 'm5-3-artefakte-lupe',
    moduleId: 'm5',
    order: 3,
    title: 'Visueller Vergleich: Image-Resizing-Artefakte',
    subtitle: 'Aliasing, Blurring & Edge Halo im direkten Pixel-Vergleich erkennen',
    slideRef: '3D & CG: Interpolation S. 4, 7–8',
    estimatedMinutes: 10,
    intuition: {
      hook: 'Man versteht den Unterschied zwischen Nearest-Neighbour, Bilinear und Bikubisch in 10 Sekunden, wenn man dasselbe scharfe Symbol direkt nebeneinander vergrößert sieht.',
      analogy:
        'Wie eine Lupe auf einem Zeitungsfoto: Ohne Glättung siehst du grobe Treppen (Aliasing), mit sanfter Mittelung wird es milchig (Blurring), und mit kubischer Nachschärfung blitzt an harten Kanten ein feiner Heiligenschein (Edge Halo) auf.',
    },
    visualization: {
      type: 'resizing-artifacts',
      discoveryPrompt:
        'Vergleiche die drei 300 %-Vergrößerungen desselben 8×8-Icons (inspiriert von Folie Interpolation S. 7): Erkennst du die Treppenstufen links, die Unschärfe in der Mitte und den hellen Saum rechts?',
    },
    explanation: {
      paragraphs: [
        'In der Praxis wählst du das Interpolationsverfahren immer als Kompromiss zwischen **Rechenzeit** und **Bildqualität**: Nearest-Neighbour ist blitzschnell (Pixel-Art!), Bilinear ist der schnelle Standard für 3D-Texturen, und Bikubisch liefert glatte Fotos auf Kosten höherer Rechenzeit und möglicher Kanten-Säume.',
      ],
      keyFormulas: [
        { label: 'Qualitäts- & Aufwandsleiter', latex: '\\text{Nearest-Neighbour (1 Pkt.)} \\;\\to\\; \\text{Bilinear (2×2 Pkt.)} \\;\\to\\; \\text{Bikubisch (4×4 Pkt.)}' },
      ],
      symbolTooltips: [],
    },
    example: {
      title: 'Prüfungs-Kurzfrage zu Verfahren & Artefakten',
      problem: 'Ordne Aliasing, Blurring und Edge Halo den drei Verfahren zu.',
      steps: [
        { label: 'Zuordnung', content: 'Nearest-Neighbour $\\to$ **Aliasing**; Bilinear $\\to$ **Blurring**; Bikubisch $\\to$ **Edge Halo**.' },
      ],
      finalResult: 'NN = Aliasing, Bilinear = Blurring, Bikubisch = Edge Halo',
    },
    generatorIds: ['m5-concepts', 'm5-bilinear-2d'],
    summaryBullets: [
      '1D/2D Nearest-Neighbour = Stufenfunktion → Aliasing.',
      'Bilinear = 2×2 Nachbarn → Blurring.',
      'Bikubisch = 4×4 Nachbarn → schärfer, aber mögliches Edge Halo.',
    ],
    formulaSheetIds: ['fs-m5-artifacts'],
  },
];
