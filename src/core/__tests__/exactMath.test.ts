import { describe, expect, it } from 'vitest';
import { Fraction, Matrix, Vec2, Vec3, simplifySqrt } from '../exactMath';
import { evaluateCheckpoint } from '../evaluator';
import {
  checkScalarEquivalence,
  checkVectorEquivalence,
  parseMathExpression,
} from '../mathParser';

describe('ExactMath: Fraction, Roots & Vectors', () => {
  it('performs exact reduced fraction arithmetic without floating drift', () => {
    const a = new Fraction(1, 3);
    const b = new Fraction(1, 6);
    expect(a.add(b).toString()).toBe('1/2');
    expect(new Fraction(1, 10).add(new Fraction(2, 10)).equals(new Fraction(3, 10))).toBe(true);
    expect(new Fraction(4, -6).toString()).toBe('-2/3');
    expect(new Fraction(3, 4).div(new Fraction(3, 8)).toString()).toBe('2');
  });

  it('simplifies square roots cleanly', () => {
    expect(simplifySqrt(18)).toEqual({ coeff: 3, radicand: 2 });
    expect(simplifySqrt(9)).toEqual({ coeff: 3, radicand: 1 });
    expect(simplifySqrt(12)).toEqual({ coeff: 2, radicand: 3 });
    expect(simplifySqrt(7)).toEqual({ coeff: 1, radicand: 7 });
  });

  it('computes exact Vec2 and Vec3 operations', () => {
    const a = new Vec3(2, 0, 0);
    const b = new Vec3(1, 3, 0);
    const c = a.cross(b);
    expect(c.toStringArray()).toEqual(['0', '0', '6']);
    expect(c.isOrthogonalTo(a)).toBe(true);
    expect(c.isOrthogonalTo(b)).toBe(true);

    const p = new Vec3(1, 0, 1).projectOnto(new Vec3(1, 1, 0));
    expect(p.toStringArray()).toEqual(['1/2', '1/2', '0']);

    const v2 = new Vec2(3, 4);
    expect(v2.normSquared().toNumber()).toBe(25);
  });
});

describe('MathParser & Equivalence Checker', () => {
  it('accepts German commas, fractions, roots, pi, and degree symbols', () => {
    expect(checkScalarEquivalence('0,5', '1/2').isCorrect).toBe(true);
    expect(checkScalarEquivalence('0.5', '1/2').isCorrect).toBe(true);
    expect(checkScalarEquivalence('2/4', '1/2').isCorrect).toBe(true);
    expect(checkScalarEquivalence('2/4', '1/2').styleTip).toBeDefined();
    expect(checkScalarEquivalence('1/sqrt(2)', 'sqrt(2)/2').isCorrect).toBe(true);
    expect(checkScalarEquivalence('1/√2', 'sqrt(2)/2').isCorrect).toBe(true);
    expect(checkScalarEquivalence('3π/4', '3*pi/4').isCorrect).toBe(true);
    expect(checkScalarEquivalence('60°', '60').isCorrect).toBe(true);
    expect(checkScalarEquivalence('2√3', 'sqrt(12)').isCorrect).toBe(true);
    expect(parseMathExpression('abc').ok).toBe(false);
  });

  it('supports exact and geometric collinear equivalence for vectors', () => {
    expect(checkVectorEquivalence(['0,5', '1/2', '0'], ['1/2', '1/2', '0'], 'exact').isCorrect).toBe(
      true
    );
    expect(
      checkVectorEquivalence(['-2', '-4', '2'], ['1', '2', '-1'], 'collinear-nonzero').isCorrect
    ).toBe(true);
    expect(
      checkVectorEquivalence(['0', '0', '0'], ['1', '2', '-1'], 'collinear-nonzero').isCorrect
    ).toBe(false);
    expect(
      checkVectorEquivalence(['1', '2', '1'], ['1', '2', '-1'], 'collinear-nonzero').isCorrect
    ).toBe(false);
  });

  it('computes exact Matrix operations (mul, det, inverse) and geometric point-on-line equivalence', () => {
    const A = new Matrix([
      [3, 0, 2],
      [2, 0, -2],
      [0, 1, 1],
    ]);
    expect(A.det().toString()).toBe('10');
    const inv = A.inverse();
    expect(inv).not.toBeNull();
    expect(A.mul(inv!).equals(Matrix.identity(3))).toBe(true);

    // Geometric point-on-line equivalence: p0 = (0,2,1), dir = (1,-1,1) -> (2,0,3) is also valid!
    const cp = {
      id: 'r0',
      label: 'Stützpunkt',
      kind: 'vector3' as const,
      expected: ['0', '2', '1'],
      geoCheck: {
        type: 'point-on-line' as const,
        origin: ['0', '2', '1'] as [string, string, string],
        dir: ['1', '-1', '1'] as [string, string, string],
      },
      solutionLatex: '(0,2,1)^T',
      points: 2,
    };
    expect(evaluateCheckpoint(cp, ['2', '0', '3']).isCorrect).toBe(true);
    expect(evaluateCheckpoint(cp, ['2', '0', '3']).styleTip).toBeDefined();
    expect(evaluateCheckpoint(cp, ['2', '1', '3']).isCorrect).toBe(false);
  });
});
