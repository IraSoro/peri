import { Temporal } from "temporal-polyfill";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { AppContext } from "@/lib/sdk/app/context";
import { service as store } from "@/services/store/service";
import { service as cycles } from "@/services/cycles/service";
import { service as algorithms } from "@/services/algorithms/service";
import { PeriodStatusApp } from "./App";

function html(): string {
  return renderToStaticMarkup(
    <AppContext.Provider value={{ source: "internal", permissions: [] }}>
      <PeriodStatusApp />
    </AppContext.Provider>,
  );
}

async function predict(dates: string[], ovulation: string[] = []) {
  await store.update((config) => {
    return {
      ...config,
      predictions: {
        menstruation: {
          algorithm_id: "a",
          days: dates.map((date) => {
            return { date };
          }),
        },
        ...(ovulation.length > 0 && {
          ovulation: {
            algorithm_id: "b",
            days: ovulation.map((date) => {
              return { date };
            }),
          },
        }),
      },
    };
  });
}

beforeAll(async () => {
  for (const [id, type] of [
    ["a", "menstruation"],
    ["b", "ovulation"],
  ] as const) {
    await algorithms.register(
      {
        manifest_version: 1,
        id,
        name: id,
        version: "1.0.0",
        source: "internal",
        permissions: [],
        type,
      },
      { run: () => ({ days: [] }) },
    );
  }
});

async function addCycle(start = "2025-01-01T00:00:00.000Z") {
  await cycles.update(() => {
    return [{ start_date: start, period_length: 5 }];
  });
}

const iso = (date: Temporal.PlainDate) => {
  return `${date.toString()}T00:00:00.000Z`;
};

afterEach(async () => {
  await cycles.update(() => {
    return [];
  });
  await store.update((config) => {
    return { ...config, predictions: {} };
  });
});

describe("PeriodStatusApp countdown", () => {
  it("shows a placeholder when there is no prediction", async () => {
    await addCycle();

    expect(html()).toContain("No prediction");
  });

  it("shows the day number of the period while it lasts", async () => {
    const today = Temporal.Now.plainDateISO("UTC");
    await addCycle(iso(today.subtract({ days: 1 })));
    await predict([
      `${today.subtract({ days: 1 }).toString()}T00:00:00.000Z`,
      `${today.toString()}T00:00:00.000Z`,
    ]);

    const out = html();

    expect(out).toContain("Day 2");
    expect(out).toContain("menstrual</div>");
  });

  it("shows a low pregnancy chance outside of ovulation", async () => {
    await addCycle();
    const today = Temporal.Now.plainDateISO("UTC");
    await predict([`${today.add({ days: 5 }).toString()}T00:00:00.000Z`]);

    const out = html();

    expect(out).toContain("Low");
    expect(out).toContain("bg-pregnancyLow-primary");
  });

  it("shows a high pregnancy chance on an ovulation day", async () => {
    await addCycle();
    const today = Temporal.Now.plainDateISO("UTC");
    await predict(
      [`${today.add({ days: 14 }).toString()}T00:00:00.000Z`],
      [`${today.toString()}T00:00:00.000Z`],
    );

    const out = html();

    expect(out).toContain("High");
    expect(out).toContain("bg-pregnancyHigh-primary");
  });

  it("shows today when the period is predicted for today", async () => {
    await addCycle();
    const today = Temporal.Now.plainDateISO("UTC");
    await predict([iso(today)]);

    const out = html();

    expect(out).toContain("Today");
    expect(out).not.toContain("0 days");
  });

  it("shows the delay when the predicted start is past", async () => {
    await addCycle();
    const today = Temporal.Now.plainDateISO("UTC");
    await predict([iso(today.subtract({ days: 2 })), iso(today)]);

    const out = html();

    expect(out).toContain("Delay");
    expect(out).toContain("2 days");
    expect(out).toContain("luteal</div>");
    expect(out).toContain("text-delayed-primary");
  });

  it("shows the days to the predicted period", async () => {
    await addCycle();
    const date = Temporal.Now.plainDateISO("UTC").add({ days: 12 });
    await predict([`${date.toString()}T00:00:00.000Z`]);

    expect(html()).toContain("12 days");
  });
});

describe("PeriodStatusApp without cycles", () => {
  it("asks for the last period instead of the countdown", () => {
    const out = html();

    expect(out).toContain("Add your last period");
    expect(out).toContain("Period started today");
    expect(out).not.toContain("Period in");
  });
});
