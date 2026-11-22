import type { LessonDefinition } from '../types/learning';

export const M3_LESSONS: LessonDefinition[] = [
  {
    id: 'm3-1-geraden-abstand',
    moduleId: 'm3',
    order: 1,
    title: 'Geraden im Raum & Abstand Punkt–Gerade',
    subtitle: 'Punkt-Richtungs-Form, 2-Punkte-Form und Lot-Abstand über das Kreuzprodukt',
    slideRef: 'Mathe II: Analytische Geometrie S. 9–28',
    estimatedMinutes: 20,
    intuition: {
      hook: 'Im 3D-Raum reicht $y = m\\cdot x + c$ nicht mehr aus – stattdessen beschreiben wir eine Gerade wie eine Flugbahn: ein Startpunkt $\\vec{r}_1$ plus beliebig viele Schritte $\\lambda$ in Flugrichtung $\\vec{a}$.',
      analogy:
        'Den kürzesten Abstand eines Punktes $Q$ zur Geraden findest du genial einfach über ein Parallelogramm: Grundseite = Einheitsvektor $\\vec{e}_a$ (Länge $1$), Fläche = $|\\vec{e}_a \\times \\overrightarrow{BQ}|$. Da $\\text{Fläche} = \\text{Grundseite} \\cdot \\text{Höhe} = 1 \\cdot d$, ist die Fläche direkt dein Abstand $d$!',
    },
    visualization: {
      type: 'geo-3d-stage',
      discoveryPrompt:
        'Wähle in **3D-Bühne #2** den Tab **„Gerade r(λ)“** und schiebe den $\\lambda$-Regler: Beobachte, wie der orange Stützvektor zuerst auf die Gerade führt und $\\lambda$ den grünen Punkt entlang der Geraden gleiten lässt.',
    },
    explanation: {
      paragraphs: [
        'Eine **Gerade im Raum** lautet in Punkt-Richtungs-Form $\\vec{r}(\\lambda) = \\vec{r}_1 + \\lambda\\vec{a}$. Kennst du zwei Punkte $B, D$, nimmst du einfach $\\vec{a} = \\overrightarrow{BD} = \\vec{r}_2 - \\vec{r}_1$ (**2-Punkte-Form**). *Hinweis (AnaGeo S. 17):* Die Normalenform $(\\vec{x}-\\vec{p})\\cdot\\vec{n}=0$ definiert nur in $\\mathbb{R}^2$ eindeutig eine Gerade (in 3D ist es eine Ebene!).',
        'Der **Abstand Punkt–Gerade** (und genauso der Abstand **zweier paralleler Geraden**, bei denen $\\vec{a}_1\\times\\vec{a}_2 = \\vec{0}$ gilt) folgt direkt aus dem Kreuzprodukt: $d = \\frac{|\\vec{a}\\times(\\vec{r}_q - \\vec{r}_1)|}{|\\vec{a}|}$.',
      ],
      keyFormulas: [
        { label: 'Gerade (Punkt-Richtungs- & 2-Punkte-Form)', latex: '\\vec{r}(\\lambda) = \\vec{r}_1 + \\lambda\\vec{a} = \\vec{r}_1 + \\lambda(\\vec{r}_2 - \\vec{r}_1)' },
        { label: 'Abstand Punkt–Gerade (und parallele Geraden)', latex: 'd = \\frac{|\\vec{a} \\times (\\vec{r}_q - \\vec{r}_1)|}{|\\vec{a}|}' },
      ],
      symbolTooltips: [
        { symbol: 'r⃗₁', latex: '\\vec{r}_1', meaning: 'Stützvektor (Ortsvektor eines beliebigen bekannten Punktes auf der Geraden)' },
        { symbol: 'a⃗', latex: '\\vec{a}', meaning: 'Richtungsvektor der Geraden (jedes Vielfache ≠ 0⃗ beschreibt dieselbe Gerade!)' },
      ],
    },
    example: {
      title: 'Abstand Punkt Q zu einer 3D-Geraden',
      problem: 'Gegeben $g: \\vec{r}(\\lambda) = (1,0,0)^T + \\lambda(0,3,4)^T$ und $Q(1, 3, -1)$. Berechne $d(Q, g)$.',
      steps: [
        { label: 'Schritt 1: Differenzvektor & Länge von a⃗', content: '$\\vec{r}_q - \\vec{r}_1 = (0, 3, -1)^T$ und $|\\vec{a}| = \\sqrt{0+9+16} = 5$.' },
        { label: 'Schritt 2: Kreuzprodukt bilden', content: '$\\vec{a}\\times(\\vec{r}_q - \\vec{r}_1) = (3(-1)-4\\cdot 3,\\; 0,\\; 0)^T = (-15, 0, 0)^T$ mit Betrag $15$.' },
        { label: 'Schritt 3: Durch |a⃗| teilen', content: '$d = \\frac{15}{5} = 3$.' },
      ],
      finalResult: '$d = 3$',
    },
    generatorIds: ['m3-line-2pts', 'm3-dist-point-line'],
    summaryBullets: [
      'Gerade im Raum braucht Stützvektor + Parameter · Richtungsvektor.',
      'Parallelität zweier Geraden: $\\vec{a}_1 \\times \\vec{a}_2 = \\vec{0}$ (kollinear).',
      'Abstand Punkt–Gerade (und parallele Geraden): $|\\vec{a}\\times(\\vec{r}_q-\\vec{r}_1)| / |\\vec{a}|$.',
    ],
    formulaSheetIds: ['fs-m3-line-dist'],
  },
  {
    id: 'm3-2-geraden-lage-windschief',
    moduleId: 'm3',
    order: 2,
    title: 'Zwei Geraden: Schnittpunkt, Winkel & Windschief',
    subtitle: 'Alle 4 Lagebeziehungen im Raum unterscheiden und berechnen',
    slideRef: 'Mathe II: Analytische Geometrie S. 24–41',
    estimatedMinutes: 22,
    intuition: {
      hook: 'Auf einem Blatt Papier (2D) schneiden sich zwei nicht-parallele Geraden immer. Im 3D-Raum können sie sich dagegen wie zwei Flugzeuge auf unterschiedlichen Höhen einfach verfehlen – sie sind **windschief**!',
      analogy:
        'Um den Abstand zweier windschiefer Flugbahnen zu messen, legst du gedanklich zwei parallele Glasplatten (Ebenen) durch beide Bahnen. Der Abstand der Glasplatten ist dein gesuchter Abstand $d$!',
    },
    visualization: {
      type: 'skew-lines-3d',
      discoveryPrompt:
        'Drehe **3D-Bühne #3** und blende die beiden parallelen Hilfsebenen $E_1, E_2$ ein und aus: Siehst du, wie das gemeinsame Lot $d$ exakt senkrecht auf **beiden** Geraden steht?',
    },
    explanation: {
      paragraphs: [
        'Zwei Geraden im Raum haben genau eine von **4 Lagen**: (1) identisch, (2) echt parallel ($\\vec{a}_1\\times\\vec{a}_2=\\vec{0}$), (3) **schneidend** oder (4) **windschief**.',
        'Für den **Schnittpunkt** setzt du $g_1 = g_2$ (ergibt 3 Gleichungen für $\\lambda_1, \\lambda_2$). Löse zwei Gleichungen und prüfe die dritte! Geht sie auf, liefert $\\lambda_1$ in $g_1$ den Schnittpunkt $S$ (und der Schnittwinkel folgt per $\\arccos$ aus $\\vec{a}_1, \\vec{a}_2$).',
        'Schneiden sie sich nicht (und sind nicht parallel), sind sie **windschief**. Ihr Abstand nutzt den gemeinsamen Normalenvektor $\\vec{n} = \\vec{a}_1 \\times \\vec{a}_2$: $d = \\frac{|\\vec{n}\\cdot(\\vec{r}_2 - \\vec{r}_1)|}{|\\vec{n}|}$ (im Zähler steht das Spatprodukt / eine $3\\times 3$-Determinante!).',
      ],
      keyFormulas: [
        { label: 'Abstand windschiefer Geraden (Spatprodukt)', latex: 'd = \\frac{|(\\vec{a}_1 \\times \\vec{a}_2)\\cdot(\\vec{r}_2 - \\vec{r}_1)|}{|\\vec{a}_1 \\times \\vec{a}_2|}' },
        { label: 'Schnittwinkel zweier Geraden', latex: '\\rho = \\arccos\\left(\\frac{|\\vec{a}_1\\cdot\\vec{a}_2|}{|\\vec{a}_1|\\cdot|\\vec{a}_2|}\\right)' },
      ],
      symbolTooltips: [
        { symbol: '[a₁ a₂ d]', latex: '[\\vec{a}_1\\;\\vec{a}_2\\;(\\vec{r}_2-\\vec{r}_1)]', meaning: 'Spatprodukt = (a⃗₁×a⃗₂)·(r⃗₂−r⃗₁) = 3×3-Determinante. Ist es 0, liegen die Geraden in einer Ebene!' },
      ],
    },
    example: {
      title: 'Abstand windschiefer Geraden berechnen',
      problem: '$g_1: (0,0,0)^T + \\lambda_1(1,0,0)^T$ und $g_2: (1,1,4)^T + \\lambda_2(0,1,0)^T$.',
      steps: [
        { label: 'Schritt 1: Gemeinsamer Normalenvektor', content: '$\\vec{n} = \\vec{a}_1 \\times \\vec{a}_2 = (1,0,0)^T \\times (0,1,0)^T = (0,0,1)^T$ mit $|\\vec{n}| = 1$.' },
        { label: 'Schritt 2: Differenz der Stützvektoren', content: '$\\vec{r}_2 - \\vec{r}_1 = (1, 1, 4)^T$.' },
        { label: 'Schritt 3: Abstandformel', content: '$d = \\frac{|(0,0,1)^T \\cdot (1,1,4)^T|}{1} = \\frac{4}{1} = 4$.' },
      ],
      finalResult: '$d = 4$',
    },
    generatorIds: ['m3-lines-intersect', 'm3-dist-skew-lines'],
    summaryBullets: [
      '4 Lagen: identisch, parallel, schneidend, windschief.',
      'Schnittpunkt: $g_1 = g_2$ liefert $3\\times 2$-LGS – die 3. Zeile ist immer deine Kontrollprobe!',
      'Windschiefer Abstand: erst $\\vec{n}=\\vec{a}_1\\times\\vec{a}_2$, dann Projektion von $(\\vec{r}_2-\\vec{r}_1)$ auf $\\vec{n}$.',
    ],
    formulaSheetIds: ['fs-m3-skew'],
  },
  {
    id: 'm3-3-ebenen-gerade-ebene',
    moduleId: 'm3',
    order: 3,
    title: 'Ebenen, Abstand Punkt–Ebene & Gerade–Ebene',
    subtitle: 'Normalenform verstehen – und warum der Schnittwinkel arcsin braucht!',
    slideRef: 'Mathe II: Analytische Geometrie S. 44–75',
    estimatedMinutes: 22,
    intuition: {
      hook: 'Statt eine Ebene mit zwei Richtungspfeilen abzufahren, kannst du sie viel eleganter über einen einzigen Pfeil beschreiben, der **senkrecht aus der Ebene herauszeigt** (Normalenvektor $\\vec{n}$).',
      analogy:
        'Stell dir einen Schirmständer vor: Wenn der Stiel ($\\vec{n}$) fest ausgerichtet ist, ist die Neigung der Tischplatte ($E$) eindeutig festgelegt! Und jeder Pfeil innerhalb der Tischplatte steht im $90^\\circ$-Winkel zum Stiel ($\\vec{n}\\cdot(\\vec{r}-\\vec{r}_1)=0$).',
    },
    visualization: {
      type: 'geo-3d-stage',
      discoveryPrompt:
        'Wähle in **3D-Bühne #2** den Tab **„Schnittwinkel-Lupe“** und ziehe den Winkel-Regler $\\alpha$: Warum ergibt $\\arccos$ zwischen $\\vec{n}$ und $\\vec{a}$ den falschen Winkel ($90^\\circ - \\alpha$) – und warum löst $\\arcsin$ das Problem sofort?',
    },
    explanation: {
      paragraphs: [
        'Eine **Ebene** lässt sich in **Punkt-Richtungs-Form** ($\\vec{r} = \\vec{r}_1 + \\lambda\\vec{a} + \\mu\\vec{b}$), **Drei-Punkte-Form** (nicht kollinear!) oder besonders rechenfreundlich in **Normalenform** $\\vec{n}\\cdot(\\vec{r}-\\vec{r}_1)=0$ darstellen (mit $\\vec{n} = \\vec{a}\\times\\vec{b}$).',
        'Der **Abstand Punkt–Ebene** (und genauso parallele Gerade–Ebene & parallele Ebene–Ebene) ist direkt die Länge der Projektion von $\\overrightarrow{P_1 Q}$ auf $\\vec{n}$: $d = \\frac{|\\vec{n}\\cdot(\\vec{r}_Q - \\vec{r}_1)|}{|\\vec{n}|}$.',
        'Für **Gerade–Ebene** prüfst du zuerst $\\vec{a}\\cdot\\vec{n}$: Ist es $0$, läuft die Gerade parallel (oder liegt bei $d=0$ darin). Ist $\\vec{a}\\cdot\\vec{n} \\neq 0$, schneidet sie die Ebene bei $\\lambda_s = \\frac{\\vec{n}\\cdot(\\vec{r}_0 - \\vec{r}_g)}{\\vec{n}\\cdot\\vec{a}}$ unter dem Winkel $\\alpha = \\arcsin\\left(\\frac{|\\vec{n}\\cdot\\vec{a}|}{|\\vec{n}||\\vec{a}|}\\right)$!',
      ],
      keyFormulas: [
        { label: 'Normalenform & Abstand Punkt–Ebene', latex: '\\vec{n}\\cdot(\\vec{r}-\\vec{r}_1)=0, \\qquad d = \\frac{|\\vec{n}\\cdot(\\vec{r}_Q-\\vec{r}_1)|}{|\\vec{n}|}' },
        { label: 'Schnittpunkt Gerade–Ebene', latex: '\\lambda_s = \\frac{\\vec{n}\\cdot(\\vec{r}_0 - \\vec{r}_g)}{\\vec{n}\\cdot\\vec{a}} \\quad (\\vec{n}\\cdot\\vec{a} \\neq 0)' },
        { label: 'Schnittwinkel Gerade–Ebene (Achtung arcsin!)', latex: '\\alpha = \\arcsin\\left(\\frac{|\\vec{n}\\cdot\\vec{a}|}{|\\vec{n}|\\cdot|\\vec{a}|}\\right)' },
      ],
      symbolTooltips: [
        { symbol: 'n⃗', latex: '\\vec{n} = \\vec{a}\\times\\vec{b}', meaning: 'Normalenvektor: steht senkrecht auf der Ebene E' },
        { symbol: 'arcsin', latex: '\\arcsin', meaning: 'Nur bei Gerade–Ebene! Weil cos(90° − α) = sin(α).' },
      ],
      slideNote:
        'Hinweis zu Folie AnaGeo S. 74: Im Zähler der arcsin-Formel fehlen dort die Betragsstriche. Setze immer |n⃗ · a⃗|, damit du garantiert den positiven spitzen Winkel α ∈ [0°, 90°] erhältst!',
    },
    example: {
      title: 'Schnittpunkt & Schnittwinkel Gerade–Ebene',
      problem: 'Ebene $E: P_0(0,2,2), \\vec{n}=(0,1,1)^T$ und Gerade $g: (1,0,0)^T + \\lambda(1,0,1)^T$.',
      steps: [
        { label: 'Schritt 1: Schnittparameter λ_s', content: '$\\vec{n}\\cdot\\vec{a} = 1 \\neq 0$; $\\vec{r}_0-\\vec{r}_g = (-1,2,2)^T \\Rightarrow \\vec{n}\\cdot(\\vec{r}_0-\\vec{r}_g) = 4 \\Rightarrow \\lambda_s = 4$.' },
        { label: 'Schritt 2: Schnittpunkt S', content: '$\\vec{r}_s = (1,0,0)^T + 4(1,0,1)^T = (5, 0, 4)^T$.' },
        { label: 'Schritt 3: Schnittwinkel mit arcsin', content: '$\\sin\\alpha = \\frac{|1|}{\\sqrt{2}\\cdot\\sqrt{2}} = \\frac{1}{2} \\Rightarrow \\alpha = 30^\\circ$.', trick: 'Hättest du versehentlich arccos genommen, wäre 60° (Winkel zu n⃗) herausgekommen!' },
      ],
      finalResult: '$S(5, 0, 4)$ und $\\alpha = 30^\\circ$',
    },
    generatorIds: ['m3-dist-point-plane', 'm3-line-plane-intersect'],
    summaryBullets: [
      'Gerade $\\parallel$ Ebene $\\iff \\vec{a}\\cdot\\vec{n} = 0$.',
      'Nur bei Gerade–Ebene steht **$\\arcsin$** in der Winkelformel – bei Gerade–Gerade und Ebene–Ebene steht $\\arccos$!',
      'Abstand Punkt–Ebene, parallele Gerade–Ebene und parallele Ebene–Ebene nutzen alle dieselbe Formel!',
    ],
    formulaSheetIds: ['fs-m3-plane-dist', 'fs-m3-line-plane'],
  },
  {
    id: 'm3-4-ebene-ebene',
    moduleId: 'm3',
    order: 4,
    title: 'Schnittgerade & Schnittwinkel zweier Ebenen',
    subtitle: 'Zwei Ebenen im Raum schneiden – mit freier Koordinatenwahl',
    slideRef: 'Mathe II: Analytische Geometrie S. 76–85',
    estimatedMinutes: 18,
    intuition: {
      hook: 'Zwei nicht-parallele Ebenen (wie zwei Seiten eines offenen Buchs) treffen sich immer entlang einer gemeinsamen **Schnittgeraden** (dem Buchrücken).',
      analogy:
        'Da die Schnittgerade gleichzeitig in **beiden** Ebenen liegt, muss ihr Richtungsvektor senkrecht auf **beiden** Normalenvektoren $\\vec{n}_1$ und $\\vec{n}_2$ stehen – genau das liefert das Kreuzprodukt $\\vec{a} = \\vec{n}_1 \\times \\vec{n}_2$ in einem Rutsch!',
    },
    explanation: {
      paragraphs: [
        'Zwei Ebenen schneiden sich genau dann entlang einer Geraden, wenn ihre Normalenvektoren **nicht kollinear** sind ($\\vec{n}_1 \\times \\vec{n}_2 \\neq \\vec{0}$). (Sind sie kollinear, sind die Ebenen parallel und ihr Abstand ist $d = \\frac{|\\vec{n}_1\\cdot(\\vec{r}_2-\\vec{r}_1)|}{|\\vec{n}_1|}$.)',
        'Für die **Schnittgerade** $\\vec{r}(\\lambda) = \\vec{r}_0 + \\lambda\\vec{a}$ brauchst du nur zwei Stücke: (1) Den Richtungsvektor $\\vec{a} = \\vec{n}_1 \\times \\vec{n}_2$, und (2) **einen beliebigen gemeinsamen Punkt** $\\vec{r}_0$. Da du 2 Ebenengleichungen für 3 Unbekannte $(x_0, y_0, z_0)$ hast, darfst du **eine Koordinate frei wählen** (z. B. $x_0 = 0$) und löst das winzige $2\\times 2$-LGS!',
        'Der **Schnittwinkel** zweier Ebenen ist direkt der Winkel zwischen ihren Normalenvektoren: $\\alpha = \\arccos\\left(\\frac{|\\vec{n}_1\\cdot\\vec{n}_2|}{|\\vec{n}_1||\\vec{n}_2|}\\right)$.',
      ],
      keyFormulas: [
        { label: 'Richtungsvektor der Schnittgeraden', latex: '\\vec{a} = \\vec{n}_1 \\times \\vec{n}_2 \\neq \\vec{0}' },
        { label: 'Schnittwinkel Ebene–Ebene', latex: '\\alpha = \\arccos\\left(\\frac{|\\vec{n}_1 \\cdot \\vec{n}_2|}{|\\vec{n}_1|\\cdot|\\vec{n}_2|}\\right)' },
      ],
      symbolTooltips: [
        { symbol: 'x₀ = 0', latex: 'x_0 = 0', meaning: 'Freie Wahl einer Koordinate (falls die Gerade nicht parallel zur yz-Ebene liegt – sonst einfach y₀=0 oder z₀=0 wählen!)' },
      ],
    },
    example: {
      title: 'Schnittgerade & Winkel von E1 und E2',
      problem: 'Bestimme Schnittgerade und Schnittwinkel von $E_1: x + y = 2$ und $E_2: y + z = 3$.',
      steps: [
        { label: 'Schritt 1: Normalenvektoren ablesen & kreuzen', content: '$\\vec{n}_1=(1,1,0)^T, \\vec{n}_2=(0,1,1)^T \\Rightarrow \\vec{a} = \\vec{n}_1\\times\\vec{n}_2 = (1,-1,1)^T$.' },
        { label: 'Schritt 2: Einen Stützpunkt finden (setze x₀ = 0)', content: 'Aus $E_1$: $0 + y_0 = 2 \\Rightarrow y_0 = 2$. Aus $E_2$: $2 + z_0 = 3 \\Rightarrow z_0 = 1$. Also $P_0(0, 2, 1)$.' },
        { label: 'Schritt 3: Schnittwinkel', content: '$\\cos\\alpha = \\frac{1}{\\sqrt{2}\\cdot\\sqrt{2}} = \\frac{1}{2} \\Rightarrow \\alpha = 60^\\circ$.' },
      ],
      finalResult: '$g: \\vec{r}(\\lambda) = (0,2,1)^T + \\lambda(1,-1,1)^T$ und $\\alpha = 60^\\circ$',
    },
    generatorIds: ['m3-plane-plane-line'],
    summaryBullets: [
      'Richtungsvektor der Schnittgeraden ist immer $\\vec{a} = \\vec{n}_1 \\times \\vec{n}_2$.',
      'Für den Stützpunkt eine Koordinate clever auf $0$ setzen und $2\\times 2$-LGS lösen (jeder Punkt auf $g$ ist gleichwertig!).',
      'Schnittwinkel Ebene–Ebene nutzt wieder $\\arccos$ der Normalenvektoren.',
    ],
    formulaSheetIds: ['fs-m3-plane-plane'],
  },
];
