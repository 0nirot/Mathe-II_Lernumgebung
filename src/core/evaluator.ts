import type { GeometricCheck, TaskCheckpoint } from '../types/learning';
import {
  checkScalarEquivalence,
  checkVectorEquivalence,
  parseMathExpression,
} from './mathParser';

export interface CheckpointEvalResult {
  checkpointId: string;
  isValidSyntax: boolean;
  isCorrect: boolean;
  parseError?: string;
  styleTip?: string;
  diagnosticMessage?: string;
  diagnosticType?: string;
}

function evaluateGeometricPointCheck(
  userInputs: string[],
  geoCheck: GeometricCheck,
  tolerance = 1e-6
): { isValidSyntax: boolean; isCorrect: boolean; parseError?: string; styleTip?: string } {
  if (userInputs.length !== 3) {
    return { isValidSyntax: false, isCorrect: false, parseError: 'Bitte alle 3 Koordinaten eingeben.' };
  }
  const u: number[] = [];
  for (let i = 0; i < 3; i++) {
    const p = parseMathExpression(userInputs[i]);
    if (!p.ok) {
      return { isValidSyntax: false, isCorrect: false, parseError: `Koordinate ${i + 1}: ${p.reason}` };
    }
    u.push(p.value);
  }
  const parse3 = (arr: [string, string, string]): [number, number, number] =>
    arr.map((s) => {
      const p = parseMathExpression(s);
      if (!p.ok) throw new Error(`Bad expected geo tuple: ${s}`);
      return p.value;
    }) as [number, number, number];

  const orig = parse3(geoCheck.origin);
  const diff = [u[0] - orig[0], u[1] - orig[1], u[2] - orig[2]];

  if (geoCheck.type === 'point-on-line') {
    const d = parse3(geoCheck.dir);
    // (u - orig) x d == 0
    const cx = diff[1] * d[2] - diff[2] * d[1];
    const cy = diff[2] * d[0] - diff[0] * d[2];
    const cz = diff[0] * d[1] - diff[1] * d[0];
    const ok = Math.hypot(cx, cy, cz) <= tolerance * Math.max(1, Math.hypot(...diff) * Math.hypot(...d));
    const exactSame = Math.hypot(...diff) <= tolerance;
    return {
      isValidSyntax: true,
      isCorrect: ok,
      styleTip: ok && !exactSame ? 'Anderer gültiger Stützpunkt auf derselben Geraden – als richtig gewertet!' : undefined,
    };
  }

  // point-on-plane: n · (u - orig) == 0
  const n = parse3(geoCheck.normal);
  const dot = diff[0] * n[0] + diff[1] * n[1] + diff[2] * n[2];
  const ok = Math.abs(dot) <= tolerance * Math.max(1, Math.hypot(...diff) * Math.hypot(...n));
  const exactSame = Math.hypot(...diff) <= tolerance;
  return {
    isValidSyntax: true,
    isCorrect: ok,
    styleTip: ok && !exactSame ? 'Anderer gültiger Punkt in derselben Ebene – als richtig gewertet!' : undefined,
  };
}

