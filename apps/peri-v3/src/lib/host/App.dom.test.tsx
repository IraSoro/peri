// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { service as apps } from "@/services/apps/service";
import { App } from "./App";

const manifest = (id: string) => {
  return {
    manifest_version: 1,
    id,
    name: id,
    version: "1.0.0",
    source: "internal" as const,
    permissions: [],
  };
};

afterEach(async () => {
  cleanup();
  await apps.unregister("test.app");
});

describe("App", () => {
  it("renders the registered component", async () => {
    await apps.register(manifest("test.app"), {
      component: () => <p>hello</p>,
    });

    const view = render(<App id="test.app" />);

    expect(view.getByText("hello")).toBeTruthy();
  });

  it("shows a placeholder for an id with no code", () => {
    const view = render(<App id="test.missing" />);

    expect(view.getByText(/is not installed/)).toBeTruthy();
  });

  it("renders the app once it is registered", async () => {
    const view = render(<App id="test.app" />);
    expect(view.queryByText("late")).toBeNull();

    await act(async () => {
      await apps.register(manifest("test.app"), {
        component: () => <p>late</p>,
      });
    });

    expect(view.getByText("late")).toBeTruthy();
  });
});
