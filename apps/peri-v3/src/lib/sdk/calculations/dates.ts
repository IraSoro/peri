import { Temporal } from "temporal-polyfill";
import { formatInstant } from "@/lib/utils/dates";

/** The UTC date of an ISO timestamp, the data is in UTC */
export const toPlainDate = (
  iso: string,
  timeZone: string = "UTC",
): Temporal.PlainDate => {
  return Temporal.Instant.from(iso).toZonedDateTimeISO(timeZone).toPlainDate();
};

/**
 * The date in the time zone of the device, which is what the user sees. Takes
 * an ISO timestamp from the data, which is in UTC, so 22:00 UTC on Jan 1 is
 * Jan 2 in UTC+2. Also takes a JS Date, for example a day of a date picker,
 * which is the same moment, so the same date
 */
export const toLocalDate = (value: string | Date): Temporal.PlainDate => {
  const iso = typeof value === "string" ? value : value.toISOString();
  return toPlainDate(iso, Temporal.Now.timeZoneId());
};

/**
 * The inverse of `toLocalDate`: the ISO timestamp (UTC) of the moment a local
 * day begins. A day the user tapped is saved this way, so it reads back as
 * the same day: Jan 2 in UTC+2 is saved as 22:00 UTC on Jan 1
 */
export const toLocalMidnight = (date: Temporal.PlainDate): string => {
  const instant = date.toZonedDateTime(Temporal.Now.timeZoneId()).toInstant();
  return formatInstant(instant);
};
