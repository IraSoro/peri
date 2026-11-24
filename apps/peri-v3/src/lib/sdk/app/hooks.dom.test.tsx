// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { service as cycles } from "@/services/cycles/service";
import { InternalOnlyError } from "./errors";
import { service as core } from "@/services/core/service";
import { useAlert, useAppData, useCycles, usePastPrediction } from "./hooks";
import { service as store } from "@/services/store/service";
import { AlertProvider, AlertStack } from "@/components/layouts/Alerts";
import { AppContext } from "./context";
import type { AppContextValue } from "./context";

const JAN = { start_date: "2025-01-01T00:00:00.000Z", period_length: 5 };
const FEB = { start_date: "2025-02-01T00:00:00.000Z", period_length: 5 };

const community = (...permissions: string[]): AppContextValue => {
  return { id: "test", source: "community", permissions };
};
const internal: AppContextValue = {
  id: "test",
  source: "internal",
  permissions: [],
};

type SetCycles = ReturnType<typeof useCycles>[1];

// Renders a app that shows the cycle count and hands out its setter
function mount(access: AppContextValue) {
  const handle: { setCycles?: SetCycles } = {};
  const App = () => {
    const [list, setCycles] = useCycles();
    handle.setCycles = setCycles;
    return <p data-testid="out">{list.length}</p>;
  };
  const view = render(
    <AppContext.Provider value={access}>
      <App />
    </AppContext.Provider>,
  );
  return { view, handle };
}

afterEach(async () => {
  cleanup();
  await cycles.update(() => {
    return [];
  });
});

describe("useCycles in a mounted app", () => {
  it("re-renders when the cycles change", async () => {
    const { view } = mount(community("cycles:read"));
    expect(view.getByTestId("out").textContent).toBe("0");

    await act(async () => {
      await cycles.update(() => {
        return [JAN];
      });
    });

    expect(view.getByTestId("out").textContent).toBe("1");
  });

  it("lets an internal app write through the setter", async () => {
    const { view, handle } = mount(internal);

    await act(async () => {
      await handle.setCycles?.(() => {
        return [JAN, FEB];
      });
    });

    expect(view.getByTestId("out").textContent).toBe("2");
  });

  it("throws from the setter of a community app and keeps the cycles", () => {
    const { view, handle } = mount(community("cycles:read"));

    expect(() => {
      return handle.setCycles?.(() => {
        return [JAN];
      });
    }).toThrow(InternalOnlyError);
    expect(view.getByTestId("out").textContent).toBe("0");
  });
});

describe("usePastPrediction", () => {
  const OLD = { ...JAN, end_date: FEB.start_date, cycle_length: 31 };

  afterEach(async () => {
    await core.unregisterAlgorithm("test.ovulation");
  });

  // Renders the days the hook gives for the first cycle, "loading" before
  function mountPrediction() {
    const App = () => {
      const [list] = useCycles();
      const first = list[0];
      const days = usePastPrediction("ovulation", first ?? JAN);
      return (
        <p data-testid="out">
          {days
            ? days
                .map((day) => {
                  return day.date.slice(0, 10);
                })
                .join(",")
            : "loading"}
        </p>
      );
    };
    return render(
      <AppContext.Provider value={internal}>
        <App />
      </AppContext.Provider>,
    );
  }

  it("runs the active algorithm on the history of the cycle", async () => {
    const seen: number[] = [];
    await core.registerAlgorithm(
      {
        manifest_version: 1,
        id: "test.ovulation",
        name: "test",
        version: "1.0.0",
        source: "internal",
        permissions: [],
        type: "ovulation",
      },
      {
        run: ({ cycles: history }) => {
          seen.push(history.length);
          return { days: [{ date: "2025-01-15T00:00:00.000Z" }] };
        },
      },
    );
    await core.setActiveAlgorithm("ovulation", "test.ovulation");
    await act(async () => {
      await cycles.update(() => {
        return [JAN, FEB];
      });
    });
    seen.length = 0;

    const view = mountPrediction();
    expect(view.getByTestId("out").textContent).toBe("loading");

    await act(async () => {
      await Promise.resolve();
    });

    expect(view.getByTestId("out").textContent).toBe("2025-01-15");
    // The history of the first cycle is the cycle itself
    expect(seen).toContain(1);
  });

  it("gives no days when no algorithm is active", async () => {
    await act(async () => {
      await cycles.update(() => {
        return [OLD, FEB];
      });
    });

    const view = mountPrediction();
    await act(async () => {
      await Promise.resolve();
    });

    expect(view.getByTestId("out").textContent).toBe("");
  });
});

describe("useAlert", () => {
  const mountAlert = (access: AppContextValue) => {
    const handle: { show?: ReturnType<typeof useAlert>["show"] } = {};
    const App = () => {
      handle.show = useAlert().show;
      return null;
    };
    render(
      <AppContext.Provider value={access}>
        <AlertProvider>
          <App />
          <AlertStack />
        </AlertProvider>
      </AppContext.Provider>,
    );
    return handle;
  };
  const alert = { type: "info", title: "Hello", message: "Text" } as const;

  it("lets an internal app show an alert", () => {
    const handle = mountAlert(internal);

    act(() => {
      handle.show?.(alert);
    });

    expect(document.body.textContent).toContain("Hello");
  });

  it("refuses a community app", () => {
    const handle = mountAlert(community("cycles:read"));

    expect(() => {
      return handle.show?.(alert);
    }).toThrow(InternalOnlyError);
  });
});

describe("useAppData", () => {
  const manifest = {
    manifest_version: 1 as const,
    id: "test",
    name: "test",
    version: "1.0.0",
    source: "internal" as const,
    permissions: [],
  };

  const setData = async (data: Record<string, unknown>) => {
    await store.update((config) => {
      return { ...config, apps: [{ manifest, data }] };
    });
  };

  afterEach(async () => {
    await store.update((config) => {
      return { ...config, apps: [] };
    });
  });

  function mountData(access: AppContextValue) {
    const handle: { update?: ReturnType<typeof useAppData>[1] } = {};
    const App = () => {
      const [data, update] = useAppData();
      handle.update = update;
      return <p data-testid="out">{JSON.stringify(data)}</p>;
    };
    const view = render(
      <AppContext.Provider value={access}>
        <App />
      </AppContext.Provider>,
    );
    return { view, handle };
  }

  it("gives the data of the app itself", async () => {
    await setData({ color: "red" });
    const { view } = mountData(internal);
    expect(view.getByTestId("out").textContent).toBe('{"color":"red"}');
  });

  it("gives an empty object for an app that is not stored", () => {
    const { view } = mountData({ ...internal, id: "unknown" });
    expect(view.getByTestId("out").textContent).toBe("{}");
  });

  it("writes the data of the app and re-renders", async () => {
    await setData({});
    const { view, handle } = mountData(internal);
    await act(async () => {
      await handle.update?.((data) => {
        return { ...data, color: "blue" };
      });
    });
    expect(view.getByTestId("out").textContent).toBe('{"color":"blue"}');
  });
});
