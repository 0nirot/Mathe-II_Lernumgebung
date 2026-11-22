# Interaktive Lernumgebung: Mathe II & 3D-Computergrafik (ohne Taschenrechner)

Vollständige lokale Web-Lernanwendung zur Vorbereitung auf die Mathematikprüfung am **15.12.2026** (ohne Taschenrechner, mit 1 selbstgeschriebenem DIN-A4-Formelblatt). Alle Inhalte orientieren sich direkt an den 7 Vorlesungsfoliensätzen von Dr. Andreas Jäger (*ohne* Vektorraum-Theorie S. 41–62).

## Enthaltene Module & Funktionen (Vollversion M0–M5)
- **Modul 0 – Grundlagen & Trigonometrie (4 Lektionen + optionaler 8-Fragen-Eingangscheck):** Vorzeichen/Brüche/Wurzeln, Gleichungen, Pythagoras & 2D-Gerade, Grad ↔ Bogenmaß & exakte Einheitskreis-Werte.
- **Modul 1 – Vektoralgebra (4 Lektionen):** Vektoren & Beträge, Skalarprodukt & Winkel, Vektorprojektion, Kreuzprodukt & 3D-Flächen (inkl. 3D-Bühne #1).
- **Modul 2 – LGS, Matrizen & Determinanten (4 Lektionen):** Gauß-Workbench & Lösungsverhalten, Matrixoperationen & Falk-Schema, Determinanten (2×2, Sarrus, Laplace), 2×2- & 3×3-Inverse (Gauß-Jordan).
- **Modul 3 – Analytische Geometrie im Raum (4 Lektionen):** Geraden & Abstände, Lagebeziehungen & windschiefe Geraden (3D-Bühne #3), Ebenen & Hesse-Normalform, Schnitte & Winkel (3D-Bühne #2).
- **Modul 4 – Lineare & Affine Abbildungen (3 Lektionen):** Linear vs. Affin & 2D-Homogene Matrizen (2D-Transform-Labor), Verkettung & Drehung um beliebigen Punkt, 3D-Transformationen & $T_{Ry}$-Vorzeichenfalle (3D-Bühne #4) sowie Konzept der freien Drehachse.
- **Modul 5 – Interpolation (3 Lektionen):** 1D lineare Interpolation & 1D-Canvas, 2D bilineare Interpolation (4-Nachbarn-Farbgitter), Verfahren & Resizing-Artefakte im Vergleich (Nearest-Neighbor vs. Bilinear vs. Spline/Bikubisch).
- **39 taschenrechnerfreie Aufgabengeneratoren** mit exakter Bruchrechnung, Wurzel-Vereinfachung, Fehler-Diagnose (`bugDiagnostics`), 3-stufigen Hinweisen und automatischer Vitest-Qualitätssicherung.
- **SM-2 Spaced Repetition (`Wiederholung (SRS)`):** Entscheidungs-Karten, Kopfrechen-Reflexe und dynamische Schwächen-Karten aus Übungen & Klausuren.
- **Prüfungsmodus (4 Presets):** Vollklausur (90 Min.), Nur Mathe II (60 Min.), Nur 3D & CG (45 Min.), Einzelmodul-Kurztest (25 Min.) mit Teilpunkten pro Kontrollwert, aufklappbarem 1-Blatt-Formelblatt und 1-Klick-Übernahme von Schwächen ins SRS.
- **Komplettes DIN-A4-Formelblatt (Vorder- & Rückseite):** Abhakbar, druckfreundlich, ohne Beispiele.
- **100 % lokal:** Speicherung in IndexedDB (`Dexie.js`) inkl. JSON-Backup Export/Import und Light/Dark Mode.

## Starten
1. Doppelklick auf `start.bat` im Projektordner **oder**
2. Im Terminal:
   ```bash
   npm install
   npm run dev
   ```
3. Tests ausführen:
   ```bash
   npm test
   ```
