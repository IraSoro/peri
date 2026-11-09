import { describe, expect, it, vi } from "vitest";
import type { ManifestBase } from "@repo/config-schema/config-v2.schema";
import { Service as StoreService } from "@/services/store/service";
import { Stub } from "@/services/store/backends/stub";
import { Service as AlgorithmsService } from "@/services/algorithms/service";
import type { AlgorithmEntry } from "@/services/algorithms/types";
import { Service as CyclesService } from "@/services/cycles/service";
import { Service } from "./service";

const JAN_1 = "2025-01-01T00:00:00.000Z";
const JAN_29 = "2025-01-29T00:00:00.000Z";

function manifest(id: string): ManifestBase {
  return {
    manifest_version: 1,
    id,
    name: id,
    version: "1.0.0",
    source: "internal",
    permissions: [],
  };
}

function counting(): AlgorithmEntry & { calls: number } {
  const entry = {
    calls: 0,
    run() {
      entry.calls += 1;
      return { menstruation: [{ date: JAN_29 }] };
    },
  };
  return entry;
}

async function setup() {
  const store = new StoreService(new Stub());
  await store.load();
  const algorithms = new AlgorithmsService(store);
  const cycles = new CyclesService(store);
  const service = new Service(store, algorithms);
  return { store, algorithms, cycles, service };
}

describe("core service", () => {
  describe("setActiveAlgorithm", () => {
    it("rejects an algorithm that is not registered", async () => {
      const { service } = await setup();

      const res = await service.setActiveAlgorithm("menstruation", "nope");

      expect(res).toMatchObject({
        ok: false,
        error: { code: "unknown_algorithm" },
      });
      expect(service.getActiveAlgorithm("menstruation")).toBeUndefined();
    });

    it("stores the choice in core.data and runs the algorithm", async () => {
      const { store, algorithms, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a"), entry);

      const res = await service.setActiveAlgorithm("menstruation", "a");

      expect(res).toEqual({ ok: true });
      expect(service.getActiveAlgorithm("menstruation")).toBe("a");
      expect(entry.calls).toBe(1);
      expect(store.get().predictions.menstruation?.algorithm_id).toBe("a");
    });

    it("keeps other keys of core.data", async () => {
      const { store, algorithms, service } = await setup();
      await store.update((config) => {
        return { ...config, core: { ...config.core, data: { theme: "dark" } } };
      });
      await algorithms.register(manifest("a"), counting());

      await service.setActiveAlgorithm("menstruation", "a");

      expect(store.get().core.data).toMatchObject({ theme: "dark" });
    });
  });

  describe("recompute", () => {
    it("reports a failing algorithm but still runs the others", async () => {
      const { algorithms, service } = await setup();
      const good = counting();
      await algorithms.register(manifest("bad"), {
        run() {
          throw new Error("boom");
        },
      });
      await algorithms.register(manifest("good"), good);
      await service.setActiveAlgorithm("menstruation", "bad");
      await service.setActiveAlgorithm("ovulation", "good");
      good.calls = 0;

      const res = await service.recompute();

      expect(res).toMatchObject({
        ok: false,
        error: { code: "algorithm_failed" },
      });
      expect(good.calls).toBe(1);
    });

    it("runs an algorithm once even when it serves several types", async () => {
      const { algorithms, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a"), entry);
      await service.setActiveAlgorithm("menstruation", "a");
      await service.setActiveAlgorithm("ovulation", "a");
      entry.calls = 0;

      await service.recompute();

      expect(entry.calls).toBe(1);
    });

    it("never overlaps two runs", async () => {
      const { algorithms, service } = await setup();
      let active = 0;
      let peak = 0;
      await algorithms.register(manifest("a"), {
        async run() {
          active += 1;
          peak = Math.max(peak, active);
          await Promise.resolve();
          active -= 1;
          return {};
        },
      });
      await service.setActiveAlgorithm("menstruation", "a");

      await Promise.all([
        service.recompute(),
        service.recompute(),
        service.recompute(),
      ]);

      expect(peak).toBe(1);
    });
  });

  describe("start", () => {
    it("runs the active algorithms right away", async () => {
      const { algorithms, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a"), entry);
      await service.setActiveAlgorithm("menstruation", "a");
      entry.calls = 0;

      await service.start();

      expect(entry.calls).toBe(1);
      service.stop();
    });

    it("runs again when the cycles change", async () => {
      const { algorithms, cycles, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a"), entry);
      await service.setActiveAlgorithm("menstruation", "a");
      await service.start();
      entry.calls = 0;

      await cycles.update(() => {
        return [{ start_date: JAN_1, period_length: 5 }];
      });

      await vi.waitFor(() => {
        expect(entry.calls).toBe(1);
      });
      service.stop();
    });

    it("does not loop on its own prediction writes", async () => {
      const { algorithms, cycles, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a"), entry);
      await service.setActiveAlgorithm("menstruation", "a");
      await service.start();
      await cycles.update(() => {
        return [{ start_date: JAN_1, period_length: 5 }];
      });
      await vi.waitFor(() => {
        expect(entry.calls).toBeGreaterThan(1);
      });

      await service.recompute();
      const settled = entry.calls;
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });

      expect(entry.calls).toBe(settled);
      service.stop();
    });

    it("ignores changes that do not touch cycles", async () => {
      const { store, algorithms, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a"), entry);
      await service.setActiveAlgorithm("menstruation", "a");
      await service.start();
      entry.calls = 0;

      await store.update((config) => {
        return { ...config };
      });
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });

      expect(entry.calls).toBe(0);
      service.stop();
    });

    it("stops reacting after stop", async () => {
      const { algorithms, cycles, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a"), entry);
      await service.setActiveAlgorithm("menstruation", "a");
      await service.start();
      service.stop();
      entry.calls = 0;

      await cycles.update(() => {
        return [{ start_date: JAN_1, period_length: 5 }];
      });
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });

      expect(entry.calls).toBe(0);
    });
  });
});
