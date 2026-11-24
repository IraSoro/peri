import { useMemo } from "react";
import { usePredictions } from "@/lib/sdk/app/hooks";
import { toLocalDate } from "@/lib/sdk/calculations/dates";
import type { Period } from "../periods";

export const useCalendarModifiers = (periods: Period[], editing: boolean) => {
  const predictions = usePredictions();

  return useMemo(() => {
    const logged = new Set(
      periods.flatMap((period) => {
        return Array.from({ length: period.length }, (_, index) => {
          return period.start.add({ days: index }).toString();
        });
      }),
    );
    const menstrual = new Set([
      ...logged,
      // NOTE: Predictions are hidden in edit mode, a predicted period would
      // stay on the days the user just removed from a logged one
      ...(editing ? [] : (predictions.menstruation?.days ?? [])).map((day) => {
        return toLocalDate(day.date).toString();
      }),
    ]);

    const ovulation = new Set(
      (editing ? [] : (predictions.ovulation?.days ?? [])).map((day) => {
        return toLocalDate(day.date).toString();
      }),
    );

    return {
      predicted: (date: Date) => {
        // NOTE: In edit mode every period is hollow, like a predicted one,
        // because the draft is not saved yet
        if (editing) {
          return true;
        }
        // NOTE: Only a predicted day is hollow, a logged one is filled even
        // when it is still to come, the user has marked it
        return !logged.has(toLocalDate(date).toString());
      },
      menstrual: (date: Date) => {
        return menstrual.has(toLocalDate(date).toString());
      },
      ovulation: (date: Date) => {
        return ovulation.has(toLocalDate(date).toString());
      },
    };
  }, [periods, predictions, editing]);
};
