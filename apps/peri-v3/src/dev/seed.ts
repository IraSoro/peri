import { Temporal } from "temporal-polyfill";
import { service as cycles } from "@/services/cycles/service";
import { formatInstant } from "@/lib/utils/dates";
import type { Phase } from "@/lib/sdk/types";

const PERIOD_LENGTH = 5;

/**
 * Finished cycles before the last one, newest first. "varied" lengths average
 * 28 days with a deviation of 2 and the periods average 5 days, the same as
 * the medians the algorithms use
 */
const histories = {
  single: [{ length: 28, period: 5 }],
  varied: [
    { length: 28, period: 5 },
    { length: 26, period: 6 },
    { length: 30, period: 4 },
  ],
  long: [
    { length: 28, period: 5 },
    { length: 26, period: 6 },
    { length: 30, period: 4 },
    { length: 27, period: 5 },
    { length: 29, period: 5 },
    { length: 31, period: 6 },
    { length: 25, period: 4 },
    { length: 28, period: 5 },
    { length: 28, period: 5 },
    { length: 30, period: 6 },
    { length: 26, period: 5 },
    { length: 28, period: 4 },
  ],
};

const isHistory = (value: string | null): value is keyof typeof histories => {
  return value !== null && value in histories;
};

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
 * starts empty on every reload. Add `&history=varied` for several cycles of
 * different lengths or `&history=long` for twelve, the default `single` has
 * one finished cycle
 */
const params = new URLSearchParams(window.location.search);
const seed = params.get("seed");
const historyName = params.get("history");
const history = histories[isHistory(historyName) ? historyName : "single"];
if (isSeed(seed)) {
  const last = Temporal.Now.plainDateISO("UTC").subtract({
    days: daysSinceStart[seed],
  });
  const start = (date: Temporal.PlainDate) => {
    return formatInstant(date.toZonedDateTime("UTC").toInstant());
  };
  let date = last;
  const rows = [{ date, period: PERIOD_LENGTH }];
  for (const { length, period } of history) {
    date = date.subtract({ days: length });
    rows.push({ date, period });
  }
  const res = await cycles.update(() => {
    return rows.map((row) => {
      return { start_date: start(row.date), period_length: row.period };
    });
  });
  console.info(`[seed] ${seed}: ${res.ok ? "ok" : res.error.message}`);
}
