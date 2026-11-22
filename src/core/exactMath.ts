/**
 * Exact arithmetic kernel for calculator-free math exercises.
 * Operates on exact reduced Fractions, simplified square roots, 2D/3D vectors,
 * and arbitrary-size exact Matrices (with Falk multiplication, determinant, Gauss-Jordan inverse).
 */

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

export class Fraction {
  readonly num: number;
  readonly den: number;

  constructor(num: number, den = 1) {
    if (!Number.isFinite(num) || !Number.isFinite(den)) {
      throw new Error('Fraction requires finite numbers');
    }
    if (den === 0) {
      throw new Error('Division by zero in Fraction');
    }
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      const scale = 1_000_000;
      const nInt = Math.round(num * scale);
      const dInt = Math.round(den * scale);
      const sign = dInt < 0 ? -1 : 1;
      const g = gcd(nInt, dInt);
      this.num = (sign * nInt) / g;
      this.den = Math.abs(dInt) / g;
      return;
    }
    const sign = den < 0 ? -1 : 1;
    const g = gcd(num, den);
    this.num = (sign * num) / g;
    this.den = Math.abs(den) / g;
  }

  static from(value: number | Fraction): Fraction {
    return value instanceof Fraction ? value : new Fraction(value, 1);
  }

  add(other: Fraction | number): Fraction {
    const b = Fraction.from(other);
    return new Fraction(this.num * b.den + b.num * this.den, this.den * b.den);
  }

  sub(other: Fraction | number): Fraction {
    const b = Fraction.from(other);
    return new Fraction(this.num * b.den - b.num * this.den, this.den * b.den);
  }

  mul(other: Fraction | number): Fraction {
    const b = Fraction.from(other);
    return new Fraction(this.num * b.num, this.den * b.den);
  }

  div(other: Fraction | number): Fraction {
    const b = Fraction.from(other);
    if (b.num === 0) throw new Error('Division by zero');
    return new Fraction(this.num * b.den, this.den * b.num);
  }

  neg(): Fraction {
    return new Fraction(-this.num, this.den);
  }

  abs(): Fraction {
    return new Fraction(Math.abs(this.num), this.den);
  }

  equals(other: Fraction | number): boolean {
    const b = Fraction.from(other);
    return this.num === b.num && this.den === b.den;
  }

  isZero(): boolean {
    return this.num === 0;
  }

  isInteger(): boolean {
    return this.den === 1;
  }

  toNumber(): number {
    return this.num / this.den;
  }

  toString(): string {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }

  toLatex(): string {
    if (this.den === 1) return `${this.num}`;
    if (this.num < 0) return `-\\frac{${Math.abs(this.num)}}{${this.den}}`;
    return `\\frac{${this.num}}{${this.den}}`;
  }
}

export function simplifySqrt(n: number): { coeff: number; radicand: number } {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`simplifySqrt requires non-negative integer, got ${n}`);
  }
  if (n === 0) return { coeff: 0, radicand: 1 };
  let coeff = 1;
  let rem = n;
  for (let d = 2; d * d <= rem; d++) {
    while (rem % (d * d) === 0) {
      coeff *= d;
      rem /= d * d;
    }
  }
  return { coeff, radicand: rem };
}

export function formatSimplifiedSqrtLatex(n: number): string {
  const { coeff, radicand } = simplifySqrt(n);
  if (radicand === 1) return `${coeff}`;
  if (coeff === 1) return `\\sqrt{${radicand}}`;
  return `${coeff}\\sqrt{${radicand}}`;
}

export function formatSimplifiedSqrtInput(n: number): string {
  const { coeff, radicand } = simplifySqrt(n);
  if (radicand === 1) return `${coeff}`;
  if (coeff === 1) return `sqrt(${radicand})`;
  return `${coeff}*sqrt(${radicand})`;
}

export class Vec2 {
  readonly x: Fraction;
  readonly y: Fraction;

