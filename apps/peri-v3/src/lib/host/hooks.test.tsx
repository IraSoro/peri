import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AlgorithmManifest } from "@repo/config-schema/config-v2.schema";
import { service as core } from "@/services/core/service";
import { service as algorithms } from "@/services/algorithms/service";
import { PagerProvider } from "@/components/layouts/PagerProvider";
import {
  useActiveAlgorithm,
  useAlgorithms,
  useApps,
  useCanGoNextPage,
  useCanGoPrevPage,
  useCycles,
  usePredictions,
} from "./hooks";

const manifest: AlgorithmManifest = {
  manifest_version: 1,
  id: "host-test",
  name: "host-test",
  version: "1.0.0",
  source: "internal",
  permissions: [],
  type: "menstruation",
};

describe("host hooks", () => {
  it("returns cycles with a setter", () => {
    const Probe = () => {
      const [cycles, setCycles] = useCycles();
      return <p>{`${cycles.length}-${typeof setCycles}`}</p>;
    };

    expect(renderToStaticMarkup(<Probe />)).toBe("<p>0-function</p>");
  });

  it("returns the predictions", () => {
    const Probe = () => {
      return <p>{typeof usePredictions()}</p>;
    };

    expect(renderToStaticMarkup(<Probe />)).toBe("<p>object</p>");
  });

  it("tells if the pager can go next or back", () => {
    const Probe = () => {
      return <p>{`${useCanGoNextPage()}-${useCanGoPrevPage()}`}</p>;
    };

    const html = renderToStaticMarkup(
      <PagerProvider pageIds={["a", "b"]}>
        <Probe />
      </PagerProvider>,
    );

    expect(html).toBe("<p>true-false</p>");
  });

  it("lists the apps of the default config", () => {
    const Probe = () => {
      return (
        <p>
          {useApps()
            .map((m) => m.id)
            .join()}
        </p>
      );
    };

    expect(renderToStaticMarkup(<Probe />)).toContain("com.peri.calendar");
  });

  it("follows a registered and activated algorithm", async () => {
    await algorithms.register(manifest, {
      run: () => ({ days: [] }),
    });
    await core.setActiveAlgorithm("menstruation", "host-test");
    const Probe = () => {
      const ids = useAlgorithms().map((m) => m.id);
      return (
        <p>{`${ids.includes("host-test")}|${useActiveAlgorithm("menstruation")}`}</p>
      );
    };

    expect(renderToStaticMarkup(<Probe />)).toBe("<p>true|host-test</p>");
  });
});
