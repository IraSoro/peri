// @vitest-environment jsdom
import type { ReactNode } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AlertProvider } from "@/components/layouts/Alerts";
import { AppContext } from "@/lib/sdk/app/context";
import { service as store } from "@/services/store/service";
import { useWeekStart } from "./settings";

const manifest = {
  manifest_version: 1 as const,
  id: "test",
  name: "test",
  version: "1.0.0",
  source: "internal" as const,
  permissions: [],
};

const wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <AppContext.Provider
      value={{ id: "test", source: "internal", permissions: [] }}
    >
      <AlertProvider>{children}</AlertProvider>
    </AppContext.Provider>
  );
};

const setData = async (data: Record<string, unknown>) => {
  await store.update((config) => {
    return { ...config, apps: [{ manifest, data }] };
  });
};

afterEach(async () => {
  cleanup();
  await store.update((config) => {
    return { ...config, apps: [] };
  });
});

describe("useWeekStart", () => {
  it("is Sunday when nothing is stored", async () => {
    await setData({});
    const { result } = renderHook(() => useWeekStart(), { wrapper });
    expect(result.current[0]).toBe(0);
  });

  it("reads the stored week start", async () => {
    await setData({ week_starts_on: 1 });
    const { result } = renderHook(() => useWeekStart(), { wrapper });
    expect(result.current[0]).toBe(1);
  });

  it("falls back to Sunday for a value that is not a week start", async () => {
    await setData({ week_starts_on: "monday" });
    const { result } = renderHook(() => useWeekStart(), { wrapper });
    expect(result.current[0]).toBe(0);
  });

  it("stores a new week start and keeps the other data", async () => {
    await setData({ other: true });
    const { result } = renderHook(() => useWeekStart(), { wrapper });
    await act(async () => {
      result.current[1](6);
      await Promise.resolve();
    });
    expect(result.current[0]).toBe(6);
    expect(store.get().apps[0].data).toEqual({
      other: true,
      week_starts_on: 6,
    });
  });
});
