/**
 * Forgiving recursive-descent parser & mathematical equivalence checker.
 * Supports German commas (0,5), dots (0.5), fractions (3/4), roots (sqrt(2), √2, 2√3),
 * pi expressions (3pi/4, 3π/4), degree symbols (60°), parentheses, and basic + - * / ^.
 * NEVER uses eval() or Function().
 */

export interface ParseResult {
  ok: true;
  value: number;
  normalizedRaw: string;
}

export interface ParseError {
  ok: false;
  reason: string;
}

type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; value: 'pi' | 'sqrt' }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function preprocess(raw: string): string {
  let s = raw.trim();
  // Remove degree symbol and spaces
  s = s.replace(/°/g, '');
  // Normalize unicode minus, multiplication dot/cross, colon division
  s = s.replace(/[−–—]/g, '-');
  s = s.replace(/[·×]/g, '*');
  s = s.replace(/:/g, '/');
  // Normalize German decimal comma -> dot
  s = s.replace(/,/g, '.');
  // Normalize unicode pi and sqrt
  s = s.replace(/π/gi, 'pi');
  // Convert √(expr) or √12 to sqrt(...)
  s = s.replace(/√\s*\(/g, 'sqrt(');
  s = s.replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)');
  // Normalize case
  s = s.toLowerCase();
  // Strip whitespace
  s = s.replace(/\s+/g, '');
  return s;
}

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let start = i;
      let dotCount = 0;
      while (i < input.length && ((input[i] >= '0' && input[i] <= '9') || input[i] === '.')) {
        if (input[i] === '.') dotCount++;
        i++;
      }
      if (dotCount > 1) return null;
      const numStr = input.slice(start, i);
      const val = Number(numStr);
      if (!Number.isFinite(val)) return null;
      tokens.push({ type: 'num', value: val });
      continue;
    }
    if (input.startsWith('sqrt', i)) {
      tokens.push({ type: 'ident', value: 'sqrt' });
      i += 4;
      continue;
    }
    if (input.startsWith('pi', i)) {
      tokens.push({ type: 'ident', value: 'pi' });
      i += 2;
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    return null;
  }

  // Insert implicit multiplication: e.g. 2pi, 2sqrt(3), 2(3+1), (2)(3), pi(2)
  const expanded: Token[] = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const cur = tokens[idx];
    if (idx > 0) {
      const prev = tokens[idx - 1];
      const prevEndsValue =
        prev.type === 'num' ||
        prev.type === 'rparen' ||
        (prev.type === 'ident' && prev.value === 'pi');
      const curStartsValue =
        cur.type === 'ident' || cur.type === 'lparen' || cur.type === 'num';
      if (prevEndsValue && curStartsValue) {
        expanded.push({ type: 'op', value: '*' });
      }
    }
    expanded.push(cur);
  }
  return expanded;
}

