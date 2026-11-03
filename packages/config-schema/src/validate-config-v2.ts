import type { ConfigV2 } from "../dist/config-v2.schema.js";
import validateSchema from "../generated/validate-config-v2.js";
import { toSchemaErrors, type SchemaErrorCode } from "./schema-errors.js";

export type {
  SchemaError,
  SchemaErrorCode,
  SchemaValidationResult,
} from "./schema-errors.js";

type ConfigErrorCode = "duplicate_id" | "unknown_algorithm";

export interface ConfigError {
  code: SchemaErrorCode | ConfigErrorCode;
  path: string;
  message: string;
}

export type ConfigValidationResult =
  { ok: true; config: ConfigV2 } | { ok: false; errors: ConfigError[] };

/**
 * Escapes a key for a JSON Pointer (RFC 6901): `~` -> `~0`, `/` -> `~1`.
 *
 * Prediction type keys are open, so one may contain `/`. Keep `~` first.
 */
function escapePointer(segment: string) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

type Rule = (config: ConfigV2) => ConfigError[];

const allAppIdsAreUnique: Rule = (config) => {
  const seen = new Set<string>();
  const errors: ConfigError[] = [];
  for (const [index, { manifest }] of config.apps.entries()) {
    if (seen.has(manifest.id)) {
      errors.push({
        code: "duplicate_id",
        path: `/apps/${index}/manifest/id`,
        message: `Duplicate id "${manifest.id}" in apps`,
      });
    }
    seen.add(manifest.id);
  }
  return errors;
};

const allAlgorithmIdsAreUnique: Rule = (config) => {
  const seen = new Set<string>();
  const errors: ConfigError[] = [];
  for (const [index, { manifest }] of config.algorithms.entries()) {
    if (seen.has(manifest.id)) {
      errors.push({
        code: "duplicate_id",
        path: `/algorithms/${index}/manifest/id`,
        message: `Duplicate id "${manifest.id}" in algorithms`,
      });
    }
    seen.add(manifest.id);
  }
  return errors;
};

const predictionsUseKnownAlgorithms: Rule = (config) => {
  const algorithmIds = new Set(config.algorithms.map((a) => a.manifest.id));
  return Object.entries(config.predictions)
    .filter(([, prediction]) => !algorithmIds.has(prediction.algorithm_id))
    .map(([type, prediction]) => ({
      code: "unknown_algorithm",
      path: `/predictions/${escapePointer(type)}/algorithm_id`,
      message: `Prediction "${type}" refers to unknown algorithm "${prediction.algorithm_id}"`,
    }));
};

export function validateConfigV2(data: unknown): ConfigValidationResult {
  if (!validateSchema(data)) {
    return { ok: false, errors: toSchemaErrors(validateSchema.errors) };
  }

  const config = data as ConfigV2;
  const errors: ConfigError[] = [];
  for (const rule of [
    allAppIdsAreUnique,
    allAlgorithmIdsAreUnique,
    predictionsUseKnownAlgorithms,
  ]) {
    errors.push(...rule(config));
  }

  return errors.length ? { ok: false, errors } : { ok: true, config };
}
