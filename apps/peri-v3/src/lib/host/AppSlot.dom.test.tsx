// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AppManifest } from "@repo/config-schema/config-v2.schema";
import { service as apps } from "@/services/apps/service";
import { AppSlot } from "./AppSlot";

const manifest = (id: string): AppManifest => {
  return {
    manifest_version: 1,
    id,
    name: id,
    version: "1.0.0",
    source: "internal",
    permissions: [],
  };
};

afterEach(async () => {
  cleanup();
  await apps.unregister("test.app");
});

describe("AppSlot", () => {
  it("renders the registered component", async () => {
    await apps.register(manifest("test.app"), {
      component: () => <p>hello</p>,
    });

    const view = render(<AppSlot id="test.app" />);

    expect(view.getByText("hello")).toBeTruthy();
  });

  it("shows a placeholder for an id with no code", () => {
    const view = render(<AppSlot id="test.missing" />);

    expect(view.getByText(/is not installed/)).toBeTruthy();
  });

  it("renders the app once it is registered", async () => {
    const view = render(<AppSlot id="test.app" />);
    expect(view.queryByText("late")).toBeNull();

    await act(async () => {
      await apps.register(manifest("test.app"), {
        component: () => <p>late</p>,
      });
    });

    expect(view.getByText("late")).toBeTruthy();
  });
});
