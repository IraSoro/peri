// @vitest-environment jsdom
import type { ReactElement, ReactNode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render as renderPlain,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppManifest } from "@repo/config-schema/config-v2.schema";
import { service as apps } from "@/services/apps/service";
import { service as cycles } from "@/services/cycles/service";
import { useCycles } from "@/lib/sdk/app/hooks";
import { NoDataError } from "@/lib/sdk/app/errors";
import { AlertProvider, AlertStack } from "@/components/layouts/Alerts";
import { AppSlot } from "./AppSlot";

// Copying the details of a failed app tells about it with an alert
const Shell = ({ children }: { children: ReactNode }) => {
  return (
    <AlertProvider>
      {children}
      <AlertStack />
    </AlertProvider>
  );
};

const render = (ui: ReactElement) => {
  return renderPlain(ui, { wrapper: Shell });
};

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

/** Clicks "Copy details" of the failed app and returns what it copied */
async function copiedDetails(view: ReturnType<typeof render>) {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  await act(async () => {
    fireEvent.click(view.getByText("Copy details"));
    await Promise.resolve();
  });
  return String(writeText.mock.calls[0]?.[0]);
}

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

    expect(view.container.textContent).toContain("Something went wrong");
    expect(await copiedDetails(view)).toContain('"cycles:read"');
    expect(view.container.textContent).not.toContain("secret");
    expect(view.container.textContent).toContain("fine");
  });

  it("offers the message of an app that fails to render to copy", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    await apps.register(manifest("test.app"), {
      component: () => {
        throw new Error("boom");
      },
    });

    const view = render(<AppSlot id="test.app" />);
    quiet.mockRestore();

    expect(view.container.textContent).toContain("Something went wrong");
    expect(await copiedDetails(view)).toContain("boom");
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

    expect(await copiedDetails(view)).toContain("oops");
  });

  it("shows the empty state for an app that has no data", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    await apps.register(manifest("test.app"), {
      component: () => {
        throw new NoDataError("Appears later");
      },
    });

    const view = render(<AppSlot id="test.app" />);
    quiet.mockRestore();

    expect(view.getByText("Nothing here yet")).toBeTruthy();
    expect(view.getByText("Appears later")).toBeTruthy();
    expect(view.queryByRole("button")).toBeNull();
  });

  it("has only a copy button in the error state, which tells that it copied", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    await apps.register(manifest("test.app"), {
      component: () => {
        throw new Error("boom");
      },
    });
    const view = render(<AppSlot id="test.app" />);
    quiet.mockRestore();
    vi.useFakeTimers();

    expect(view.getAllByRole("button")).toHaveLength(1);
    await copiedDetails(view);
    expect(view.getByRole("status").textContent).toContain("Copied");
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(view.queryByText("Copied")).toBeNull();
    vi.useRealTimers();
  });

  it("copies by selection where there is no clipboard API", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    await apps.register(manifest("test.app"), {
      component: () => {
        throw new Error("boom");
      },
    });
    const view = render(<AppSlot id="test.app" />);
    quiet.mockRestore();
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    let selected = "";
    const exec = vi.fn(() => {
      selected = document.querySelector("textarea")?.value ?? "";
      return true;
    });
    Object.defineProperty(document, "execCommand", {
      value: exec,
      configurable: true,
    });

    await act(async () => {
      fireEvent.click(view.getByText("Copy details"));
      await Promise.resolve();
    });

    expect(exec).toHaveBeenCalledWith("copy");
    expect(selected).toContain("boom");
    expect(document.querySelector("textarea")).toBeNull();
    expect(view.getByRole("status").textContent).toContain("Copied");
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
    expect(view.getByText("Something went wrong")).toBeTruthy();

    await act(async () => {
      await cycles.update(() => {
        return [{ start_date: "2025-01-01T00:00:00.000Z", period_length: 5 }];
      });
    });

    expect(view.getByText("ready")).toBeTruthy();
    quiet.mockRestore();
  });
});
