// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { service as cycles } from "@/services/cycles/service";
import { InternalOnlyError } from "./errors";
import { useCycles } from "./hooks";
import { wrapApp } from "./Wrap";
import type { AppContextValue } from "./Wrap";

const JAN = { start_date: "2025-01-01T00:00:00.000Z", period_length: 5 };
const FEB = { start_date: "2025-02-01T00:00:00.000Z", period_length: 5 };

const community = (...permissions: string[]): AppContextValue => {
  return { source: "community", permissions };
};
const internal: AppContextValue = { source: "internal", permissions: [] };

type SetCycles = ReturnType<typeof useCycles>[1];

// Renders a app that shows the cycle count and hands out its setter
function mount(access: AppContextValue) {
  const handle: { setCycles?: SetCycles } = {};
  const App = () => {
    const [list, setCycles] = useCycles();
    handle.setCycles = setCycles;
    return <p data-testid="out">{list.length}</p>;
  };
  const Wrapped = wrapApp("w", { component: App }, access).component;
  const view = render(<Wrapped />);
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

describe("AppBoundary in a mounted tree", () => {
  it("shows the fallback for a app without the permission", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const App = () => {
      useCycles();
      return <p>secret</p>;
    };
    const Broken = wrapApp("w", { component: App }, community()).component;
    const Fine = wrapApp(
      "ok",
      { component: () => <p>fine</p> },
      community(),
    ).component;

    const view = render(
      <>
        <Broken />
        <Fine />
      </>,
    );
    quiet.mockRestore();

    expect(view.container.textContent).toContain('"cycles:read"');
    expect(view.container.textContent).not.toContain("secret");
    expect(view.container.textContent).toContain("fine");
  });
});
