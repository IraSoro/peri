import { Temporal } from "temporal-polyfill";
import { validateConfigV1 } from "@repo/config-schema/validate-config-v1";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { formatInstant } from "@/lib/utils/dates";
import { createDefaultConfig } from "./defaults";
import type { MigrateOperation } from "./types";

export const initDefault: MigrateOperation = (data: unknown) => {
  if (data === null) {
    data = createDefaultConfig();
  }
  return { ok: true, data };
};

export const v1ToV2: MigrateOperation = (data: unknown) => {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return {
      ok: false,
      error: { code: "invalid_migration", message: "data is not an object" },
    };
  }
  if ((data as { version?: number }).version !== 1) {
    return { ok: true, data };
  }

  const validated = validateConfigV1(data);
  if (!validated.ok) {
    return {
      ok: false,
      error: {
        code: "invalid_migration",
        message: validated.errors
          .map((err) => `${err.path}: ${err.message}`)
          .join("; "),
      },
    };
  }

  const parseV1Date = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return Temporal.Instant.fromEpochMilliseconds(date.getTime())
      .toZonedDateTimeISO("UTC")
      .toPlainDate();
  };

  const config = validated.config;
  const cycles: Cycle[] = [];
  for (const cycleV1 of config.cycles) {
    const startDate = parseV1Date(cycleV1.startDate);
    if (startDate === null) {
      return {
        ok: false,
        error: {
          code: "invalid_migration",
          message: `bad date ${cycleV1.startDate}`,
        },
      };
    }

    const isCurrent = cycleV1.cycleLength === 0;
    cycles.push({
      start_date: formatInstant(startDate.toZonedDateTime("UTC").toInstant()),
      end_date: isCurrent
        ? null
        : formatInstant(
            startDate
              .add({ days: cycleV1.cycleLength - 1 })
              .toZonedDateTime("UTC")
              .toInstant(),
          ),
      period_length: cycleV1.periodLength,
      cycle_length: isCurrent ? null : cycleV1.cycleLength,
    });
  }

  return {
    ok: true,
    data: {
      ...createDefaultConfig(),
      cycles: cycles.reverse(),
    },
  };
};
