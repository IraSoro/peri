import { Temporal } from "temporal-polyfill";
import { service as cycles } from "@/services/cycles/service";
import { formatInstant } from "@/lib/utils/dates";
import type { Phase } from "@/lib/sdk/types";

const CYCLE_LENGTH = 28;
const PERIOD_LENGTH = 5;

/**
 * How many days ago the last cycle started, so that today falls in the
 * phase. With the median algorithms (28 day cycle, 5 day period, ovulation on
 * days 12 to 15 of the cycle) these are days 2, 9, 14 and 21
 */
const daysSinceStart: Record<Phase | "today" | "delay", number> = {
  menstrual: 1,
  follicular: 8,
  ovulation: 13,
  luteal: 20,
  // The next period is predicted for today, and 2 days ago
  today: 28,
  delay: 30,
};

const isSeed = (value: string | null): value is keyof typeof daysSinceStart => {
  return value !== null && value in daysSinceStart;
};

/**
 * Dev only. Opening the app with `?seed=<name>` replaces the cycles with a
 * history that puts today in that phase, because the store is in memory and
 * starts empty on every reload
 */
const seed = new URLSearchParams(window.location.search).get("seed");
if (isSeed(seed)) {
  const last = Temporal.Now.plainDateISO("UTC").subtract({
    days: daysSinceStart[seed],
  });
  const start = (date: Temporal.PlainDate) => {
    return formatInstant(date.toZonedDateTime("UTC").toInstant());
  };
  const res = await cycles.update(() => {
    return [
      {
        start_date: start(last.subtract({ days: CYCLE_LENGTH })),
        period_length: PERIOD_LENGTH,
      },
      { start_date: start(last), period_length: PERIOD_LENGTH },
    ];
  });
  console.info(`[seed] ${seed}: ${res.ok ? "ok" : res.error.message}`);
}