export function parseMathExpression(raw: string): ParseResult | ParseError {
  if (!raw || !raw.trim()) {
    return { ok: false, reason: 'Bitte gib einen Wert ein.' };
  }
  const normalizedRaw = preprocess(raw);
  const tokens = tokenize(normalizedRaw);
  if (!tokens || tokens.length === 0) {
    return {
      ok: false,
      reason: 'Ungültige Eingabe. Beispiele: -3/4, 0,5, sqrt(2), 3pi/4',
    };
  }

  let pos = 0;
  const peek = (): Token | undefined => tokens[pos];
  const consume = (): Token => tokens[pos++];

  function parseAddSub(): number {
    let left = parseMulDiv();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
        consume();
        const right = parseMulDiv();
        left = t.value === '+' ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseMulDiv(): number {
    let left = parsePower();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
        consume();
        const right = parsePower();
        if (t.value === '/') {
          if (Math.abs(right) < 1e-15) throw new Error('Division durch 0');
          left = left / right;
        } else {
          left = left * right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  function parsePower(): number {
    let base = parseUnary();
    const t = peek();
    if (t && t.type === 'op' && t.value === '^') {
      consume();
      const exp = parsePower();
      base = Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    const t = peek();
    if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
      consume();
      const val = parseUnary();
      return t.value === '-' ? -val : val;
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const t = peek();
    if (!t) throw new Error('Unerwartetes Ende des Ausdrucks');
    if (t.type === 'num') {
      consume();
      return t.value;
    }
    if (t.type === 'ident' && t.value === 'pi') {
      consume();
      return Math.PI;
    }
    if (t.type === 'ident' && t.value === 'sqrt') {
      consume();
      const next = peek();
      if (next && next.type === 'lparen') {
        consume();
        const inner = parseAddSub();
        const close = peek();
        if (!close || close.type !== 'rparen') {
          throw new Error('Schließende Klammer bei sqrt(...) fehlt');
        }
        consume();
        if (inner < -1e-12) throw new Error('Wurzel aus negativer Zahl');
        return Math.sqrt(Math.max(0, inner));
      }
      // Allow sqrt2 shorthand
      const arg = parsePrimary();
      if (arg < -1e-12) throw new Error('Wurzel aus negativer Zahl');
      return Math.sqrt(Math.max(0, arg));
    }
    if (t.type === 'lparen') {
      consume();
      const inner = parseAddSub();
      const close = peek();
      if (!close || close.type !== 'rparen') {
        throw new Error('Schließende Klammer fehlt');
      }
      consume();
      return inner;
    }
    throw new Error('Unerwartetes Symbol');
  }

  try {
    const value = parseAddSub();
    if (pos !== tokens.length || !Number.isFinite(value)) {
      return { ok: false, reason: 'Ausdruck konnte nicht vollständig gelesen werden.' };
    }
    return { ok: true, value, normalizedRaw };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'Ungültiger Ausdruck',
    };
  }
}

export interface EquivalenceCheckResult {
  isValidSyntax: boolean;
  isCorrect: boolean;
  parseError?: string;
  /** Gentle tip if mathematically correct, e.g. fraction can be reduced or denominator rationalized */
  styleTip?: string;
}

/**
 * Checks whether a user scalar input is mathematically equivalent to the expected scalar expression.
 */
export function checkScalarEquivalence(
  userInput: string,
  expectedExpr: string,
  tolerance = 1e-6
): EquivalenceCheckResult {
  const parsedUser = parseMathExpression(userInput);
  if (!parsedUser.ok) {
    return { isValidSyntax: false, isCorrect: false, parseError: parsedUser.reason };
  }
  const parsedExpected = parseMathExpression(expectedExpr);
  if (!parsedExpected.ok) {
    throw new Error(`Invalid expected expression in task: ${expectedExpr}`);
  }

  const diff = Math.abs(parsedUser.value - parsedExpected.value);
  const scale = Math.max(1, Math.abs(parsedExpected.value));
  const isCorrect = diff <= tolerance * scale;

  let styleTip: string | undefined;
  if (isCorrect) {
    // Check for unreduced simple integer fraction a/b
    const fracMatch = parsedUser.normalizedRaw.match(/^(-?\d+)\/(\d+)$/);
    if (fracMatch) {
      const n = Math.abs(Number(fracMatch[1]));
      const d = Number(fracMatch[2]);
      if (d > 1) {
        let a = n;
        let b = d;
        while (b !== 0) {
          const t = b;
          b = a % b;
          a = t;
        }
        if (a > 1) {
          styleTip = `Tipp: Dein Bruch lässt sich noch durch ${a} kürzen.`;
        }
      }
    }
    // Check for root in denominator like 1/sqrt(2)
    if (!styleTip && /\/.*sqrt/.test(parsedUser.normalizedRaw)) {
      styleTip = 'Tipp: In der Klausur macht man den Nenner gern wurzelfrei (rationalisieren).';
    }
  }

  return { isValidSyntax: true, isCorrect, styleTip };
}

/**
 * Checks vector equivalence (either exact componentwise or collinear non-zero for direction/normal vectors).
 */
export function checkVectorEquivalence(
  userInputs: string[],
  expectedExprs: string[],
  mode: 'exact' | 'collinear-nonzero' = 'exact',
  tolerance = 1e-6
): EquivalenceCheckResult {
  if (userInputs.length !== expectedExprs.length) {
    return { isValidSyntax: false, isCorrect: false, parseError: 'Falsche Vektor-Dimension.' };
  }

  const userVals: number[] = [];
  const expVals: number[] = [];

  for (let i = 0; i < userInputs.length; i++) {
    const pu = parseMathExpression(userInputs[i]);
    if (!pu.ok) {
      return {
        isValidSyntax: false,
        isCorrect: false,
        parseError: `Eintrag ${i + 1}: ${pu.reason}`,
      };
    }
    const pe = parseMathExpression(expectedExprs[i]);
    if (!pe.ok) {
      throw new Error(`Invalid expected vector component: ${expectedExprs[i]}`);
    }
    userVals.push(pu.value);
    expVals.push(pe.value);
  }

  if (mode === 'exact') {
    const allMatch = userVals.every(
      (v, i) => Math.abs(v - expVals[i]) <= tolerance * Math.max(1, Math.abs(expVals[i]))
    );
    return { isValidSyntax: true, isCorrect: allMatch };
  }

  // Collinear non-zero check: user vector != 0 and exists scalar k != 0 with u = k * e
  const userNormSq = userVals.reduce((s, v) => s + v * v, 0);
  if (userNormSq < tolerance * tolerance) {
    return { isValidSyntax: true, isCorrect: false };
  }

  // Find largest-magnitude component of expected to compute ratio k
  let pivotIdx = 0;
  for (let i = 1; i < expVals.length; i++) {
    if (Math.abs(expVals[i]) > Math.abs(expVals[pivotIdx])) pivotIdx = i;
  }
  if (Math.abs(expVals[pivotIdx]) < tolerance) {
    return { isValidSyntax: true, isCorrect: false };
  }
  const k = userVals[pivotIdx] / expVals[pivotIdx];
  const collinear = userVals.every(
    (v, i) => Math.abs(v - k * expVals[i]) <= tolerance * Math.max(1, Math.abs(k * expVals[i]))
  );
  if (!collinear) {
    return { isValidSyntax: true, isCorrect: false };
  }
  const exactSame = userVals.every((v, i) => Math.abs(v - expVals[i]) <= tolerance);
  return {
    isValidSyntax: true,
    isCorrect: true,
    styleTip: exactSame
      ? undefined
      : 'Geometrisch äquivalent (kollinearer Vektor) – als richtig gewertet!',
  };
}
