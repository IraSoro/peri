import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import { service as store } from "@/services/store/service";
import { InternalOnlyError, OutsideAppError, PermissionError } from "./errors";
import { useCycles, usePredictions } from "./hooks";
import { wrapApp } from "./Wrap";
import type { AppContextValue } from "./Wrap";

function Cycles() {
  const [cycles] = useCycles();
  return <p>{cycles.length}</p>;
}

function Predictions() {
  return <p>{Object.keys(usePredictions()).length}</p>;
}

function render(
  component: () => React.JSX.Element,
  access: AppContextValue,
): string {
  const Wrapped = wrapApp("w", { component }, access).component;
  return renderToStaticMarkup(<Wrapped />);
}

const community = (...permissions: string[]): AppContextValue => {
  return { source: "community", permissions };
};
const internal: AppContextValue = { source: "internal", permissions: [] };

beforeAll(async () => {
  await store.update((config) => {
    return {
      ...config,
      cycles: [
        {
          start_date: "2025-01-01T00:00:00.000Z",
          end_date: null,
          period_length: 5,
          cycle_length: null,
        },
      ],
    };
  });
});

describe("useCycles", () => {
  it("returns the cycles to a community app with cycles:read", () => {
    expect(render(Cycles, community("cycles:read"))).toBe("<p>1</p>");
  });

  it("returns the cycles to an internal app without permissions", () => {
    expect(render(Cycles, internal)).toBe("<p>1</p>");
  });

  it("follows the store", async () => {
    await store.update((config) => {
      return { ...config, cycles: [] };
    });

    expect(render(Cycles, internal)).toBe("<p>0</p>");
  });
});

describe("usePredictions", () => {
  it("returns the predictions with predictions:read", () => {
    expect(render(Predictions, community("predictions:read"))).toBe("<p>0</p>");
  });

  it("returns the predictions to an internal app", () => {
    expect(render(Predictions, internal)).toBe("<p>0</p>");
  });
});

describe("permission checks", () => {
  it("throws PermissionError for a community app without the scope", () => {
    expect(() => {
      render(Cycles, community("predictions:read"));
    }).toThrow(new PermissionError("cycles:read"));
  });

  it("does not take one scope for another", () => {
    expect(() => {
      render(Predictions, community("cycles:read"));
    }).toThrow(new PermissionError("predictions:read"));
  });

  it("throws OutsideAppError outside of a app", () => {
    expect(() => {
      renderToStaticMarkup(<Cycles />);
    }).toThrow(OutsideAppError);
  });
});

describe("setCycles", () => {
  let setter: ReturnType<typeof useCycles>[1];

  function Grab() {
    [, setter] = useCycles();
    return <p />;
  }

  it("writes through for an internal app", async () => {
    render(Grab, internal);

    const res = await setter(() => {
      return [{ start_date: "2025-02-01T00:00:00.000Z", period_length: 4 }];
    });

    expect(res).toEqual({ ok: true });
    expect(store.get().cycles[0]?.start_date).toBe("2025-02-01T00:00:00.000Z");
  });

  it("throws InternalOnlyError when a community app calls it", () => {
    render(Grab, community("cycles:read"));

    expect(() => {
      void setter((cycles) => {
        return cycles;
      });
    }).toThrow(new InternalOnlyError("edit cycles"));
  });
});
