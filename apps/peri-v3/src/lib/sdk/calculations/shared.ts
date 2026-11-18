import { Temporal } from "temporal-polyfill";

/** The UTC date of an ISO timestamp */
export const toPlainDate = (iso: string): Temporal.PlainDate => {
  return Temporal.Instant.from(iso).toZonedDateTimeISO("UTC").toPlainDate();
};
