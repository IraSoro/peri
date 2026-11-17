// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppManifest } from "@repo/config-schema/config-v2.schema";
import { service as apps } from "@/services/apps/service";
import { service as cycles } from "@/services/cycles/service";
import { useCycles } from "@/lib/sdk/app/hooks";
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
  await apps.unregister("test.ok");
  await cycles.update(() => {
    return [];
  });
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

  it("gives a community app only the permissions of its manifest", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const ReadsCyclesWithoutPermission = () => {
      useCycles();
      return <p>secret</p>;
    };
    await apps.register(
      {
        ...manifest("test.app"),
        source: "community",
        permissions: [],
        installed_at: "2025-01-01T00:00:00.000Z",
      },
      { component: ReadsCyclesWithoutPermission },
    );
    await apps.register(manifest("test.ok"), {
      component: () => <p>fine</p>,
    });

    const view = render(
      <>
        <AppSlot id="test.app" />
        <AppSlot id="test.ok" />
      </>,
    );
    quiet.mockRestore();

    expect(view.container.textContent).toContain('"cycles:read"');
    expect(view.container.textContent).not.toContain("secret");
    expect(view.container.textContent).toContain("fine");
  });

  it("shows the message of an app that fails to render", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    await apps.register(manifest("test.app"), {
      component: () => {
        throw new Error("boom");
      },
    });

    const view = render(<AppSlot id="test.app" />);
    quiet.mockRestore();

    expect(view.container.textContent).toContain("boom");
  });

  it("copes with a thrown value that is not an error", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    await apps.register(manifest("test.app"), {
      component: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw "oops";
      },
    });

    const view = render(<AppSlot id="test.app" />);
    quiet.mockRestore();

    expect(view.container.textContent).toContain("oops");
  });

  it("renders a failed app again once the data changes", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const NeedsCycles = () => {
      const [list] = useCycles();
      if (list.length === 0) {
        throw new Error("no cycles yet");
      }
      return <p>ready</p>;
    };
    await apps.register(manifest("test.app"), { component: NeedsCycles });
    const view = render(<AppSlot id="test.app" />);
    expect(view.getByText(/no cycles yet/)).toBeTruthy();

    await act(async () => {
      await cycles.update(() => {
        return [{ start_date: "2025-01-01T00:00:00.000Z", period_length: 5 }];
      });
    });

    expect(view.getByText("ready")).toBeTruthy();
    quiet.mockRestore();
  });
});
