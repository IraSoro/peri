// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlertProvider, AlertStack, useAlertsContext } from "./Alerts";
import type { AlertInput } from "./Alerts";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

type Handle = ReturnType<typeof useAlertsContext>;

function mount() {
  const handle = {} as { current: Handle };
  const Grab = () => {
    handle.current = useAlertsContext();
    return null;
  };
  const view = render(
    <AlertProvider>
      <Grab />
      <AlertStack />
    </AlertProvider>,
  );
  const show = (alert: AlertInput) => {
    let id = -1;
    act(() => {
      id = handle.current.showAlert(alert);
    });
    return id;
  };
  return { view, handle, show };
}

const base = { type: "info", title: "Hello", message: "Some message" } as const;

describe("AlertStack", () => {
  it("shows nothing without alerts", () => {
    const { view } = mount();

    expect(view.queryByRole("status")).toBeNull();
    expect(view.queryByRole("alert")).toBeNull();
  });

  it("shows the title and the message", () => {
    const { view, show } = mount();

    show(base);

    expect(view.getByText("Hello")).toBeTruthy();
    expect(view.getByText("Some message")).toBeTruthy();
  });

  it("announces errors and warnings as alerts, the rest as status", () => {
    const { view, show } = mount();

    show({ ...base, type: "error" });
    show({ ...base, type: "success" });

    expect(view.getAllByRole("alert")).toHaveLength(1);
    expect(view.getAllByRole("status")).toHaveLength(1);
  });

  it("puts the newest alert on top", () => {
    const { view, show } = mount();

    show({ ...base, title: "First" });
    show({ ...base, title: "Second" });

    const titles = view.getAllByText(/First|Second/).map((node) => {
      return node.textContent;
    });
    expect(titles).toEqual(["Second", "First"]);
  });

  it("closes an alert without actions after a few seconds", () => {
    vi.useFakeTimers();
    const { view, show } = mount();
    show(base);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(view.queryByText("Hello")).toBeNull();
  });

  it("keeps an alert with actions until one is pressed, then closes it", () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    const { view, show } = mount();
    show({ ...base, actions: [{ label: "Skip", onClick }] });

    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(view.getByText("Hello")).toBeTruthy();

    fireEvent.click(view.getByText("Skip"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(view.queryByText("Hello")).toBeNull();
  });

  it("closes an alert by its id", () => {
    const { view, handle, show } = mount();
    const id = show({ ...base, actions: [{ label: "Skip" }] });

    act(() => {
      handle.current.dismissAlert(id);
    });

    expect(view.queryByText("Hello")).toBeNull();
  });

  it("throws outside of the provider", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<AlertStack />)).toThrow(/AlertProvider/);
    quiet.mockRestore();
  });
});
