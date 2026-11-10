import type { ConfigV2 } from "@repo/config-schema/config-v2.schema";

export type CoreErrorCode =
  | "unknown_algorithm"
  | "invalid_data"
  | "algorithm_failed"
  | "registration_failed";

export type CoreOperationResult =
  { ok: true } | { ok: false; error: { code: CoreErrorCode; message: string } };

type Predictions = ConfigV2["predictions"];

export type KnownPredictionType = keyof {
  [Type in keyof Predictions as string extends Type ? never : Type]: true;
};

export type PredictionType = KnownPredictionType | (string & {});

export interface CoreData {
  active_algorithms?: Record<string, string>;
}
