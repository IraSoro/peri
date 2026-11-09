import type { Cycle } from "@repo/config-schema/config-v2.schema";

export type CycleErrorCode =
  "duplicate_cycle" | "invalid_cycle" | "overlapping_period";

export type CycleOperationResult =
  | { ok: true }
  | { ok: false; error: { code: CycleErrorCode; message: string } };

export type CycleInput = Pick<Cycle, "start_date" | "period_length">;

export type ValidateOperationResult =
  | { ok: true; data: unknown }
  | { ok: false; error: { code: CycleErrorCode; message: string } };

export type ValidateOperation = (data: unknown) => ValidateOperationResult;