  constructor(x: number | Fraction, y: number | Fraction) {
    this.x = Fraction.from(x);
    this.y = Fraction.from(y);
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x.add(v.x), this.y.add(v.y));
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x.sub(v.x), this.y.sub(v.y));
  }

  scale(k: number | Fraction): Vec2 {
    return new Vec2(this.x.mul(k), this.y.mul(k));
  }

  dot(v: Vec2): Fraction {
    return this.x.mul(v.x).add(this.y.mul(v.y));
  }

  normSquared(): Fraction {
    return this.dot(this);
  }

  equals(v: Vec2): boolean {
    return this.x.equals(v.x) && this.y.equals(v.y);
  }

  isZero(): boolean {
    return this.x.isZero() && this.y.isZero();
  }

  toArray(): [Fraction, Fraction] {
    return [this.x, this.y];
  }

  toStringArray(): [string, string] {
    return [this.x.toString(), this.y.toString()];
  }

  toLatex(): string {
    return `\\begin{pmatrix} ${this.x.toLatex()} \\\\ ${this.y.toLatex()} \\end{pmatrix}`;
  }
}

export class Vec3 {
  readonly x: Fraction;
  readonly y: Fraction;
  readonly z: Fraction;

  constructor(x: number | Fraction, y: number | Fraction, z: number | Fraction) {
    this.x = Fraction.from(x);
    this.y = Fraction.from(y);
    this.z = Fraction.from(z);
  }

  add(v: Vec3): Vec3 {
    return new Vec3(this.x.add(v.x), this.y.add(v.y), this.z.add(v.z));
  }

  sub(v: Vec3): Vec3 {
    return new Vec3(this.x.sub(v.x), this.y.sub(v.y), this.z.sub(v.z));
  }

  scale(k: number | Fraction): Vec3 {
    return new Vec3(this.x.mul(k), this.y.mul(k), this.z.mul(k));
  }

  dot(v: Vec3): Fraction {
    return this.x.mul(v.x).add(this.y.mul(v.y)).add(this.z.mul(v.z));
  }

  cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y.mul(v.z).sub(this.z.mul(v.y)),
      this.z.mul(v.x).sub(this.x.mul(v.z)),
      this.x.mul(v.y).sub(this.y.mul(v.x))
    );
  }

  normSquared(): Fraction {
    return this.dot(this);
  }

  projectOnto(target: Vec3): Vec3 {
    const denom = target.normSquared();
    if (denom.isZero()) throw new Error('Cannot project onto zero vector');
    const factor = this.dot(target).div(denom);
    return target.scale(factor);
  }

  equals(v: Vec3): boolean {
    return this.x.equals(v.x) && this.y.equals(v.y) && this.z.equals(v.z);
  }

  isZero(): boolean {
    return this.x.isZero() && this.y.isZero() && this.z.isZero();
  }

  isOrthogonalTo(v: Vec3): boolean {
    return this.dot(v).isZero();
  }

  isCollinearWith(v: Vec3): boolean {
    return this.cross(v).isZero();
  }

  toArray(): [Fraction, Fraction, Fraction] {
    return [this.x, this.y, this.z];
  }

  toStringArray(): [string, string, string] {
    return [this.x.toString(), this.y.toString(), this.z.toString()];
  }

  toLatex(): string {
    return `\\begin{pmatrix} ${this.x.toLatex()} \\\\ ${this.y.toLatex()} \\\\ ${this.z.toLatex()} \\end{pmatrix}`;
  }
}

/** Exact Matrix with Fraction entries */
export class Matrix {
  readonly rows: number;
  readonly cols: number;
  readonly data: Fraction[][];

  constructor(entries: (number | Fraction)[][]) {
    this.rows = entries.length;
    this.cols = entries[0]?.length ?? 0;
    this.data = entries.map((row) => row.map((v) => Fraction.from(v)));
  }

  static identity(n: number): Matrix {
    const data: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
    return new Matrix(data);
  }

  get(r: number, c: number): Fraction {
    return this.data[r][c];
  }

