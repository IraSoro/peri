import type { CycleInput, ValidateOperation } from "./types";
import { Temporal } from "temporal-polyfill";
import { toIsoDate } from "./dates";

export const isList: ValidateOperation = (data: unknown) => {
  const isObject = (item: unknown) => {
    return typeof item === "object" && item !== null && !Array.isArray(item);
  };
  if (!Array.isArray(data) || !data.every(isObject)) {
    return {
      ok: false,
      error: {
        code: "invalid_cycle",
        message: "cycles must be a list of objects",
      },
    };
  }
  return { ok: true, data };
};

export const hasValidDates: ValidateOperation = (data: unknown) => {
  const cycles: CycleInput[] = [];
  for (const item of data as CycleInput[]) {
    const startDate = toIsoDate(item.start_date);
    if (startDate === null) {
      return {
        ok: false,
        error: {
          code: "invalid_cycle",
          message: `"${String(item.start_date)}" is not a valid date`,
        },
      };
    }
    cycles.push({ ...item, start_date: startDate });
  }
  return { ok: true, data: cycles };
};

export const hasValidPeriodLengths: ValidateOperation = (data: unknown) => {
  for (const item of data as CycleInput[]) {
    if (!Number.isInteger(item.period_length) || item.period_length < 1) {
      return {
        ok: false,
        error: {
          code: "invalid_cycle",
          message: `period_length must be a positive integer, got ${String(item.period_length)}`,
        },
      };
    }
  }
  return { ok: true, data };
};

export const hasUniqueStartDates: ValidateOperation = (data: unknown) => {
  const seen = new Set<string>();
  for (const item of data as CycleInput[]) {
    if (seen.has(item.start_date)) {
      return {
        ok: false,
        error: {
          code: "duplicate_cycle",
          message: `cycle "${item.start_date}" appears more than once`,
        },
      };
    }
    seen.add(item.start_date);
  }
  return { ok: true, data };
};

export const hasNoOverlappingPeriods: ValidateOperation = (data: unknown) => {
  const sorted = [...(data as CycleInput[])].sort((a, b) => {
    return Temporal.Instant.compare(a.start_date, b.start_date);
  });
  for (const [index, item] of sorted.entries()) {
    const following = sorted[index + 1];
    if (!following) {
      break;
    }
    const gap = Temporal.Instant.from(item.start_date)
      .toZonedDateTimeISO("UTC")
      .until(
        Temporal.Instant.from(following.start_date).toZonedDateTimeISO("UTC"),
        {
          largestUnit: "days",
        },
      ).days;
    if (item.period_length > gap) {
      return {
        ok: false,
        error: {
          code: "overlapping_period",
          message: `period of cycle "${item.start_date}" lasts ${String(item.period_length)} days, but the next cycle starts after ${String(gap)}`,
        },
      };
    }
  }
  return { ok: true, data };
};
