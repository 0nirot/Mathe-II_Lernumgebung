export type ModuleId = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export type VizType =
  | 'unit-circle'
  | 'line-2d'
  | 'vector-2d-ops'
  | 'vector-2d-dot'
  | 'vector-2d-projection'
  | 'cross-product-3d'
  | 'gauss-workbench'
  | 'falk-schema'
  | 'sarrus-laplace'
  | 'det-area-2d'
  | 'geo-3d-stage'
  | 'skew-lines-3d'
  | 'transform-2d-lab'
  | 'transform-chain-2d'
  | 'transform-3d-cube'
  | 'interp-1d-board'
  | 'bilinear-2d-grid'
  | 'resizing-artifacts';

export interface SymbolTooltip {
  symbol: string;
  latex: string;
  meaning: string;
}

export interface StepExample {
  title: string;
  problem: string;
  steps: {
    label: string;
    content: string;
    trick?: string;
  }[];
  finalResult: string;
}

export interface FormulaSheetItem {
  id: string;
  moduleId: ModuleId;
  side: 'front' | 'back';
  section: string;
  title: string;
  latex: string;
  whenToUse: string;
  pitfall: string;
}

export interface LessonDefinition {
  id: string;
  moduleId: ModuleId;
  order: number;
  title: string;
  subtitle: string;
  slideRef: string;
  estimatedMinutes: number;
  intuition: {
    hook: string;
    analogy: string;
  };
  visualization?: {
    type: VizType;
    discoveryPrompt: string;
  };
  explanation: {
    paragraphs: string[];
    keyFormulas: { label: string; latex: string }[];
    symbolTooltips: SymbolTooltip[];
    slideNote?: string;
  };
  example: StepExample;
  generatorIds: string[];
  summaryBullets: string[];
  formulaSheetIds: string[];
}

export interface BugDiagnostic {
  matchScalar?: string;
  matchVector?: string[];
  matchMatrix?: string[]; // row-major flattened
  errorType: string;
  message: string;
}

export type CheckpointKind = 'scalar' | 'vector2' | 'vector3' | 'matrix' | 'choice' | 'mistake-line';

export type GeometricCheck =
  | { type: 'point-on-line'; origin: [string, string, string]; dir: [string, string, string] }
  | { type: 'point-on-plane'; origin: [string, string, string]; normal: [string, string, string] };

export interface TaskCheckpoint {
  id: string;
  label: string;
  kind: CheckpointKind;
  /** Expected value(s): scalar string, vector string[], or row-major flattened matrix string[] */
  expected: string | string[];
  /** Required when kind === 'matrix' */
  matrixShape?: { rows: number; cols: number };
  unit?: string;
  options?: { id: string; label: string }[];
  equivalenceMode?: 'exact' | 'collinear-nonzero';
  /** Optional geometric equivalence check for non-unique point solutions (Q14) */
  geoCheck?: GeometricCheck;
  bugDiagnostics?: BugDiagnostic[];
  solutionLatex: string;
  points: number;
}

export interface GeneratedTask {
  id: string;
  generatorId: string;
  moduleId: ModuleId;
  topicLabel: string;
  prompt: string;
  mistakeLines?: { id: string; text: string }[];
  checkpoints: TaskCheckpoint[];
  hints: [string, string, string];
  fullSolutionSteps: string[];
  paperRecommended?: boolean;
}

export interface ModuleMetadata {
  id: ModuleId;
  number: number;
  title: string;
  shortTitle: string;
  sourceSlides: string;
  description: string;
  implementedInStage: number;
  available: boolean;
  recommendedAfter: ModuleId[];
}

export interface SrsCardDefinition {
  id: string;
  category: 'decision' | 'reflex' | 'weakness';
  moduleId: ModuleId;
  question: string;
  answer: string;
  explanation: string;
  /** Optional generatorId for dynamic practice cards in SRS */
  generatorId?: string;
}
