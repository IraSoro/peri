import type { Cycle, Prediction } from "@repo/config-schema/config-v2.schema";

export type AlgorithmErrorCode =
  | "already_registered"
  | "unknown_algorithm"
  | "invalid_manifest"
  | "invalid_output"
  | "run_failed";

export type AlgorithmError = { code: AlgorithmErrorCode; message: string };

export type AlgorithmOperationResult =
  { ok: true } | { ok: false; error: AlgorithmError };

export type AlgorithmDryRunResult =
  { ok: true; days: Prediction["days"] } | { ok: false; error: AlgorithmError };

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
