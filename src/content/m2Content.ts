import type { LessonDefinition } from '../types/learning';

export const M2_LESSONS: LessonDefinition[] = [
  {
    id: 'm2-1-lgs-gauss',
    moduleId: 'm2',
    order: 1,
    title: 'Lineare Gleichungssysteme & Gauß-Algorithmus',
    subtitle: 'Systeme mit 3 Unbekannten planvoll auf Stufenform bringen',
    slideRef: 'Mathe II: LGS S. 4–22',
    estimatedMinutes: 20,
    intuition: {
      hook: 'Ein LGS mit 3 Gleichungen wirkt wie ein verknotetes Rätsel – der Gauß-Algorithmus löst einen Knoten nach dem anderen, bis unten nur noch eine einzige Unbekannte übrig bleibt.',
      analogy:
        'Stell dir eine Treppe vor: Oben stehen $x, y, z$, eine Stufe tiefer nur noch $y, z$, ganz unten nur noch $z$. Sobald du $z$ kennst, kletterst du die Treppe einfach rückwärts wieder hoch!',
    },
    visualization: {
      type: 'gauss-workbench',
      discoveryPrompt:
        'Probiere im **LGS-Modus** das Originalbeispiel deines Dozenten (LGS S. 7): Addiere erst `Z1` auf `Z2` und `5 · Z1` auf `Z3` – siehst du, wie links unter der Diagonalen sofort Nullen entstehen?',
    },
    explanation: {
      paragraphs: [
        'Ein **lineares Gleichungssystem (LGS)** aus $m$ Gleichungen und $n$ Unbekannten lässt sich kompakt in **Matrixform** $A\\cdot\\vec{x} = \\vec{c}$ schreiben ($A$ = Koeffizientenmatrix, $\\vec{x}$ = Lösungsvektor, $\\vec{c}$ = Absolutglieder).',
        'Beim **Gaußschen Eliminationsverfahren** nutzt du genau **drei erlaubte Äquivalenzumformungen** (LGS S. 22): (1) Gleichungen vertauschen, (2) eine Gleichung mit einer Zahl $\\neq 0$ multiplizieren/dividieren, (3) ein Vielfaches einer Gleichung zu einer anderen addieren.',
        'Wichtig fürs Klausurverständnis (**Lösungsverhalten**, LGS S. 16): Ein **inhomogenes LGS** ($A\\vec{x}=\\vec{c}, \\vec{c}\\neq\\vec{0}$) hat entweder **1**, **$\\infty$ viele** oder **0** Lösungen. Ein **homogenes LGS** ($A\\vec{x}=\\vec{0}$) hat hingegen **immer** mindestens die triviale Lösung $\\vec{x}=\\vec{0}$ (also 1 oder $\\infty$ viele Lösungen – niemals unlösbar!).',
      ],
      keyFormulas: [
        { label: 'Matrixdarstellung eines LGS', latex: 'A \\cdot \\vec{x} = \\vec{c}' },
        {
          label: 'Eliminationsfaktor (LGS S. 14)',
          latex: 'Z_i^* = Z_i + \\left(-\\frac{a_{i1}}{a_{11}}\\right) \\cdot Z_1',
        },
      ],
      symbolTooltips: [
        { symbol: 'A', latex: 'A_{m,n}', meaning: 'Koeffizientenmatrix mit m Zeilen (Gleichungen) und n Spalten (Unbekannte)' },
        { symbol: 'c⃗', latex: '\\vec{c}', meaning: 'Vektor der Absolutglieder (rechte Seite); bei c⃗ = 0⃗ heißt das LGS homogen' },
      ],
      slideNote:
        'Hinweis zu Folie LGS S. 11: Im Schritt „(3 · II*)“ stehen noch versehentlich die unmultiplizierten Zahlen (−2y − z = 5 statt −6y − 3z = 15), das Ergebnis +6z = 18 rechnet aber korrekt mit dem 3-fachen.',
    },
    example: {
      title: '3×3-LGS Schritt für Schritt per Gauß lösen',
      problem: 'Löse $(I)\\; x+y+z=6$, $(II)\\; 2x-y+z=3$, $(III)\\; x+2y-z=2$.',
      steps: [
        {
          label: 'Schritt 1: x aus (II) und (III) eliminieren',
          content: '$(II^*) = (II) - 2(I): -3y - z = -9$. Und $(III^*) = (III) - (I): y - 2z = -4$.',
        },
        {
          label: 'Schritt 2: y aus (III*) eliminieren',
          content: '$(III^{**}) = 3(III^*) + (II^*): (3y - 6z) + (-3y - z) = -12 - 9 \\Rightarrow -7z = -21 \\Rightarrow z = 3$.',
          trick: 'Multipliziere vor dem Addieren so, dass Brüche vermieden werden – hier 3·(III*) statt durch −3 zu teilen!',
        },
        {
          label: 'Schritt 3: Rückwärtseinsetzen',
          content: 'In $(III^*)$: $y - 2(3) = -4 \\Rightarrow y = 2$. In $(I)$: $x + 2 + 3 = 6 \\Rightarrow x = 1$.',
        },
      ],
      finalResult: '$\\vec{x} = (1, 2, 3)^T$',
    },
    generatorIds: ['m2-gauss-lgs', 'm2-lgs-behavior'],
    summaryBullets: [
      'Gauß-Prinzip: Spalte für Spalte unter der Diagonalen Nullen erzeugen → dann rückwärts einsetzen.',
      'Homogenes LGS ($A\\vec{x}=\\vec{0}$) ist nie unlösbar (triviale Lösung $\\vec{x}=\\vec{0}$ existiert immer).',
      'Für quadratische Systeme gilt zusätzlich: $\\det(A) \\neq 0 \\iff$ eindeutige Lösung.',
    ],
    formulaSheetIds: ['fs-m2-lgs-det'],
  },
  {
    id: 'm2-2-matrizen-falk',
    moduleId: 'm2',
    order: 2,
    title: 'Matrizen-Grundrechenarten & Falk-Schema',
    subtitle: 'Addition, Transponieren & fehlerfreies Matrix-Multiplizieren',
    slideRef: 'Mathe II: Matrizen S. 7–21',
    estimatedMinutes: 18,
    intuition: {
      hook: 'Eine Matrix vom Typ $(m, n)$ ist schlicht eine geordnete Zahlentabelle mit $m$ Zeilen und $n$ Spalten – der Universal-Container für LGS und 3D-Transformationen.',
      analogy:
        'Das **Falk-Schema** ist wie eine Kreuzungstabelle: Du legst Matrix $A$ links hin und Matrix $B$ oben drüber. Jedes Ergebnisfeld liegt genau im Schnittpunkt „seiner“ Zeile aus $A$ und „seiner“ Spalte aus $B$ – Verrutschen fast unmöglich!',
    },
    visualization: {
      type: 'falk-schema',
      discoveryPrompt:
        'Fahre im interaktiven Falk-Schema über alle 9 Felder von $C$ (Originalbeispiel Matrizen S. 19–20) und beobachte, wie immer exakt eine blaue Zeile von $A$ mit einer grünen Spalte von $B$ das Skalarprodukt bildet.',
    },
    explanation: {
      paragraphs: [
        'Addition, Subtraktion und Skalarmultiplikation funktionieren genau wie bei Vektoren **eintragweise** (gleicher Typ $(m, n)$ nötig). Beim **Transponieren** ($A^T$) werden Zeilen zu Spalten gekippt. Die **Einheitsmatrix** $E$ (bzw. $I$) hat Einsen auf der Hauptdiagonalen und sonst Nullen.',
        'Bei der **Matrizenmultiplikation** $C = A \\cdot B$ musst du zuerst die **Dimensionsbedingung** prüfen: $A$ vom Typ $(m, n)$ mal $B$ vom Typ $(n, p)$ geht nur, wenn die beiden **Innenzahlen** gleich sind ($n = n$)! Das Ergebnis hat dann die Außenzahlen $(m, p)$.',
        'Achtung: Matrizenmultiplikation ist **nicht kommutativ** – im Allgemeinen gilt $A\\cdot B \\neq B\\cdot A$!',
      ],
      keyFormulas: [
        { label: 'Dimensionsregel', latex: 'A_{(m,n)} \\cdot B_{(n,p)} = C_{(m,p)}' },
        {
          label: 'Eintrag im Matrixprodukt (Skalarprodukt)',
          latex: 'c_{ik} = \\sum_{j=1}^{n} a_{ij} \\cdot b_{jk} = (\\text{Zeile } i \\text{ von } A) \\cdot (\\text{Spalte } k \\text{ von } B)',
        },
      ],
      symbolTooltips: [
        { symbol: 'Aᵀ', latex: 'A^T', meaning: 'Transponierte Matrix: Zeile i wird zu Spalte i' },
        { symbol: 'E / I', latex: 'E = I', meaning: 'Einheitsmatrix: neutrales Element der Multiplikation (A·E = E·A = A)' },
      ],
    },
    example: {
      title: 'Matrixprodukt per Falk-Schema berechnen',
      problem: 'Berechne $C = \\begin{pmatrix}1&2\\\\3&-1\\end{pmatrix} \\cdot \\begin{pmatrix}2&0&1\\\\-1&4&2\\end{pmatrix}$.',
      steps: [
        {
          label: 'Schritt 1: Dimensionen prüfen',
          content: '$(2, 2) \\cdot (2, 3) \\to$ Innenzahlen ($2=2$) passen! Ergebnis $C$ hat Typ $(2, 3)$.',
        },
        {
          label: 'Schritt 2: Erste Zeile von C (Zeile 1 von A mal jede Spalte von B)',
          content: '$c_{11}=1\\cdot 2+2(-1)=0$, $c_{12}=1\\cdot 0+2\\cdot 4=8$, $c_{13}=1\\cdot 1+2\\cdot 2=5$.',
        },
        {
          label: 'Schritt 3: Zweite Zeile von C',
          content: '$c_{21}=3\\cdot 2+(-1)(-1)=7$, $c_{22}=3\\cdot 0+(-1)\\cdot 4=-4$, $c_{23}=3\\cdot 1+(-1)\\cdot 2=1$.',
        },
      ],
      finalResult: '$C = \\begin{pmatrix}0&8&5\\\\7&-4&1\\end{pmatrix}$',
    },
    generatorIds: ['m2-matrix-ops', 'm2-matrix-mul'],
    summaryBullets: [
      'Produkt $A\\cdot B$ existiert genau dann, wenn Spaltenzahl von $A$ = Zeilenzahl von $B$.',
      'Immer das Falk-Schema auf Papier skizzieren ($A$ links, $B$ oben) – halbiert die Fehlerquote!',
      'Reihenfolge niemals vertauschen: $A\\cdot B \\neq B\\cdot A$.',
    ],
    formulaSheetIds: ['fs-m2-falk'],
  },
  {
    id: 'm2-3-determinanten',
    moduleId: 'm2',
    order: 3,
    title: 'Determinanten: 2×2, Sarrus, Laplace & Tricks',
    subtitle: 'Von 2×2 bis 5×5 souverän ohne Taschenrechner berechnen',
    slideRef: 'Mathe II: Matrizen S. 36–65',
    estimatedMinutes: 22,
    intuition: {
      hook: 'Die Determinante verdichtet eine ganze quadratische Matrix auf eine **einzige Kennzahl** – sie verrät dir sofort, ob ein LGS eindeutig lösbar ist und ob eine Inverse existiert.',
      analogy:
        'Geometrisch ist $|\\det A|$ der Flächen- bzw. Volumenfaktor der Matrix: Wird ein Einheitsquadrat auf Fläche $0$ plattgedrückt ($\\det A = 0$), kann man es nicht mehr rückgängig machen → keine Inverse!',
    },
    visualization: {
      type: 'sarrus-laplace',
      discoveryPrompt:
        'Klicke zuerst im **Sarrus-Tab** alle 3 Haupt- (+) und 3 Nebendiagonalen (−) durch. Wechsle dann zum **Laplace-Schachbrett** und klicke auf die `2` oben links: Warum spart genau diese Zeile 75 % der Rechenarbeit?',
    },
    explanation: {
      paragraphs: [
        'Für **$2\\times 2$** gilt: Hauptdiagonale minus Nebendiagonale ($a_{11}a_{22} - a_{12}a_{21}$). Für **$3\\times 3$** gilt die **Regel von Sarrus**: Spalte 1 & 2 rechts anhängen, 3 absteigende Produkte addieren, 3 aufsteigende subtrahieren. *(Achtung: Sarrus gilt NICHT für $4\\times 4$!)*',
        'Ab **$4\\times 4$** nutzt du den **Laplaceschen Entwicklungssatz**: Wähle die Zeile oder Spalte mit den **meisten Nullen**! Jedes Element $a_{ik}$ wird mit seinem Schachbrett-Vorzeichen $(-1)^{i+k}$ und seiner $(n-1)$-reihigen Unterdeterminante $D_{ik}$ multipliziert.',
        '**Goldene Abkürzungen (Matrizen S. 61 & 65):** (1) Vielfache einer Zeile/Spalte zu einer anderen addieren ändert $\\det A$ **nicht** (Nullen erzeugen!). (2) Zwei Zeilen/Spalten tauschen dreht das **Vorzeichen** um. (3) Eine Nullzeile, zwei gleiche oder zwei proportionale Zeilen/Spalten bedeuten **sofort $\\det A = 0$**!',
      ],
      keyFormulas: [
        { label: '2×2-Determinante', latex: '\\det(A) = a_{11}a_{22} - a_{12}a_{21}' },
        {
          label: 'Laplacescher Entwicklungssatz (nach Zeile i)',
          latex: 'D = \\sum_{k=1}^{n} a_{ik} \\cdot (-1)^{i+k} \\cdot D_{ik}',
        },
      ],
      symbolTooltips: [
        { symbol: 'Dᵢₖ', latex: 'D_{ik}', meaning: 'Unterdeterminante: entsteht durch Streichen der i-ten Zeile und k-ten Spalte' },
        { symbol: '(−1)ⁱ⁺ᵏ', latex: '(-1)^{i+k}', meaning: 'Schachbrett-Vorzeichen: oben links +, dann abwechselnd +, −, +, − ...' },
      ],
    },
    example: {
      title: '4×4-Determinante per Laplace + Sarrus lösen',
      problem: 'Berechne $D = \\begin{vmatrix}2&0&0&0\\\\1&3&1&0\\\\4&2&1&1\\\\0&1&2&2\\end{vmatrix}$.',
      steps: [
        {
          label: 'Schritt 1: Beste Zeile suchen',
          content: 'Zeile 1 hat drei Nullen! Nur $a_{11} = 2$ (Vorzeichen $(-1)^{1+1} = +1$) bleibt übrig.',
          trick: 'Vor jedem Rechnen erst 3 Sekunden nach Nullzeilen, proportionalen Zeilen oder Zeilen mit vielen Nullen scannen!',
        },
        {
          label: 'Schritt 2: 3×3-Unterdeterminante per Sarrus',
          content: '$D_{11} = \\begin{vmatrix}3&1&0\\\\2&1&1\\\\1&2&2\\end{vmatrix} = (6+1+0) - (0+6+4) = 7 - 10 = -3$.',
        },
        {
          label: 'Schritt 3: Zusammenführen',
          content: '$D = (+1)\\cdot 2 \\cdot (-3) = -6$.',
        },
      ],
      finalResult: '$D = -6$',
    },
    generatorIds: ['m2-det-3x3-sarrus', 'm2-det-4x4-laplace', 'm2-find-mistake'],
    summaryBullets: [
      'Sarrus NUR für $3\\times 3$; ab $4\\times 4$ immer Laplace + ggf. vorher Nullen erzeugen.',
      'Schachbrett-Vorzeichen $(-1)^{i+k}$ niemals vergessen!',
      'Nullzeile, identische oder proportionale Zeilen/Spalten $\\Rightarrow$ sofort $\\det A = 0$.',
    ],
    formulaSheetIds: ['fs-m2-det-rules'],
  },
  {
    id: 'm2-4-inverse-gauss-jordan',
    moduleId: 'm2',
    order: 4,
    title: 'Inverse Matrix (2×2-Formel & Gauß-Jordan)',
    subtitle: 'Matrizen „rückgängig“ machen – mit sicherer Kontrollprobe',
    slideRef: 'Mathe II: Matrizen S. 22–35, 42–43',
    estimatedMinutes: 20,
    intuition: {
      hook: 'Bei normalen Zahlen macht $\\frac{1}{5}$ die Multiplikation mit $5$ rückgängig ($5 \\cdot \\frac{1}{5} = 1$). Bei Matrizen übernimmt genau diese Rolle die **inverse Matrix** $A^{-1}$ ($A \\cdot A^{-1} = E$).',
      analogy:
        'Beim Gauß-Jordan-Verfahren stellst du $A$ und $E$ nebeneinander: Jeder Handgriff, der $A$ schrittweise in die Einheitsmatrix $E$ „zurückverwandelt“, wird gleichzeitig auf $E$ angewendet – dadurch baut sich rechts automatisch das exakte Rückgängig-Rezept $A^{-1}$ auf!',
    },
    visualization: {
      type: 'det-area-2d',
      discoveryPrompt:
        'Bewege die Slider der $2\\times 2$-Matrix so, dass die zweite Zeile ein Vielfaches der ersten wird (z. B. $a_{11}=2, a_{12}=1, a_{21}=2, a_{22}=1$): Warum klappt die Fläche zusammen und warum gibt es bei $\\det A = 0$ keine Inverse?',
    },
    explanation: {
      paragraphs: [
        'Eine quadratische Matrix $A$ besitzt **genau dann** eine Inverse $A^{-1}$, wenn **$\\det(A) \\neq 0$** gilt! Prüfe das in der Klausur immer zuerst, bevor du umsonst rechnest (Matrizen S. 35).',
        'Für **$2\\times 2$-Matrizen** gibt es die Blitzformel: Hauptdiagonale vertauschen ($a \\leftrightarrow d$), auf der Nebendiagonalen Minuszeichen setzen ($-b, -c$) und alles durch $\\det(A)$ teilen.',
        'Für **$3\\times 3$ und $4\\times 4$** nutzt du das **Gauß-Jordan-Verfahren**: Schreibe $[A \\mid E]$ hin und forme mit elementaren Zeilenoperationen so lange um, bis links exakt $E$ steht – dann steht rechts $A^{-1}$. Abschließend kannst du per Probe $A \\cdot A^{-1} = E$ deine Lösung zu 100 % absichern!',
      ],
      keyFormulas: [
        { label: 'Definition & Existenz', latex: 'A \\cdot A^{-1} = A^{-1} \\cdot A = E \\quad (\\text{existiert} \\iff \\det A \\neq 0)' },
        {
          label: '2×2-Inversenformel',
          latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}',
        },
        { label: 'Gauß-Jordan-Schema (n×n)', latex: '[\\; A \\mid E \\;] \\;\\xrightarrow{\\text{Zeilenumformungen}}\\; [\\; E \\mid A^{-1} \\;]' },
      ],
      symbolTooltips: [
        { symbol: 'A⁻¹', latex: 'A^{-1}', meaning: 'Inverse Matrix – NICHT 1/aᵢₖ für jeden Eintrag!' },
      ],
    },
    example: {
      title: '2×2-Inverse & Probe',
      problem: 'Bestimme die Inverse von $A = \\begin{pmatrix}3&2\\\\4&3\\end{pmatrix}$ und mache die Probe.',
      steps: [
        {
          label: 'Schritt 1: Determinante prüfen',
          content: '$\\det(A) = 3\\cdot 3 - 2\\cdot 4 = 9 - 8 = 1 \\neq 0 \\Rightarrow$ Inverse existiert!',
        },
        {
          label: 'Schritt 2: 2×2-Formel anwenden',
          content: '$A^{-1} = \\frac{1}{1}\\begin{pmatrix}3&-2\\\\-4&3\\end{pmatrix} = \\begin{pmatrix}3&-2\\\\-4&3\\end{pmatrix}$.',
        },
        {
          label: 'Schritt 3: Probe A · A⁻¹ = E',
          content: '$\\begin{pmatrix}3&2\\\\4&3\\end{pmatrix}\\begin{pmatrix}3&-2\\\\-4&3\\end{pmatrix} = \\begin{pmatrix}9-8&-6+6\\\\12-12&-8+9\\end{pmatrix} = \\begin{pmatrix}1&0\\\\0&1\\end{pmatrix} = E$ ✓.',
        },
      ],
      finalResult: '$A^{-1} = \\begin{pmatrix}3&-2\\\\-4&3\\end{pmatrix}$',
    },
    generatorIds: ['m2-det-2x2-inv', 'm2-gauss-jordan-3x3', 'm2-find-mistake'],
    summaryBullets: [
      'Vor dem Invertieren immer kurz $\\det(A) \\neq 0$ prüfen.',
      '2×2: Hauptdiagonale tauschen, Nebendiagonale Vorzeichen umdrehen, durch $\\det A$ teilen.',
      '3×3 / 4×4: Gauß-Jordan $[A\\mid E] \\to [E\\mid A^{-1}]$ (du kannst das auch in der Werkbank in Lektion 2.1 live testen!).',
    ],
    formulaSheetIds: ['fs-m2-inverse'],
  },
];
