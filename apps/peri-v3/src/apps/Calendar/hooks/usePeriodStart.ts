import { Temporal } from "temporal-polyfill";
import { usePredictions } from "@/lib/sdk/app/hooks";
import { toLocalDate } from "@/lib/sdk/calculations/dates";
import { containsDay, type Period } from "../periods";

// How many days before a predicted period it can already be marked as started
const EARLY_DAYS = 2;

/**
 * Whether today can be logged as the start of a period, and how many days
 * that period has in the prediction
 */
export const usePeriodStart = (periods: Period[], editing: boolean) => {
  const predictions = usePredictions();
  const today = Temporal.Now.plainDateISO();
  const predicted = new Set(
    (predictions.menstruation?.days ?? []).map((day) => {
      return toLocalDate(day.date).toString();
    }),
  );
  // NOTE: A period may start a little before it is predicted, so the button
  // is there from EARLY_DAYS ahead of the first predicted day, while the
  // period is not logged yet
  const anchor = Array.from(
    { length: EARLY_DAYS + 1 },
    (_, ahead) => ahead,
  ).find((ahead) => {
    return predicted.has(today.add({ days: ahead }).toString());
  });
  const canMarkToday =
    !editing && !containsDay(periods, today) && anchor !== undefined;

  // The days of the predicted period, as the algorithm sees it
  const predictedLength = () => {
    let first = today.add({ days: anchor ?? 0 });
    while (predicted.has(first.subtract({ days: 1 }).toString())) {
      first = first.subtract({ days: 1 });
    }
    let length = 0;
    while (predicted.has(first.add({ days: length }).toString())) {
      length++;
    }
    return length;
  };

  return { canMarkToday, predictedLength };
};
