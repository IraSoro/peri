import type { ConfigV1 } from "../dist/config-v1.schema.js";
import validateSchema from "../generated/validate-config-v1.js";
import {
  toSchemaErrors,
  type SchemaValidationResult,
} from "./schema-errors.js";

export type {
  SchemaError,
  SchemaErrorCode,
  SchemaValidationResult,
} from "./schema-errors.js";

export const validateConfigV1 = (
  data: unknown,
): SchemaValidationResult<ConfigV1> => {
  return validateSchema(data)
    ? { ok: true, config: data as ConfigV1 }
    : { ok: false, errors: toSchemaErrors(validateSchema.errors) };
};
