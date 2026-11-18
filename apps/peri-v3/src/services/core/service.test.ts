import { describe, expect, it, vi } from "vitest";
import type { AlgorithmManifest } from "@repo/config-schema/config-v2.schema";
import { Service as StoreService } from "@/services/store/service";
import { Stub } from "@/services/store/backends/stub";
import { initEmptyConfig } from "@/services/store/migrate";
import { Service as AlgorithmsService } from "@/services/algorithms/service";
import type { AlgorithmEntry } from "@/services/algorithms/types";
import { Service as AppsService } from "@/services/apps/service";
import { Service as CyclesService } from "@/services/cycles/service";
import { Service } from "./service";

const JAN_1 = "2025-01-01T00:00:00.000Z";
const JAN_29 = "2025-01-29T00:00:00.000Z";

function manifest(
  id: string,
  type: AlgorithmManifest["type"] = "menstruation",
): AlgorithmManifest {
  return {
    manifest_version: 1,
    id,
    name: id,
    version: "1.0.0",
    source: "internal",
    permissions: [],
    type,
  };
}

function counting(): AlgorithmEntry & { calls: number } {
  const entry = {
    calls: 0,
    run() {
      entry.calls += 1;
      return { days: [{ date: JAN_29 }] };
    },
  };
  return entry;
}

async function setup() {
  const store = new StoreService(new Stub(), [initEmptyConfig]);
  await store.load();
  const algorithms = new AlgorithmsService(store);
  const cycles = new CyclesService(store);
  const apps = new AppsService(store);
  const service = new Service(store, algorithms, apps);
  return { store, algorithms, apps, cycles, service };
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

    it("rejects an algorithm that predicts another type", async () => {
      const { store, algorithms, service } = await setup();
      const entry = counting();
      await algorithms.register(manifest("a", "ovulation"), entry);

      const res = await service.setActiveAlgorithm("menstruation", "a");

      expect(res).toMatchObject({
        ok: false,
        error: { code: "type_mismatch" },
      });
      expect(service.getActiveAlgorithm("menstruation")).toBeUndefined();
      expect(entry.calls).toBe(0);
      expect(store.get().predictions).toEqual({});
    });

    it("drops the choice when a new manifest changes the type", async () => {
      const { service } = await setup();
      await service.registerAlgorithm(manifest("a"), counting());
      await service.setActiveAlgorithm("menstruation", "a");

      await service.registerAlgorithm(manifest("a", "ovulation"), counting(), {
        replace: true,
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
      await algorithms.register(manifest("good", "ovulation"), good);
      await service.setActiveAlgorithm("menstruation", "bad");
      await service.setActiveAlgorithm("ovulation", "good");
      good.calls = 0;

      const res = await service.start();
      service.stop();

      expect(res).toMatchObject({
        ok: false,
        error: { code: "algorithm_failed" },
      });
      expect(good.calls).toBe(1);
    });

    it("runs an already active algorithm once its code is registered", async () => {
      const { store, algorithms, service } = await setup();
      await algorithms.register(manifest("a"), counting());
      await service.setActiveAlgorithm("menstruation", "a");
      const reloaded = new Service(
        store,
        new AlgorithmsService(store),
        new AppsService(store),
      );
      const entry = counting();

      const res = await reloaded.registerAlgorithm(manifest("a"), entry);

      expect(res).toEqual({ ok: true });
      expect(entry.calls).toBe(1);
    });

    it("skips an active algorithm whose code is not registered yet", async () => {
      const { store, algorithms, service } = await setup();
      await algorithms.register(manifest("a"), counting());
      await service.setActiveAlgorithm("menstruation", "a");
      const reloaded = new Service(
        store,
        new AlgorithmsService(store),
        new AppsService(store),
      );

      const res = await reloaded.start();
      reloaded.stop();

      expect(res).toEqual({ ok: true });
    });

    it("does not run an algorithm that is not active", async () => {
      const { service } = await setup();
      const entry = counting();

      await service.registerAlgorithm(manifest("a"), entry);

      expect(entry.calls).toBe(0);
    });

    it("reports a registration the algorithms service refuses", async () => {
      const { service } = await setup();
      await service.registerAlgorithm(manifest("a"), counting());

      const res = await service.registerAlgorithm(manifest("a"), counting());

      expect(res).toMatchObject({
        ok: false,
        error: { code: "registration_failed" },
      });
    });

    it("drops the choice when its algorithm is unregistered", async () => {
      const { service } = await setup();
      await service.registerAlgorithm(manifest("gone"), counting());
      await service.setActiveAlgorithm("menstruation", "gone");

      const res = await service.unregisterAlgorithm("gone");

      expect(res).toEqual({ ok: true });
      expect(service.getActiveAlgorithm("menstruation")).toBeUndefined();
    });

    it("removes the predictions of an unregistered algorithm", async () => {
      const { store, service } = await setup();
      await service.registerAlgorithm(manifest("gone"), counting());
      await service.setActiveAlgorithm("menstruation", "gone");

      await service.unregisterAlgorithm("gone");

      expect(store.get().predictions.menstruation).toBeUndefined();
    });

    it("keeps the other choices when one algorithm is unregistered", async () => {
      const { service } = await setup();
      const kept = counting();
      await service.registerAlgorithm(manifest("gone"), counting());
      await service.registerAlgorithm(manifest("kept", "ovulation"), kept);
      await service.setActiveAlgorithm("menstruation", "gone");
      await service.setActiveAlgorithm("ovulation", "kept");
      await service.unregisterAlgorithm("gone");
      kept.calls = 0;

      const res = await service.start();
      service.stop();

      expect(res).toEqual({ ok: true });
      expect(service.getActiveAlgorithm("ovulation")).toBe("kept");
      expect(kept.calls).toBe(1);
    });

    it("reports unregistering an unknown algorithm", async () => {
      const { service } = await setup();

      const res = await service.unregisterAlgorithm("nope");

      expect(res).toMatchObject({
        ok: false,
        error: { code: "registration_failed" },
      });
    });

    it("registers and unregisters apps", async () => {
      const { store, service } = await setup();
      const component = () => null;

      const added = await service.registerApp(manifest("w"), { component });
      const duplicate = await service.registerApp(manifest("w"), { component });
      const removed = await service.unregisterApp("w");
      const missing = await service.unregisterApp("w");

      expect(added).toEqual({ ok: true });
      expect(duplicate).toMatchObject({
        ok: false,
        error: { code: "registration_failed" },
      });
      expect(removed).toEqual({ ok: true });
      expect(missing).toMatchObject({
        ok: false,
        error: { code: "registration_failed" },
      });
      expect(store.get().apps).toHaveLength(0);
    });

    it("never overlaps two runs", async () => {
      const { algorithms, cycles, service } = await setup();
      let active = 0;
      let peak = 0;
      let runs = 0;
      await algorithms.register(manifest("a"), {
        async run() {
          active += 1;
          runs += 1;
          peak = Math.max(peak, active);
          await Promise.resolve();
          active -= 1;
          return { days: [] };
        },
      });
      await service.setActiveAlgorithm("menstruation", "a");
      await service.start();

      // Each change of the cycles asks for a run while the last one is going
      await Promise.all(
        [3, 4, 5].map((period) => {
          return cycles.update(() => {
            return [{ start_date: JAN_1, period_length: period }];
          });
        }),
      );
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      service.stop();

      expect(runs).toBeGreaterThan(1);
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

      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
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
