import { Temporal } from "temporal-polyfill";

/**
 * `fractionalSecondDigits: 3` always prints milliseconds. By default
 * Temporal drops trailing zeros ("2025-01-01T00:00:00Z"), so the same
 * instant could be stored as two different strings. Fixed width matches the
 * schema fixtures: "2025-01-01T00:00:00.000Z"
 */
export function formatInstant(instant: Temporal.Instant): string {
  return instant.toString({ fractionalSecondDigits: 3 });
}

/**
 * Accepts an instant or a plain date (taken as midnight UTC) and returns it
 * as an ISO instant with exactly 3 fractional digits, so equal dates always
 * give equal strings, e.g. "2025-01-01" -> "2025-01-01T00:00:00.000Z".
 * Returns null when the value is not a date
 *
 * `overflow: "reject"` makes a plain date with out-of-range fields, like
 * "2025-02-30", throw instead of being silently clamped to "2025-02-28".
 * An instant string is already strict, so it needs no such option
 */
export function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  try {
    return formatInstant(Temporal.Instant.from(value));
  } catch {
    try {
      const date = Temporal.PlainDate.from(value, { overflow: "reject" });
      return formatInstant(date.toZonedDateTime("UTC").toInstant());
    } catch {
      return null;
    }
  }
}
