import type { ErrorObject } from "ajv";

export type SchemaErrorCode =
  | "required"
  | "type"
  | "invalid_value"
  | "invalid_format"
  | "out_of_range"
  | "invalid_structure";

export interface SchemaError {
  code: SchemaErrorCode;
  path: string;
  message: string;
}

export type SchemaValidationResult<T> =
  { ok: true; config: T } | { ok: false; errors: SchemaError[] };

const CODES: Record<string, SchemaErrorCode> = {
  required: "required",
  type: "type",
  const: "invalid_value",
  enum: "invalid_value",
  pattern: "invalid_format",
  format: "invalid_format",
  minLength: "out_of_range",
  maxLength: "out_of_range",
  minimum: "out_of_range",
  maximum: "out_of_range",
  minItems: "out_of_range",
  maxItems: "out_of_range",
};

export const toSchemaErrors = (
  errors: ErrorObject[] | null | undefined,
): SchemaError[] => {
  return (errors ?? []).map((e: ErrorObject): SchemaError => {
    const missing =
      e.keyword === "required" ? String(e.params.missingProperty) : null;
    return {
      code: CODES[e.keyword] ?? "invalid_structure",
      path: missing ? `${e.instancePath}/${missing}` : e.instancePath,
      message: e.message ?? e.keyword,
    };
  });
};
