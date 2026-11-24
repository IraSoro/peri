// @vitest-environment jsdom
import type { ReactNode } from "react";
import { Temporal } from "temporal-polyfill";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlertProvider, useAlertsContext } from "@/components/layouts/Alerts";
import { FooterProvider } from "@/components/layouts/Footer";
import { AppContext } from "@/lib/sdk/app/context";
import { toLocalDate, toLocalMidnight } from "@/lib/sdk/calculations/dates";
import { service as cycles } from "@/services/cycles/service";
import { containsDay } from "../periods";
import { useCalendarEdit } from "./useCalendarEdit";

const wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <AppContext.Provider
      value={{ id: "test", source: "internal", permissions: [] }}
    >
      <AlertProvider>
        <FooterProvider>{children}</FooterProvider>
      </AlertProvider>
    </AppContext.Provider>
  );
};

// A local noon, so every time zone agrees about the day
const date = (iso: string) => {
  return new Date(`${iso}T12:00:00`);
};
const day = (iso: string) => {
  return Temporal.PlainDate.from(iso);
};

afterEach(async () => {
  cleanup();
  await cycles.update(() => {
    return [];
  });
});

const edit = () => {
  const hook = renderHook(() => useCalendarEdit(), { wrapper });
  act(() => {
    hook.result.current.hold();
  });
  return hook;
};

describe("useCalendarEdit", () => {
  it("starts editing on a hold", () => {
    const { result } = renderHook(() => useCalendarEdit(), { wrapper });
    expect(result.current.editing).toBe(false);
    act(() => {
      result.current.hold();
    });
    expect(result.current.editing).toBe(true);
  });

  it("marks and clears a tapped day, and undoes it", () => {
    const { result } = edit();
    act(() => {
      result.current.tap(date("2025-03-10"));
    });
    expect(containsDay(result.current.periods, day("2025-03-10"))).toBe(true);
    expect(result.current.canUndo).toBe(true);
    act(() => {
      result.current.undo();
    });
    expect(result.current.periods).toEqual([]);
  });

  it("paints the days between the start and the finger", () => {
    const { result } = edit();
    let mode: ReturnType<typeof result.current.beginPaint> = null;
    act(() => {
      mode = result.current.beginPaint(date("2025-03-11"));
    });
    expect(mode).toBe("add");
    act(() => {
      result.current.paintTo(day("2025-03-11"), day("2025-03-15"), "add");
    });
    for (const iso of ["11", "12", "13", "14", "15"]) {
      expect(containsDay(result.current.periods, day(`2025-03-${iso}`))).toBe(
        true,
      );
    }
  });

  it("gives days back when the finger moves back", () => {
    const { result } = edit();
    act(() => {
      result.current.beginPaint(date("2025-03-11"));
    });
    act(() => {
      result.current.paintTo(day("2025-03-11"), day("2025-03-15"), "add");
    });
    act(() => {
      result.current.paintTo(day("2025-03-11"), day("2025-03-12"), "add");
    });
    expect(containsDay(result.current.periods, day("2025-03-12"))).toBe(true);
    for (const iso of ["13", "14", "15"]) {
      expect(containsDay(result.current.periods, day(`2025-03-${iso}`))).toBe(
        false,
      );
    }
  });

  it("clears days of a marked period and puts them back when the finger returns", async () => {
    await cycles.update(() => {
      return [
        {
          start_date: toLocalMidnight(day("2025-03-10")),
          period_length: 5,
        },
      ];
    });
    const { result } = edit();
    let mode: ReturnType<typeof result.current.beginPaint> = null;
    act(() => {
      mode = result.current.beginPaint(date("2025-03-12"));
    });
    expect(mode).toBe("remove");
    act(() => {
      result.current.paintTo(day("2025-03-12"), day("2025-03-14"), "remove");
    });
    expect(containsDay(result.current.periods, day("2025-03-13"))).toBe(false);
    expect(containsDay(result.current.periods, day("2025-03-14"))).toBe(false);
    act(() => {
      result.current.paintTo(day("2025-03-12"), day("2025-03-13"), "remove");
    });
    expect(containsDay(result.current.periods, day("2025-03-13"))).toBe(false);
    expect(containsDay(result.current.periods, day("2025-03-14"))).toBe(true);
    expect(containsDay(result.current.periods, day("2025-03-11"))).toBe(true);
  });

  it("undoes a whole stroke in one step", () => {
    const { result } = edit();
    act(() => {
      result.current.beginPaint(date("2025-03-11"));
    });
    act(() => {
      result.current.paintTo(day("2025-03-11"), day("2025-03-14"), "add");
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.periods).toEqual([]);
  });

  it("saves the draft as cycles and leaves edit mode", async () => {
    const { result } = edit();
    act(() => {
      result.current.tap(date("2025-03-10"));
    });
    act(() => {
      result.current.tap(date("2025-03-11"));
    });
    await act(async () => {
      await result.current.save();
    });
    expect(result.current.editing).toBe(false);
    const saved = cycles.get();
    expect(saved).toHaveLength(1);
    expect(saved[0].period_length).toBe(2);
    expect(toLocalDate(saved[0].start_date).toString()).toBe("2025-03-10");
  });

  it("drops the draft on discard", () => {
    const { result } = edit();
    act(() => {
      result.current.tap(date("2025-03-10"));
    });
    act(() => {
      result.current.discard();
    });
    expect(result.current.editing).toBe(false);
    expect(result.current.periods).toEqual([]);
  });

  it("logs a period that starts today without edit mode", async () => {
    const { result } = renderHook(() => useCalendarEdit(), { wrapper });
    await act(async () => {
      await result.current.markToday(3);
    });
    expect(result.current.editing).toBe(false);
    expect(cycles.get()[0].period_length).toBe(3);
    expect(
      toLocalDate(cycles.get()[0].start_date).equals(
        Temporal.Now.plainDateISO(),
      ),
    ).toBe(true);
  });

  it("shows the message of a failed validation and stays in edit mode", async () => {
    const { result } = renderHook(
      () => {
        return { edit: useCalendarEdit(), alerts: useAlertsContext() };
      },
      { wrapper },
    );
    act(() => {
      result.current.edit.hold();
    });
    act(() => {
      result.current.edit.tap(date("2025-03-10"));
    });
    const spy = vi.spyOn(cycles, "update").mockResolvedValue({
      ok: false,
      error: { code: "invalid_cycle", message: "periods overlap" },
    });
    await act(async () => {
      await result.current.edit.save();
    });
    spy.mockRestore();
    expect(result.current.edit.editing).toBe(true);
    expect(result.current.edit.periods).toHaveLength(1);
    expect(result.current.alerts.alerts[0]).toMatchObject({
      type: "error",
      title: "Can't save",
      message: "periods overlap",
    });
  });
});