export function evaluateCheckpoint(
  checkpoint: TaskCheckpoint,
  rawAnswer: string | string[]
): CheckpointEvalResult {
  if (checkpoint.kind === 'choice' || checkpoint.kind === 'mistake-line') {
    const chosen = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
    if (!chosen) {
      return {
        checkpointId: checkpoint.id,
        isValidSyntax: false,
        isCorrect: false,
        parseError: 'Bitte wähle eine Antwort aus.',
      };
    }
    const isCorrect = chosen === checkpoint.expected;
    let diagnosticMessage: string | undefined;
    let diagnosticType: string | undefined;
    if (!isCorrect && checkpoint.bugDiagnostics) {
      const hit = checkpoint.bugDiagnostics.find((b) => b.matchScalar === chosen);
      if (hit) {
        diagnosticMessage = hit.message;
        diagnosticType = hit.errorType;
      }
    }
    return {
      checkpointId: checkpoint.id,
      isValidSyntax: true,
      isCorrect,
      diagnosticMessage,
      diagnosticType,
    };
  }

  if (checkpoint.kind === 'scalar') {
    const input = typeof rawAnswer === 'string' ? rawAnswer : '';
    const expected = typeof checkpoint.expected === 'string' ? checkpoint.expected : '';
    const res = checkScalarEquivalence(input, expected);
    if (!res.isValidSyntax) {
      return {
        checkpointId: checkpoint.id,
        isValidSyntax: false,
        isCorrect: false,
        parseError: res.parseError,
      };
    }
    if (res.isCorrect) {
      return {
        checkpointId: checkpoint.id,
        isValidSyntax: true,
        isCorrect: true,
        styleTip: res.styleTip,
      };
    }
    if (checkpoint.bugDiagnostics) {
      for (const bug of checkpoint.bugDiagnostics) {
        if (bug.matchScalar && checkScalarEquivalence(input, bug.matchScalar).isCorrect) {
          return {
            checkpointId: checkpoint.id,
            isValidSyntax: true,
            isCorrect: false,
            diagnosticMessage: bug.message,
            diagnosticType: bug.errorType,
          };
        }
      }
    }
    return {
      checkpointId: checkpoint.id,
      isValidSyntax: true,
      isCorrect: false,
    };
  }

  if (checkpoint.kind === 'matrix') {
    const inputs = Array.isArray(rawAnswer) ? rawAnswer : [];
    const expectedArr = Array.isArray(checkpoint.expected) ? checkpoint.expected : [];
    const res = checkVectorEquivalence(inputs, expectedArr, 'exact');
    if (!res.isValidSyntax) {
      return {
        checkpointId: checkpoint.id,
        isValidSyntax: false,
        isCorrect: false,
        parseError: res.parseError,
      };
    }
    if (res.isCorrect) {
      return {
        checkpointId: checkpoint.id,
        isValidSyntax: true,
        isCorrect: true,
      };
    }
    if (checkpoint.bugDiagnostics) {
      for (const bug of checkpoint.bugDiagnostics) {
        if (bug.matchMatrix && checkVectorEquivalence(inputs, bug.matchMatrix, 'exact').isCorrect) {
          return {
            checkpointId: checkpoint.id,
            isValidSyntax: true,
            isCorrect: false,
            diagnosticMessage: bug.message,
            diagnosticType: bug.errorType,
          };
        }
      }
    }
    return {
      checkpointId: checkpoint.id,
      isValidSyntax: true,
      isCorrect: false,
    };
  }

  // vector2 or vector3 (with optional geometric equivalence for non-unique points / collinear vectors)
  const inputs = Array.isArray(rawAnswer) ? rawAnswer : [];
  const expectedArr = Array.isArray(checkpoint.expected) ? checkpoint.expected : [];

  if (checkpoint.geoCheck && checkpoint.kind === 'vector3') {
    const gRes = evaluateGeometricPointCheck(inputs, checkpoint.geoCheck);
    if (!gRes.isValidSyntax) {
      return {
        checkpointId: checkpoint.id,
        isValidSyntax: false,
        isCorrect: false,
        parseError: gRes.parseError,
      };
    }
    if (gRes.isCorrect) {
      return {
        checkpointId: checkpoint.id,
        isValidSyntax: true,
        isCorrect: true,
        styleTip: gRes.styleTip,
      };
    }
  }

  const res = checkVectorEquivalence(
    inputs,
    expectedArr,
    checkpoint.equivalenceMode ?? 'exact'
  );
  if (!res.isValidSyntax) {
    return {
      checkpointId: checkpoint.id,
      isValidSyntax: false,
      isCorrect: false,
      parseError: res.parseError,
    };
  }
  if (res.isCorrect) {
    return {
      checkpointId: checkpoint.id,
      isValidSyntax: true,
      isCorrect: true,
      styleTip: res.styleTip,
    };
  }
  if (checkpoint.bugDiagnostics) {
    for (const bug of checkpoint.bugDiagnostics) {
      if (bug.matchVector && checkVectorEquivalence(inputs, bug.matchVector, 'exact').isCorrect) {
        return {
          checkpointId: checkpoint.id,
          isValidSyntax: true,
          isCorrect: false,
          diagnosticMessage: bug.message,
          diagnosticType: bug.errorType,
        };
      }
    }
  }
  return {
    checkpointId: checkpoint.id,
    isValidSyntax: true,
    isCorrect: false,
  };
}
