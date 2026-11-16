import type { Cycle, Prediction } from "@repo/config-schema/config-v2.schema";

export type AlgorithmErrorCode =
  | "already_registered"
  | "unknown_algorithm"
  | "invalid_manifest"
  | "invalid_output"
  | "run_failed";

export type AlgorithmOperationResult =
  | { ok: true }
  | { ok: false; error: { code: AlgorithmErrorCode; message: string } };

export interface AlgorithmInput {
  cycles: readonly Cycle[];
}

export interface AlgorithmOutput {
  /** Predicted days for the algorithm type */
  days: Prediction["days"];
}

export interface AlgorithmEntry {
  run(input: AlgorithmInput): AlgorithmOutput | Promise<AlgorithmOutput>;
}
