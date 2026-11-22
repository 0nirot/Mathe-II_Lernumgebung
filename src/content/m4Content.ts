import type { LessonDefinition } from '../types/learning';

export const M4_LESSONS: LessonDefinition[] = [
  {
    id: 'm4-1-linear-affin-homogen',
    moduleId: 'm4',
    order: 1,
    title: 'Lineare vs. Affine Abbildungen & Homogene 3×3-Matrizen',
    subtitle: 'Warum Punkte keine Vektoren sind und wofür die extra Zeile (0, 0, 1) da ist',
    slideRef: '3D & CG: Mathe Basics S. 5–46',
    estimatedMinutes: 18,
    intuition: {
      hook: 'In der Computergrafik sind ein **Punkt** (fixer Ort, z. B. das Rathaus) und ein **Vektor** (Bewegung zwischen Orten) streng getrennte Konzepte – „Marktplatz + Rathaus“ ergibt keinen Sinn, zwei Bewegungen hintereinander schon!',
      analogy:
        'Eine **lineare Abbildung** hält den Ursprung $(0,0)$ immer mit einem Nagel fest (Rotation, Skalierung, Scherung). Erst eine **affine Abbildung** zieht den Nagel heraus und erlaubt zusätzlich eine Verschiebung (Translation)!',
    },
    visualization: {
      type: 'transform-2d-lab',
      discoveryPrompt:
        'Probiere im **2D-Transformations-Labor** zuerst nur Rotation, Skalierung und Scherung: Der rote Ursprung bleibt fest! Bewege dann $t_x$ oder $t_y$ – siehst du sofort, was sich in der rechten Spalte der $3\\times 3$-Matrix verändert?',
    },
    explanation: {
      paragraphs: [
        'Eine Abbildung $f(\\vec{x}) = A\\vec{x}$ heißt **linear**, wenn sie strukturerhaltend ist: **homogen** ($f(a\\vec{x}) = a f(\\vec{x})$) und **additiv** ($f(\\vec{x}+\\vec{y}) = f(\\vec{x}) + f(\\vec{y})$) – insbesondere gilt immer **$f(\\vec{0}) = \\vec{0}$**.',
        'Eine **affine Abbildung** hat die Form $f(\\vec{x}) = A\\vec{x} + \\vec{b}$ (linear + Translation). Sie bewahrt **Kollinearität, Parallelität, Konvexität, Teilverhältnisse und den Massemittelpunkt (Baryzentrum)**.',
        'Damit auch die **Translation** als Matrixmultiplikation dargestellt und mit Rotation/Skalierung/Scherung zu einer einzigen Matrix kombiniert werden kann, nutzen wir **homogene Koordinaten**: Eine **$3\\times 3$-Matrix in 2D** (Punkt $(x, y, 1)^T$, Vektor $(x, y, 0)^T$) bzw. **$4\\times 4$-Matrix in 3D**!',
      ],
      keyFormulas: [
        { label: 'Linear vs. Affin', latex: '\\text{Linear: } f(\\vec{x})=A\\vec{x} \\quad (f(\\vec{0})=\\vec{0}) \\qquad | \\qquad \\text{Affin: } f(\\vec{x})=A\\vec{x}+\\vec{b}' },
        {
          label: 'Die 4 Grundmatrizen in 2D (3×3 homogen)',
          latex: 'T_T=\\begin{pmatrix}1&0&t_x\\\\0&1&t_y\\\\0&0&1\\end{pmatrix},\\; T_S=\\begin{pmatrix}s_x&0&0\\\\0&s_y&0\\\\0&0&1\\end{pmatrix},\\; T_{Sh}=\\begin{pmatrix}1&\\lambda_x&0\\\\\\lambda_y&1&0\\\\0&0&1\\end{pmatrix},\\; T_R=\\begin{pmatrix}\\cos\\phi&-\\sin\\phi&0\\\\\\sin\\phi&\\cos\\phi&0\\\\0&0&1\\end{pmatrix}',
        },
      ],
      symbolTooltips: [
        { symbol: 'w = 1', latex: '(x, y, 1)^T', meaning: 'Homogene Koordinate für Punkte: reagiert auf Translation t_x, t_y!' },
        { symbol: 'w = 0', latex: '(x, y, 0)^T', meaning: 'Homogene Koordinate für reine Richtungsvektoren: ignoriert Translation!' },
      ],
      slideNote:
        'Hinweis zu Folie Abbildungen S. 30: Dort steht kurz „2×2 Matrix für Translation im 2D Raum ausreichend“ – mathematisch ist eine 2D-Translation jedoch nicht linear und braucht tatsächlich entweder +b⃗ oder genau unsere homogene 3×3-Matrix!',
    },
    example: {
      title: '2D-Scherung & Rotation mit 3×3-Matrizen',
      problem: 'Rotiere $P(3, 1)$ um $90^\\circ$ gegen den Uhrzeigersinn um den Ursprung.',
      steps: [
        { label: 'Schritt 1: Exakte Werte für 90° einsetzen', content: '$\\cos(90^\\circ) = 0, \\sin(90^\\circ) = 1 \\Rightarrow T_R(90^\\circ) = \\begin{pmatrix}0&-1&0\\\\1&0&0\\\\0&0&1\\end{pmatrix}$.' },
        { label: 'Schritt 2: Mit homogenem Punkt (3, 1, 1)ᵀ multiplizieren', content: '$P\' = \\begin{pmatrix}0&-1&0\\\\1&0&0\\\\0&0&1\\end{pmatrix}\\begin{pmatrix}3\\\\1\\\\1\\end{pmatrix} = \\begin{pmatrix}-1\\\\3\\\\1\\end{pmatrix} \\Rightarrow P\'(-1, 3)$.' },
      ],
      finalResult: '$P\'(-1, 3)$',
    },
    generatorIds: ['m4-linear-vs-affine', 'm4-2d-basic-transform'],
    summaryBullets: [
      'Blitz-Test für Linearität: Bleibt der Ursprung fix ($f(\\vec{0}) = \\vec{0}$)?',
      'Homogene Koordinaten ($3\\times 3$ in 2D, $4\\times 4$ in 3D) machen alle affinen Transformationen per Matrixprodukt kombinierbar.',
      'Flächentreue Sonder-Skalierung (Abb. S. 41): $s_x = s, s_y = 1/s$ (Determinante bleibt $1$).',
    ],
    formulaSheetIds: ['fs-m4-2d-matrices'],
  },
  {
    id: 'm4-2-verkettung-rotation-punkt',
    moduleId: 'm4',
    order: 2,
    title: 'Verkettung & 2D-Rotation um beliebigen Punkt',
    subtitle: 'Rechts-nach-links multiplizieren und das 3-Schritte-Prinzip meistern',
    slideRef: '3D & CG: Mathe Basics S. 55–59',
    estimatedMinutes: 20,
    intuition: {
      hook: '„Erst um $90^\\circ$ drehen, dann 3 Schritte nach rechts“ landet an einem völlig anderen Ort als „Erst 3 Schritte nach rechts, dann um $90^\\circ$ drehen“!',
      analogy:
        'Unsere Rotationsmatrix $T_R$ kann nur um den Ursprung $(0,0)$ drehen. Wenn du um einen beliebigen Punkt $P(x_0,y_0)$ drehen willst, schiebst du einfach die ganze Welt so, dass $P$ kurz im Ursprung liegt, drehst dort – und schiebst alles wieder zurück!',
    },
    visualization: {
      type: 'transform-chain-2d',
      discoveryPrompt:
        'Teste zuerst im **Reihenfolge-Detektor** den Unterschied zwischen $T_T\\cdot T_R$ und $T_R\\cdot T_T$. Schalte danach aufs **3-Schritte-Kino** und klicke Schritt für Schritt durch die Rotation um $P(2,2)$!',
    },
    explanation: {
      paragraphs: [
        'Weil wir Spaltenvektoren von **rechts** an eine Matrix multiplizieren ($\\vec{x}\' = T_3 \\cdot T_2 \\cdot T_1 \\cdot \\vec{x}$), steht die **zuerst ausgeführte Transformation immer ganz rechts** und die letzte ganz links!',
        'Für die **2D-Rotation um einen beliebigen Punkt $P(x_0, y_0)$** kombinierst du genau 3 Matrizen: (1) Verschieben um $(-x_0, -y_0)$ [$T_T$ rechts], (2) Rotieren um $\\phi$ [$T_R$ Mitte], (3) Zurückschieben um $(+x_0, +y_0)$ [$T_T^{-1}$ links].',
        'Vorteil der Vorkombination (Abb. S. 59): Statt tausende Eckpunkte eines 3D-Modells dreimal zu multiplizieren, rechnest du einmal $T_{\\text{ges}} = T_T^{-1}\\cdot T_R\\cdot T_T$ aus und wendest nur noch diese eine Matrix an!',
      ],
      keyFormulas: [
        { label: 'Verkettungs-Reihenfolge (rechts → links!)', latex: 'T_{\\text{ges}} = T_3 \\cdot T_2 \\cdot T_1' },
        { label: '2D-Rotation um beliebigen Punkt P(x, y)', latex: 'T = T_T^{-1} \\cdot T_R(\\phi) \\cdot T_T = T(+x, +y) \\cdot T_R(\\phi) \\cdot T(-x, -y)' },
      ],
      symbolTooltips: [
        { symbol: 'T_T⁻¹', latex: 'T_T^{-1}', meaning: 'Rückwärts-Translation: einfach Vorzeichen von t_x und t_y umdrehen!' },
      ],
    },
    example: {
      title: 'Punkt Q(5, 2) um 90° um P(2, 2) drehen',
      problem: 'Berechne Gesamtmatrix $T$ und Bildpunkt $Q\'$ für $90^\\circ$ gegen den Uhrzeigersinn.',
      steps: [
        { label: 'Schritt 1: Die 3 Einzelmatrizen', content: '$T_T = \\begin{pmatrix}1&0&-2\\\\0&1&-2\\\\0&0&1\\end{pmatrix}$, $T_R = \\begin{pmatrix}0&-1&0\\\\1&0&0\\\\0&0&1\\end{pmatrix}$, $T_T^{-1} = \\begin{pmatrix}1&0&2\\\\0&1&2\\\\0&0&1\\end{pmatrix}$.' },
        { label: 'Schritt 2: Rechts nach links multiplizieren', content: '$T_R\\cdot T_T = \\begin{pmatrix}0&-1&2\\\\1&0&-2\\\\0&0&1\\end{pmatrix} \\Rightarrow T = T_T^{-1}(T_R T_T) = \\begin{pmatrix}0&-1&4\\\\1&0&0\\\\0&0&1\\end{pmatrix}$.' },
        { label: 'Schritt 3: Auf Q(5, 2, 1)ᵀ anwenden', content: '$Q\' = T\\cdot (5, 2, 1)^T = (2, 5, 1)^T \\Rightarrow Q\'(2, 5)$.', trick: 'Plausibilität: Q lag 3 Einheiten rechts von P – 90° gegen UZS muss 3 Einheiten über P sein: (2, 2+3) = (2, 5) ✓!' },
      ],
      finalResult: '$Q\'(2, 5)$',
    },
    generatorIds: ['m4-2d-chain', 'm4-2d-rotate-point'],
    summaryBullets: [
      'Immer von **rechts nach links** lesen und multiplizieren ($T_2\\cdot T_1$ = erst $T_1$, dann $T_2$).',
      'Rotation um beliebigen Punkt: $T(+P) \\cdot T_R \\cdot T(-P)$.',
      'Kurze Geometrie-Skizze am Rand des Klausurblatts rettet sofort vor Reihenfolgefehlern!',
    ],
    formulaSheetIds: ['fs-m4-chain-pivot'],
  },
  {
    id: 'm4-3-3d-transformationen',
    moduleId: 'm4',
    order: 3,
    title: '3D-Transformationen (4×4) & beliebige Drehachse',
    subtitle: 'Rotationen um X, Y, Z – und das 5-Schritte-Prinzip im Raum',
    slideRef: '3D & CG: Mathe Basics S. 29, 34, 39, 45, 51–53, 60–65',
    estimatedMinutes: 18,
    intuition: {
      hook: 'In 3D gibt es nicht mehr nur „eine“ Rotation, sondern drei Koordinatenachsen ($X, Y, Z$) – und jede Achse bleibt bei einer Drehung um sich selbst einfach an Ort und Stelle (eine $1$ auf der Diagonalen!).',
      analogy:
        'Willst du in 3D um eine schräge Achse drehen (wie ein Brathähnchen am Spieß), gilt derselbe Trick wie in 2D – nur mit 5 Schritten: Erst den Spieß auf die Z-Achse drehen (Schritt 1 & 2), dann um $\\alpha$ drehen (Schritt 3), dann den Spieß in umgekehrter Reihenfolge zurückdrehen (Schritt 4 & 5)!',
    },
    visualization: {
      type: 'transform-3d-cube',
      discoveryPrompt:
        'Drehe den 3D-Würfel in **3D-Bühne #4** getrennt um X-, Y- und Z-Achse und beobachte den gelben Eckpunkt: Welche Koordinate verändert sich bei einer Rotation um die Z-Achse **überhaupt nicht**?',
    },
    explanation: {
      paragraphs: [
        'In 3D verwenden wir **$4\\times 4$-Matrizen** mit letzter Zeile $(0, 0, 0, 1)$. Bei Translation stehen $(t_x, t_y, t_z)$ in der 4. Spalte; bei Skalierung stehen $(s_x, s_y, s_z)$ auf der Hauptdiagonalen.',
        'Bei den **3D-Achsenrotationen** $T_{Rx}, T_{Ry}, T_{Rz}$ bleibt die jeweilige Achsen-Zeile/-Spalte $(1, 0, 0, 0)$ (bzw. an Position 2 oder 3). **Achtung Klausurfalle bei $T_{Ry}$ (Abb. S. 52):** Dort steht **$+\\sin\\phi$ oben rechts** und **$-\\sin\\phi$ unten links** (umgekehrt zu $T_{Rx}$ und $T_{Rz}$)!',
        '**Konzept 3D-Rotation um beliebige Ursprungsachse (Abb. S. 60–65):** 1. Achse um X in die XZ-Ebene drehen → 2. um Y auf die Z-Achse drehen → 3. gewünschte Rotation um Z um $\\alpha$ → 4. Schritt 2 invertieren → 5. Schritt 1 invertieren. Kompakt zusammengefasst ergibt das die Rodrigues-Matrix $T_{Rn(\\alpha)}$ (Folie S. 65 – ideal fürs Formelblatt, nicht zum Auswendiglernen!).',
      ],
      keyFormulas: [
        {
          label: '3D-Rotationen um X-, Y- und Z-Achse (4×4)',
          latex: 'T_{Rx}=\\begin{pmatrix}1&0&0&0\\\\0&c&-s&0\\\\0&s&c&0\\\\0&0&0&1\\end{pmatrix},\\; T_{Ry}=\\begin{pmatrix}c&0&s&0\\\\0&1&0&0\\\\-s&0&c&0\\\\0&0&0&1\\end{pmatrix},\\; T_{Rz}=\\begin{pmatrix}c&-s&0&0\\\\s&c&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{pmatrix}',
        },
      ],
      symbolTooltips: [
        { symbol: 'c / s', latex: 'c = \\cos\\phi,\\; s = \\sin\\phi', meaning: 'Kompakte Kurzschreibweise für dein 1-Blatt-Formelblatt!' },
      ],
    },
    example: {
      title: '3D-Verkettung: Skalierung + Z-Rotation',
      problem: 'Skaliere $A(2, 0, 3)$ erst um $s_x = 2$ und rotiere danach um $180^\\circ$ um die $z$-Achse.',
      steps: [
        { label: 'Schritt 1: Matrizen aufstellen', content: '$T_S = \\text{diag}(2, 1, 1, 1)$ und $T_{Rz}(180^\\circ) = \\text{diag}(-1, -1, 1, 1)$ (da $\\cos 180^\\circ = -1, \\sin 180^\\circ = 0$).' },
        { label: 'Schritt 2: Verketten (rechts → links)', content: '$T_{\\text{ges}} = T_{Rz} \\cdot T_S = \\text{diag}(-2, -1, 1, 1)$.' },
        { label: 'Schritt 3: Punkt transformieren', content: '$A\' = T_{\\text{ges}} \\cdot (2, 0, 3, 1)^T = (-4, 0, 3, 1)^T \\Rightarrow A\'(-4, 0, 3)$.' },
      ],
      finalResult: '$A\'(-4, 0, 3)$',
    },
    generatorIds: ['m4-3d-transform', 'm4-3d-axis-concept'],
    summaryBullets: [
      'Bei $T_{Ry}$ Vorzeichen von $\\sin\\phi$ genau prüfen ($+\\sin$ in Zeile 1, $-\\sin$ in Zeile 3)!',
      '5-Schritte-Prinzip für beliebige 3D-Achse: X → Y → Z($\\alpha$) → Y⁻¹ → X⁻¹ (umgekehrte Rückgängig-Reihenfolge!).',
      'Die kompakte Rodrigues-Formel (S. 65) gehört aufs Formelblatt, muss aber nicht auswendig gelernt werden.',
    ],
    formulaSheetIds: ['fs-m4-3d-rot'],
  },
];
