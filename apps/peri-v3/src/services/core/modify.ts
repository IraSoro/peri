import { Temporal } from "temporal-polyfill";
import type { ModifyOperation } from "./types";

const dayOf = (date: string): Temporal.PlainDate => {
  return Temporal.Instant.from(date).toZonedDateTimeISO("UTC").toPlainDate();
};

/**
 * The algorithm predicts the last logged period too, with a typical length
 * of 5 days, for example. If the user logged 3 days, the 2 predicted days
 * after them are wrong and are removed
 */
export const trimToLoggedPeriod: ModifyOperation = (data) => {
  const { menstruation } = data.predictions;
  const last = data.cycles.at(-1);
  if (!menstruation || !last) {
    return data;
  }
  const predicted = new Set(
    menstruation.days.map((item) => {
      return dayOf(item.date).toString();
    }),
  );
  // The predicted days that follow the logged ones without a gap
  const extra = new Set<string>();
  let day = dayOf(last.start_date).add({ days: last.period_length });
  while (predicted.has(day.toString())) {
    extra.add(day.toString());
    day = day.add({ days: 1 });
  }
  const days = menstruation.days.filter((item) => {
    return !extra.has(dayOf(item.date).toString());
  });
  return {
    ...data,
    predictions: {
      ...data.predictions,
      menstruation: { ...menstruation, days },
    },
  };
};

/**
 * Ovulation is not predicted on a day of a predicted period, the period wins
 */
export const dropOvulationInPeriod: ModifyOperation = (data) => {
  const { menstruation, ovulation } = data.predictions;
  if (!ovulation) {
    return data;
  }
  const period = new Set(
    (menstruation?.days ?? []).map((item) => {
      return dayOf(item.date).toString();
    }),
  );
  const days = ovulation.days.filter((item) => {
    return !period.has(dayOf(item.date).toString());
  });
  return {
    ...data,
    predictions: { ...data.predictions, ovulation: { ...ovulation, days } },
  };
};
