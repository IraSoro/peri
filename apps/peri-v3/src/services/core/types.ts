import type {
  AlgorithmManifest,
  ConfigV2,
} from "@repo/config-schema/config-v2.schema";

export type PredictionType = AlgorithmManifest["type"];

export type CoreErrorCode =
  | "unknown_algorithm"
  | "type_mismatch"
  | "invalid_data"
  | "algorithm_failed"
  | "registration_failed";

export type CoreOperationResult =
  { ok: true } | { ok: false; error: { code: CoreErrorCode; message: string } };

export interface CoreData {
  active_algorithms?: Record<string, string>;
}

export interface ModifyData {
  cycles: ConfigV2["cycles"];
  predictions: ConfigV2["predictions"];
}

export type ModifyOperation = (data: ModifyData) => ModifyData;
