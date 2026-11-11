// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { service as cycles } from "@/services/cycles/service";
import { InternalOnlyError } from "./errors";
import { useCycles } from "./hooks";
import { wrapWidget } from "./wrap";
import type { WidgetContextValue } from "./wrap";

const JAN = { start_date: "2025-01-01T00:00:00.000Z", period_length: 5 };
const FEB = { start_date: "2025-02-01T00:00:00.000Z", period_length: 5 };

const community = (...permissions: string[]): WidgetContextValue => {
  return { source: "community", permissions };
};
const internal: WidgetContextValue = { source: "internal", permissions: [] };

type SetCycles = ReturnType<typeof useCycles>[1];

// Renders a widget that shows the cycle count and hands out its setter
function mount(access: WidgetContextValue) {
  const handle: { setCycles?: SetCycles } = {};
  const Widget = () => {
    const [list, setCycles] = useCycles();
    handle.setCycles = setCycles;
    return <p data-testid="out">{list.length}</p>;
  };
  const Wrapped = wrapWidget("w", { component: Widget }, access).component;
  const view = render(<Wrapped />);
  return { view, handle };
}

afterEach(async () => {
  cleanup();
  await cycles.update(() => {
    return [];
  });
});

describe("useCycles in a mounted widget", () => {
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

  it("lets an internal widget write through the setter", async () => {
    const { view, handle } = mount(internal);

    await act(async () => {
      await handle.setCycles?.(() => {
        return [JAN, FEB];
      });
    });

    expect(view.getByTestId("out").textContent).toBe("2");
  });

  it("throws from the setter of a community widget and keeps the cycles", () => {
    const { view, handle } = mount(community("cycles:read"));

    expect(() => {
      return handle.setCycles?.(() => {
        return [JAN];
      });
    }).toThrow(InternalOnlyError);
    expect(view.getByTestId("out").textContent).toBe("0");
  });
});

describe("WidgetBoundary in a mounted tree", () => {
  it("shows the fallback for a widget without the permission", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const Widget = () => {
      useCycles();
      return <p>secret</p>;
    };
    const Broken = wrapWidget(
      "w",
      { component: Widget },
      community(),
    ).component;
    const Fine = wrapWidget(
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
