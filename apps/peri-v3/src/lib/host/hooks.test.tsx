import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { service as core } from "@/services/core/service";
import { service as algorithms } from "@/services/algorithms/service";
import { useActiveAlgorithm, useAlgorithms, useApps, useCycles } from "./hooks";

const manifest = {
  manifest_version: 1,
  id: "host-test",
  name: "host-test",
  version: "1.0.0",
  source: "internal" as const,
  permissions: [],
};

describe("host hooks", () => {
  it("returns cycles with a setter", () => {
    const Probe = () => {
      const [cycles, setCycles] = useCycles();
      return <p>{`${cycles.length}-${typeof setCycles}`}</p>;
    };

    expect(renderToStaticMarkup(<Probe />)).toBe("<p>0-function</p>");
  });

  it("lists the apps", () => {
    const Probe = () => {
      return <p>{useApps().length}</p>;
    };

    expect(renderToStaticMarkup(<Probe />)).toBe("<p>0</p>");
  });

  it("follows a registered and activated algorithm", async () => {
    await algorithms.register(manifest, { run: () => ({}) });
    await core.setActiveAlgorithm("menstruation", "host-test");
    const Probe = () => {
      const ids = useAlgorithms().map((m) => m.id);
      return <p>{`${ids.join()}|${useActiveAlgorithm("menstruation")}`}</p>;
    };

    expect(renderToStaticMarkup(<Probe />)).toBe("<p>host-test|host-test</p>");
  });
});
