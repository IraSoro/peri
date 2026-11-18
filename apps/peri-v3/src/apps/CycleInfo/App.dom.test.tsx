// @vitest-environment jsdom
import { Temporal } from "temporal-polyfill";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppContext } from "@/lib/sdk/app/context";
import { service as cycles } from "@/services/cycles/service";
import { CycleInfoApp } from "./App";

const iso = (date: Temporal.PlainDate) => {
  return `${date.toString()}T00:00:00.000Z`;
};

function view() {
  return render(
    <AppContext.Provider value={{ source: "internal", permissions: [] }}>
      <CycleInfoApp />
    </AppContext.Provider>,
  );
}

async function log(...daysAgo: number[]) {
  const today = Temporal.Now.plainDateISO("UTC");
  await act(async () => {
    await cycles.update(() => {
      return daysAgo.map((days) => {
        return { start_date: iso(today.subtract({ days })), period_length: 5 };
      });
    });
  });
}

afterEach(async () => {
  cleanup();
  await cycles.update(() => {
    return [];
  });
});

describe("Statistics", () => {
  it("is hidden while there is only the current cycle", async () => {
    await log(2);

    expect(view().queryByText("Statistics")).toBeNull();
  });

  it("opens the previous cycles, without the current one", async () => {
    await log(30, 2);
    const screen = view();

    fireEvent.click(screen.getByText("Statistics"));

    expect(await screen.findByText("Cycle lasted 28 days")).toBeTruthy();
    expect(screen.getAllByText("Cycle lasted 28 days")).toHaveLength(1);
  });

  it("closes on Escape", async () => {
    await log(30, 2);
    const screen = view();
    fireEvent.click(screen.getByText("Statistics"));
    await screen.findByText("Cycle lasted 28 days");

    fireEvent.keyDown(document.body, { key: "Escape" });

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByText("Cycle lasted 28 days")).toBeNull();
  });

  it("has a title and a close button", async () => {
    await log(30, 2);
    const screen = view();
    fireEvent.click(screen.getByText("Statistics"));
    await screen.findByText("Cycle lasted 28 days");

    expect(screen.getAllByText("Statistics")).toHaveLength(2);
    fireEvent.click(screen.getByLabelText("Close"));

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByText("Cycle lasted 28 days")).toBeNull();
  });
});