  add(other: Matrix): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions mismatch for addition');
    }
    return new Matrix(
      this.data.map((row, r) => row.map((val, c) => val.add(other.data[r][c])))
    );
  }

  sub(other: Matrix): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions mismatch for subtraction');
    }
    return new Matrix(
      this.data.map((row, r) => row.map((val, c) => val.sub(other.data[r][c])))
    );
  }

  scale(k: number | Fraction): Matrix {
    return new Matrix(this.data.map((row) => row.map((val) => val.mul(k))));
  }

  transpose(): Matrix {
    const res: Fraction[][] = Array.from({ length: this.cols }, (_, c) =>
      Array.from({ length: this.rows }, (_, r) => this.data[r][c])
    );
    return new Matrix(res);
  }

  mul(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new Error(`Cannot multiply (${this.rows}x${this.cols}) by (${other.rows}x${other.cols})`);
    }
    const res: Fraction[][] = Array.from({ length: this.rows }, (_, i) =>
      Array.from({ length: other.cols }, (_, k) => {
        let sum = new Fraction(0);
        for (let j = 0; j < this.cols; j++) {
          sum = sum.add(this.data[i][j].mul(other.data[j][k]));
        }
        return sum;
      })
    );
    return new Matrix(res);
  }

  /** Multiply matrix by column vector (as Fraction[]) */
  mulVec(vec: (number | Fraction)[]): Fraction[] {
    if (this.cols !== vec.length) {
      throw new Error('Matrix/vector dimension mismatch');
    }
    return this.data.map((row) =>
      row.reduce((sum, val, j) => sum.add(val.mul(vec[j])), new Fraction(0))
    );
  }

  /** Exact minor removing row r and col c */
  minor(skipRow: number, skipCol: number): Matrix {
    const sub: Fraction[][] = [];
    for (let r = 0; r < this.rows; r++) {
      if (r === skipRow) continue;
      const row: Fraction[] = [];
      for (let c = 0; c < this.cols; c++) {
        if (c === skipCol) continue;
        row.push(this.data[r][c]);
      }
      sub.push(row);
    }
    return new Matrix(sub);
  }

  /** Exact determinant via Laplace / closed-form */
  det(): Fraction {
    if (this.rows !== this.cols) {
      throw new Error('Determinant requires square matrix');
    }
    const n = this.rows;
    if (n === 1) return this.data[0][0];
    if (n === 2) {
      return this.data[0][0].mul(this.data[1][1]).sub(this.data[0][1].mul(this.data[1][0]));
    }
    let total = new Fraction(0);
    for (let c = 0; c < n; c++) {
      const entry = this.data[0][c];
      if (entry.isZero()) continue;
      const sign = c % 2 === 0 ? 1 : -1;
      total = total.add(entry.mul(sign).mul(this.minor(0, c).det()));
    }
    return total;
  }

  /** Exact inverse via Gauss-Jordan elimination (returns null if singular) */
  inverse(): Matrix | null {
    if (this.rows !== this.cols) return null;
    const n = this.rows;
    const aug: Fraction[][] = this.data.map((row, r) => [
      ...row,
      ...Array.from({ length: n }, (_, c) => new Fraction(r === c ? 1 : 0)),
    ]);

    for (let col = 0; col < n; col++) {
      // Find pivot
      let pivotRow = -1;
      for (let r = col; r < n; r++) {
        if (!aug[r][col].isZero()) {
          pivotRow = r;
          break;
        }
      }
      if (pivotRow === -1) return null;
      if (pivotRow !== col) {
        [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
      }
      const pivotVal = aug[col][col];
      for (let j = 0; j < 2 * n; j++) {
        aug[col][j] = aug[col][j].div(pivotVal);
      }
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = aug[r][col];
        if (factor.isZero()) continue;
        for (let j = 0; j < 2 * n; j++) {
          aug[r][j] = aug[r][j].sub(factor.mul(aug[col][j]));
        }
      }
    }

    return new Matrix(aug.map((row) => row.slice(n)));
  }

  equals(other: Matrix): boolean {
    if (this.rows !== other.rows || this.cols !== other.cols) return false;
    return this.data.every((row, r) => row.every((val, c) => val.equals(other.data[r][c])));
  }

  toFlatStrings(): string[] {
    return this.data.flat().map((f) => f.toString());
  }

  toLatex(env: 'pmatrix' | 'vmatrix' = 'pmatrix'): string {
    const body = this.data.map((row) => row.map((f) => f.toLatex()).join(' & ')).join(' \\\\ ');
    return `\\begin{${env}} ${body} \\end{${env}}`;
  }
}
