import { Temporal } from "temporal-polyfill";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { AppContext } from "@/lib/sdk/app/context";
import { NoDataError } from "@/lib/sdk/app/errors";
import { service as store } from "@/services/store/service";
import { service as cycles } from "@/services/cycles/service";
import { service as algorithms } from "@/services/algorithms/service";
import { CycleInfoApp } from "./App";

function html(): string {
  return renderToStaticMarkup(
    <AppContext.Provider
      value={{ id: "test", source: "internal", permissions: [] }}
    >
      <CycleInfoApp />
    </AppContext.Provider>,
  );
}

const iso = (date: Temporal.PlainDate) => {
  return `${date.toString()}T00:00:00.000Z`;
};

beforeAll(async () => {
  await algorithms.register(
    {
      manifest_version: 1,
      id: "a",
      name: "a",
      version: "1.0.0",
      source: "internal",
      permissions: [],
      type: "menstruation",
    },
    { run: () => ({ days: [] }) },
  );
});

afterEach(async () => {
  await cycles.update(() => {
    return [];
  });
  await store.update((config) => {
    return { ...config, predictions: {} };
  });
});

describe("CycleInfoApp", () => {
  it("throws NoDataError without cycles", () => {
    expect(() => {
      return html();
    }).toThrow(NoDataError);
  });

  it("shows the day of the cycle and the lengths of logged cycles", async () => {
    const today = Temporal.Now.plainDateISO("UTC");
    await cycles.update(() => {
      return [
        { start_date: iso(today.subtract({ days: 30 })), period_length: 4 },
        { start_date: iso(today.subtract({ days: 2 })), period_length: 6 },
      ];
    });

    const out = html();

    expect(out).toContain("Day of cycle");
    expect(out).toContain(">3<");
    expect(out).toContain("28 days");
    expect(out).toContain("5 days");
  });

  it("lists the phases of the cycle days that have passed", async () => {
    const today = Temporal.Now.plainDateISO("UTC");
    await cycles.update(() => {
      return [
        { start_date: iso(today.subtract({ days: 4 })), period_length: 3 },
      ];
    });
    await store.update((config) => {
      return {
        ...config,
        predictions: {
          menstruation: {
            algorithm_id: "a",
            days: [{ date: iso(today.add({ days: 6 })) }],
          },
        },
      };
    });

    const out = html();

    expect(out).toContain("3 days of menstrual");
    expect(out).toContain("2 days of follicular");
  });
});
