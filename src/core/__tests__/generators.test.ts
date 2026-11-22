import { describe, expect, it } from 'vitest';
import { M0_LESSONS } from '../../content/m0Content';
import { M1_LESSONS } from '../../content/m1Content';
import { M2_LESSONS } from '../../content/m2Content';
import { M3_LESSONS } from '../../content/m3Content';
import { M4_LESSONS } from '../../content/m4Content';
import { M5_LESSONS } from '../../content/m5Content';
import { FORMULA_SHEET_ITEMS } from '../../content/modules';
import { evaluateCheckpoint } from '../evaluator';
import { ALL_GENERATORS } from '../generators';
import { generateM0DiagnosticSuite } from '../generators/m0Generators';
import { createRng } from '../generators/random';
import { parseMathExpression } from '../mathParser';

const RUNS_PER_GENERATOR = 200;

describe('Property Tests: Alle M0–M5-Aufgabengeneratoren (200 Durchläufe je Typ)', () => {
  for (const [genId, genFn] of Object.entries(ALL_GENERATORS)) {
    it(`${genId}: erzeugt ${RUNS_PER_GENERATOR} valide, taschenrechnerfreie Aufgaben`, () => {
      const rng = createRng(4200 + genId.length * 17);

      for (let i = 0; i < RUNS_PER_GENERATOR; i++) {
        const task = genFn(rng);
        expect(task.generatorId).toBe(genId);
        expect(task.prompt.length).toBeGreaterThan(10);
        expect(task.hints).toHaveLength(3);
        expect(task.fullSolutionSteps.length).toBeGreaterThan(0);
        expect(task.checkpoints.length).toBeGreaterThan(0);

        for (const cp of task.checkpoints) {
          // 1. Canonical expected answer must always evaluate as valid & correct!
          const res = evaluateCheckpoint(cp, cp.expected);
          expect(res.isValidSyntax).toBe(true);
          expect(res.isCorrect).toBe(true);

          // 2. Numeric sanity check: no NaN / Infinity, bounded calculator-free magnitudes
          if (cp.kind === 'scalar' && typeof cp.expected === 'string') {
            const p = parseMathExpression(cp.expected);
            expect(p.ok).toBe(true);
            if (p.ok) {
              expect(Number.isFinite(p.value)).toBe(true);
              expect(Math.abs(p.value)).toBeLessThan(1000);
            }
          } else if (
            (cp.kind === 'vector2' || cp.kind === 'vector3' || cp.kind === 'matrix') &&
            Array.isArray(cp.expected)
          ) {
            for (const comp of cp.expected) {
              const p = parseMathExpression(comp);
              expect(p.ok).toBe(true);
              if (p.ok) {
                expect(Number.isFinite(p.value)).toBe(true);
                expect(Math.abs(p.value)).toBeLessThan(500);
              }
            }
          }

          // 3. Bug diagnostics (when distinct from expected) must trigger helpful feedback
          if (cp.bugDiagnostics) {
            for (const bug of cp.bugDiagnostics) {
              if (bug.matchScalar && cp.kind === 'scalar') {
                const expCheck = evaluateCheckpoint(cp, bug.matchScalar);
                if (!expCheck.isCorrect) {
                  expect(expCheck.diagnosticMessage).toBeDefined();
                }
              }
              if (bug.matchVector && (cp.kind === 'vector2' || cp.kind === 'vector3')) {
                const expCheck = evaluateCheckpoint(cp, bug.matchVector);
                if (!expCheck.isCorrect) {
                  expect(expCheck.diagnosticMessage).toBeDefined();
                }
              }
            }
          }
        }
      }
    });
  }

  it('M0-8-Fragen-Eingangscheck liefert exakt 8 unterschiedliche Bausteine', () => {
    const suite = generateM0DiagnosticSuite(createRng(12345));
    expect(suite).toHaveLength(8);
    const keys = new Set(suite.map((q) => q.skillKey));
    expect(keys.size).toBe(8);
  });

  it('Alle 22 Lektionen (M0–M5) referenzieren gültige Generatoren und Formelblatt-IDs', () => {
    const allLessons = [
      ...M0_LESSONS,
      ...M1_LESSONS,
      ...M2_LESSONS,
      ...M3_LESSONS,
      ...M4_LESSONS,
      ...M5_LESSONS,
    ];
    expect(allLessons).toHaveLength(22);

    const formulaIds = new Set(FORMULA_SHEET_ITEMS.map((f) => f.id));
    for (const lesson of allLessons) {
      expect(lesson.generatorIds.length).toBeGreaterThan(0);
      for (const gid of lesson.generatorIds) {
        expect(ALL_GENERATORS[gid], `Generator ${gid} in ${lesson.id}`).toBeDefined();
      }
      for (const fid of lesson.formulaSheetIds) {
        expect(formulaIds.has(fid), `FormulaSheet ID ${fid} in ${lesson.id}`).toBe(true);
      }
    }
  });
});
