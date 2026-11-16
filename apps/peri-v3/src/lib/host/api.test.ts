import { describe, expect, it, vi } from "vitest";
import type {
  AlgorithmManifest,
  AppManifest,
  ConfigV2,
} from "@repo/config-schema/config-v2.schema";
import type { CycleInput } from "@/services/cycles/types";
import { createHostApi } from "./api";

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

const algorithmManifest = (id: string): AlgorithmManifest => {
  return { ...manifest(id), type: "menstruation" };
};

const setup = () => {
  const config = {
    algorithms: [{ manifest: algorithmManifest("a") }],
    apps: [{ manifest: manifest("w") }],
  } as unknown as ConfigV2;
  const core = {
    getActiveAlgorithm: vi.fn(() => {
      return "a";
    }),
    setActiveAlgorithm: vi.fn(() => {
      return Promise.resolve({ ok: true as const });
    }),
  };
  const cycles = {
    update: vi.fn(() => {
      return Promise.resolve({ ok: true as const });
    }),
  };
  const api = createHostApi({
    store: {
      get: () => {
        return config;
      },
    },
    core,
    cycles,
  });
  return { api, core, cycles };
};

describe("host api", () => {
  it("lists the manifests of algorithms and apps", () => {
    const { api } = setup();

    expect(api.listAlgorithms().map((m) => m.id)).toEqual(["a"]);
    expect(api.listApps().map((m) => m.id)).toEqual(["w"]);
  });

  it("passes the active algorithm calls to the core service", async () => {
    const { api, core } = setup();

    const active = api.getActiveAlgorithm("menstruation");
    await api.setActiveAlgorithm("menstruation", "a");

    expect(active).toBe("a");
    expect(core.setActiveAlgorithm).toHaveBeenCalledWith("menstruation", "a");
  });

  it("passes the cycles change to the cycles service", async () => {
    const { api, cycles } = setup();
    const change = (list: CycleInput[]) => {
      return list;
    };

    await api.updateCycles(change);

    expect(cycles.update).toHaveBeenCalledWith(change);
  });
});
