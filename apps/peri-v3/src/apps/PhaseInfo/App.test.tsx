import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { AppContext } from "@/lib/sdk/app/context";
import { NoDataError } from "@/lib/sdk/app/errors";
import { service as cycles } from "@/services/cycles/service";
import { PhaseInfoApp } from "./App";

const render = () => {
  return renderToStaticMarkup(
    <AppContext.Provider
      value={{ id: "test", source: "internal", permissions: [] }}
    >
      <PhaseInfoApp />
    </AppContext.Provider>,
  );
};

afterEach(async () => {
  await cycles.update(() => {
    return [];
  });
});

describe("PhaseInfoApp", () => {
  it("has no data before the first period is logged", () => {
    expect(render).toThrow(NoDataError);
  });

  it("shows the phase of a logged cycle", async () => {
    await cycles.update(() => {
      return [{ start_date: "2020-01-01T00:00:00.000Z", period_length: 5 }];
    });

    const html = render();

    expect(html).toContain("Follicular phase");
  });
});
