import type { GeneratedTask } from '../../types/learning';
import { M0_GENERATOR_MAP } from './m0Generators';
import { M1_GENERATOR_MAP } from './m1Generators';
import { M2_GENERATOR_MAP } from './m2Generators';
import { M3_GENERATOR_MAP } from './m3Generators';
import { M4_GENERATOR_MAP } from './m4Generators';
import { M5_GENERATOR_MAP } from './m5Generators';
import type { Rng } from './random';

export const ALL_GENERATORS: Record<string, (rng?: Rng) => GeneratedTask> = {
  ...M0_GENERATOR_MAP,
  ...M1_GENERATOR_MAP,
  ...M2_GENERATOR_MAP,
  ...M3_GENERATOR_MAP,
  ...M4_GENERATOR_MAP,
  ...M5_GENERATOR_MAP,
};

export function generateTaskById(generatorId: string, rng?: Rng): GeneratedTask {
  const fn = ALL_GENERATORS[generatorId];
  if (!fn) {
    throw new Error(`Unbekannter Aufgabengenerator: ${generatorId}`);
  }
  return fn(rng);
}
