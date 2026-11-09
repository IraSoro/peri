import type {
  ConfigV2,
  Cycle,
  Prediction,
} from "@repo/config-schema/config-v2.schema";

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

export type AlgorithmOutput = {
  [Type in keyof ConfigV2["predictions"]]?: Prediction["days"];
};

export interface AlgorithmEntry {
  run(input: AlgorithmInput): AlgorithmOutput | Promise<AlgorithmOutput>;
}
