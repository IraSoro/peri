import { Temporal } from "temporal-polyfill";

/** A logged period in the days the user sees (local) */
export type Period = { start: Temporal.PlainDate; length: number };

const lastDay = (period: Period): Temporal.PlainDate => {
  return period.start.add({ days: period.length - 1 });
};

export const containsDay = (
  periods: Period[],
  day: Temporal.PlainDate,
): boolean => {
  return periods.some((period) => {
    return (
      Temporal.PlainDate.compare(day, period.start) >= 0 &&
      Temporal.PlainDate.compare(day, lastDay(period)) <= 0
    );
  });
};

/**
 * Takes `day` out of the periods, the rest of its period stays:
 * 27-31 without 29 becomes 27-28 and 30-31, which are saved as two separate
 * cycles. Nothing changes for a day outside any period
 */
export const unmarkDay = (
  periods: Period[],
  day: Temporal.PlainDate,
): Period[] => {
  const hit = periods.find((period) => {
    return containsDay([period], day);
  });
  if (!hit) {
    return periods;
  }
  const before = day.since(hit.start).days;
  const after = hit.length - before - 1;
  const rest: Period[] = [];
  if (before > 0) {
    rest.push({ start: hit.start, length: before });
  }
  if (after > 0) {
    rest.push({ start: day.add({ days: 1 }), length: after });
  }
  return periods.flatMap((period) => {
    return period === hit ? rest : [period];
  });
};

/**
 * Puts `day` into the periods. It joins a period that ends the day before or
 * starts the day after, or both, otherwise it is a period of one day
 */
export const markDay = (
  periods: Period[],
  day: Temporal.PlainDate,
): Period[] => {
  if (containsDay(periods, day)) {
    return periods;
  }
  const before = periods.find((period) => {
    return lastDay(period).add({ days: 1 }).equals(day);
  });
  const after = periods.find((period) => {
    return period.start.equals(day.add({ days: 1 }));
  });
  const joined: Period = {
    start: before?.start ?? day,
    length: (before?.length ?? 0) + 1 + (after?.length ?? 0),
  };
  return [
    ...periods.filter((period) => {
      return period !== before && period !== after;
    }),
    joined,
  ];
};

/** What a tap on `day` does: marks a day outside the periods, or takes it out */
export const tapDay = (
  periods: Period[],
  day: Temporal.PlainDate,
): Period[] => {
  return containsDay(periods, day)
    ? unmarkDay(periods, day)
    : markDay(periods, day);
};
