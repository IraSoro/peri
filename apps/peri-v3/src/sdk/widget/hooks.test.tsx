import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import { service as store } from "@/services/store/service";
import { OutsideWidgetError, PermissionError } from "./errors";
import { useCycles, usePredictions } from "./hooks";
import { wrapWidget } from "./wrap";
import type { WidgetContextValue } from "./wrap";

function Cycles() {
  return <p>{useCycles().length}</p>;
}

function Predictions() {
  return <p>{Object.keys(usePredictions()).length}</p>;
}

function render(
  component: () => React.JSX.Element,
  access: WidgetContextValue,
): string {
  const Wrapped = wrapWidget("w", { component }, access).component;
  return renderToStaticMarkup(<Wrapped />);
}

const community = (...permissions: string[]): WidgetContextValue => {
  return { source: "community", permissions };
};
const internal: WidgetContextValue = { source: "internal", permissions: [] };

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
  it("returns the cycles to a community widget with cycles:read", () => {
    expect(render(Cycles, community("cycles:read"))).toBe("<p>1</p>");
  });

  it("returns the cycles to an internal widget without permissions", () => {
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

  it("returns the predictions to an internal widget", () => {
    expect(render(Predictions, internal)).toBe("<p>0</p>");
  });
});

describe("permission checks", () => {
  it("throws PermissionError for a community widget without the scope", () => {
    expect(() => {
      render(Cycles, community("predictions:read"));
    }).toThrow(new PermissionError("cycles:read"));
  });

  it("does not take one scope for another", () => {
    expect(() => {
      render(Predictions, community("cycles:read"));
    }).toThrow(new PermissionError("predictions:read"));
  });

  it("throws OutsideWidgetError outside of a widget", () => {
    expect(() => {
      renderToStaticMarkup(<Cycles />);
    }).toThrow(OutsideWidgetError);
  });
});
