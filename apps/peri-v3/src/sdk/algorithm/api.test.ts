import { describe, expect, it } from "vitest";
import { Service as StoreService } from "@/services/store/service";
import { Stub } from "@/services/store/backends/stub";
import { Service as AlgorithmsService } from "@/services/algorithms/service";
import { Service as AppsService } from "@/services/apps/service";
import { Service as CyclesService } from "@/services/cycles/service";
import { Service as CoreService } from "@/services/core/service";
import { createAlgorithmApi } from "./api";
import type { CommunityManifest } from "../types";
import type { CommunityAlgorithmInput } from "./types";

const JAN_1 = "2025-01-01T00:00:00.000Z";

function community(id: string, permissions: string[] = []): CommunityManifest {
  return {
    manifest_version: 1,
    id,
    name: id,
    version: "1.0.0",
    permissions,
  };
}

async function setup() {
  const store = new StoreService(new Stub());
  await store.load();
  const algorithms = new AlgorithmsService(store);
  const core = new CoreService(store, algorithms, new AppsService(store));
  const cycles = new CyclesService(store);
  await cycles.update(() => {
    return [{ start_date: JAN_1, period_length: 5 }];
  });
  return { store, core, api: createAlgorithmApi(core) };
}

describe("algorithm api", () => {
  describe("defineAlgorithm", () => {
    it("stores the manifest as community with an install date", async () => {
      const { store, api } = await setup();

      const res = await api.defineAlgorithm(community("a"), {
        run() {
          return {};
        },
      });

      expect(res).toEqual({ ok: true });
      const stored = store.get().algorithms[0]?.manifest;
      expect(stored?.source).toBe("community");
      expect(stored?.installed_at).toMatch(/^\d{4}-\d\d-\d\dT.*\.\d{3}Z$/);
    });

    it("ignores a source smuggled in through the manifest", async () => {
      const { store, api } = await setup();
      const sneaky = { ...community("a"), source: "internal" } as never;

      await api.defineAlgorithm(sneaky, {
        run() {
          return {};
        },
      });

      expect(store.get().algorithms[0]?.manifest.source).toBe("community");
    });

    it("gives the cycles to an algorithm with cycles:read", async () => {
      const { core, api } = await setup();
      let seen: CommunityAlgorithmInput | undefined;
      await api.defineAlgorithm(community("a", ["cycles:read"]), {
        run(input) {
          seen = input;
          return {};
        },
      });

      await core.setActiveAlgorithm("menstruation", "a");

      expect(seen?.cycles).toHaveLength(1);
    });

    it("hides the cycles from an algorithm without the permission", async () => {
      const { core, api } = await setup();
      let seen: CommunityAlgorithmInput | undefined;
      await api.defineAlgorithm(community("a"), {
        run(input) {
          seen = input;
          return {};
        },
      });

      await core.setActiveAlgorithm("menstruation", "a");

      expect(seen).toEqual({});
    });

    it("reports a duplicate id", async () => {
      const { api } = await setup();
      const algorithm = {
        run() {
          return {};
        },
      };
      await api.defineAlgorithm(community("a"), algorithm);

      const res = await api.defineAlgorithm(community("a"), algorithm);

      expect(res).toMatchObject({
        ok: false,
        error: { code: "registration_failed" },
      });
    });
  });

  describe("defineInternalAlgorithm", () => {
    it("stores the manifest as internal without permissions", async () => {
      const { store, api } = await setup();

      const res = await api.defineInternalAlgorithm(
        { manifest_version: 1, id: "b", name: "b", version: "1.0.0" },
        {
          run() {
            return {};
          },
        },
      );

      expect(res).toEqual({ ok: true });
      expect(store.get().algorithms[0]?.manifest).toMatchObject({
        source: "internal",
        permissions: [],
      });
    });

    it("gives the whole input", async () => {
      const { core, api } = await setup();
      let cycles = 0;
      await api.defineInternalAlgorithm(
        { manifest_version: 1, id: "b", name: "b", version: "1.0.0" },
        {
          run(input) {
            cycles = input.cycles.length;
            return {};
          },
        },
      );

      await core.setActiveAlgorithm("menstruation", "b");

      expect(cycles).toBe(1);
    });
  });
});
