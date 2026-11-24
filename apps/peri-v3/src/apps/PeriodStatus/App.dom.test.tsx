// @vitest-environment jsdom
import { Temporal } from "temporal-polyfill";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { AppContext } from "@/lib/sdk/app/context";
import { service as store } from "@/services/store/service";
import { service as cycles } from "@/services/cycles/service";
import { service as algorithms } from "@/services/algorithms/service";
import { PeriodStatusApp } from "./App";

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
  await cycles.update(() => {
    return [
      {
        start_date: `${Temporal.Now.plainDateISO("UTC").toString()}T00:00:00.000Z`,
        period_length: 5,
      },
    ];
  });
  const today = Temporal.Now.plainDateISO("UTC");
  await store.update((config) => {
    return {
      ...config,
      predictions: {
        menstruation: {
          algorithm_id: "a",
          days: [{ date: `${today.toString()}T00:00:00.000Z` }],
        },
      },
    };
  });
});

afterEach(() => {
  cleanup();
});

describe("info icons", () => {
  it("show what the phase is on click", async () => {
    const view = render(
      <AppContext.Provider
        value={{ id: "test", source: "internal", permissions: [] }}
      >
        <PeriodStatusApp />
      </AppContext.Provider>,
    );
    expect(view.queryByText(/Current phase of the cycle/)).toBeNull();

    fireEvent.click(view.getByLabelText("About menstrual"));

    expect(await view.findByText(/Current phase of the cycle/)).toBeTruthy();
  });

  it("show what the pregnancy chance is on click", async () => {
    const view = render(
      <AppContext.Provider
        value={{ id: "test", source: "internal", permissions: [] }}
      >
        <PeriodStatusApp />
      </AppContext.Provider>,
    );

    fireEvent.click(view.getByLabelText("About Low"));

    expect(await view.findByText(/Chance of getting pregnant/)).toBeTruthy();
  });
});
