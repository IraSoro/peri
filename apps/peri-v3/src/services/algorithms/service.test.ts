import { describe, expect, it, vi } from "vitest";
import type { ManifestBase } from "@repo/config-schema/config-v2.schema";
import { Service as StoreService } from "@/services/store/service";
import { Stub } from "@/services/store/backends/stub";
import { Service } from "./service";
import type { AlgorithmInput, AlgorithmOutput } from "./types";

const closedCycle = {
  start_date: "2025-05-02T00:00:00.000Z",
  end_date: "2025-05-06T00:00:00.000Z",
  period_length: 5,
  cycle_length: 26,
};

const openCycle = {
  start_date: "2025-05-28T00:00:00.000Z",
  end_date: null,
  period_length: 5,
  cycle_length: null,
};

const day = (date: string) => ({ date });

function internal(id: string): ManifestBase {
  return {
    manifest_version: 1,
    id,
    name: id,
    version: "1.0.0",
    source: "internal",
    permissions: [],
  };
}

function community(id: string, installedAt: string): ManifestBase {
  return {
    ...internal(id),
    source: "community",
    installed_at: installedAt,
  };
}

function entry(output: AlgorithmOutput = {}) {
  return {
    run: vi.fn((_input: AlgorithmInput): AlgorithmOutput => {
      return output;
    }),
  };
}

async function setup() {
  const store = new StoreService(new Stub());
  await store.load();
  await store.update((config) => {
    return { ...config, cycles: [closedCycle, openCycle] };
  });
  return { store, service: new Service(store) };
}

describe("algorithms service", () => {
  describe("register", () => {
    it("adds the manifest to the config", async () => {
      const { store, service } = await setup();

      const res = await service.register(internal("a"), entry());

      expect(res).toEqual({ ok: true });
      expect(store.get().algorithms).toEqual([{ manifest: internal("a") }]);
    });

    it("rejects a second registration of the same id", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      const res = await service.register(internal("a"), entry());

      expect(res).toMatchObject({
        ok: false,
        error: { code: "already_registered" },
      });
      expect(store.get().algorithms).toHaveLength(1);
    });

    it("rejects a concurrent registration of the same id", async () => {
      const { store, service } = await setup();

      const results = await Promise.all([
        service.register(internal("a"), entry()),
        service.register(internal("a"), entry()),
      ]);

      expect(results.filter((res) => res.ok)).toHaveLength(1);
      expect(store.get().algorithms).toHaveLength(1);
    });

    it("rejects an invalid manifest and does not register it", async () => {
      const { store, service } = await setup();
      const { installed_at: _, ...noInstalledAt } = community("a", "x");

      const res = await service.register(noInstalledAt, entry());

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_manifest" },
      });
      expect(store.get().algorithms).toEqual([]);
      expect(await service.run("a")).toMatchObject({
        error: { code: "unknown_algorithm" },
      });
    });

    it("replaces a stored manifest on restart without duplicating it", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      const restarted = new Service(store);
      const next = { ...internal("a"), version: "1.1.0" };
      const res = await restarted.register(next, entry());

      expect(res).toEqual({ ok: true });
      expect(store.get().algorithms).toEqual([{ manifest: next }]);
    });

    it("keeps the stored installed_at of a community manifest", async () => {
      const { store, service } = await setup();
      await service.register(
        community("a", "2025-01-01T00:00:00.000Z"),
        entry(),
      );

      const restarted = new Service(store);
      await restarted.register(
        community("a", "2025-09-09T00:00:00.000Z"),
        entry(),
      );

      expect(store.get().algorithms[0]?.manifest.installed_at).toBe(
        "2025-01-01T00:00:00.000Z",
      );
    });

    it("does not add installed_at to an internal manifest", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      await new Service(store).register(internal("a"), entry());

      expect(store.get().algorithms[0]?.manifest).not.toHaveProperty(
        "installed_at",
      );
    });
  });

  describe("unregister", () => {
    it("rejects an unknown id", async () => {
      const { service } = await setup();

      expect(await service.unregister("a")).toMatchObject({
        ok: false,
        error: { code: "unknown_algorithm" },
      });
    });

    it("removes the manifest and the entry", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      const res = await service.unregister("a");

      expect(res).toEqual({ ok: true });
      expect(store.get().algorithms).toEqual([]);
      expect(await service.run("a")).toMatchObject({
        error: { code: "unknown_algorithm" },
      });
    });

    it("removes the predictions of the algorithm, keeps the others", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());
      await service.register(internal("b"), entry());
      await service.run("a");
      await store.update((config) => {
        return {
          ...config,
          predictions: {
            menstruation: { algorithm_id: "a", days: [] },
            ovulation: { algorithm_id: "b", days: [] },
          },
        };
      });

      const res = await service.unregister("a");

      expect(res).toEqual({ ok: true });
      expect(Object.keys(store.get().predictions)).toEqual(["ovulation"]);
    });

    it("works for a manifest stored before a restart", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      const restarted = new Service(store);
      const res = await restarted.unregister("a");

      expect(res).toEqual({ ok: true });
      expect(store.get().algorithms).toEqual([]);
    });

    it("allows registering the same id again", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());
      await service.unregister("a");

      expect(await service.register(internal("a"), entry())).toEqual({
        ok: true,
      });
    });
  });

  describe("run", () => {
    it("rejects an unknown id", async () => {
      const { service } = await setup();

      expect(await service.run("a")).toMatchObject({
        ok: false,
        error: { code: "unknown_algorithm" },
      });
    });

    it("passes the current cycles to the algorithm", async () => {
      const { service } = await setup();
      const algorithm = entry();
      await service.register(internal("a"), algorithm);

      await service.run("a");

      expect(algorithm.run).toHaveBeenCalledTimes(1);
      expect(algorithm.run).toHaveBeenCalledWith({
        cycles: [closedCycle, openCycle],
      });
    });

    it("stores the output with the algorithm id", async () => {
      const { store, service } = await setup();
      const days = [day("2025-06-28T00:00:00.000Z")];
      await service.register(
        internal("a"),
        entry({ menstruation: days, ovulation: [] }),
      );

      const res = await service.run("a");

      expect(res).toEqual({ ok: true });
      expect(store.get().predictions).toEqual({
        menstruation: { algorithm_id: "a", days },
        ovulation: { algorithm_id: "a", days: [] },
      });
    });

    it("supports an async algorithm", async () => {
      const { store, service } = await setup();
      const days = [day("2025-06-28T00:00:00.000Z")];
      await service.register(internal("a"), {
        run: () => Promise.resolve({ menstruation: days }),
      });

      expect(await service.run("a")).toEqual({ ok: true });
      expect(store.get().predictions.menstruation?.days).toEqual(days);
    });

    it("replaces earlier predictions of the algorithm", async () => {
      const { store, service } = await setup();
      let output: AlgorithmOutput = {
        menstruation: [day("2025-06-28T00:00:00.000Z")],
        ovulation: [day("2025-07-10T00:00:00.000Z")],
      };
      await service.register(internal("a"), { run: () => output });
      await service.run("a");

      output = { menstruation: [day("2025-07-26T00:00:00.000Z")] };
      await service.run("a");

      expect(store.get().predictions).toEqual({
        menstruation: {
          algorithm_id: "a",
          days: [day("2025-07-26T00:00:00.000Z")],
        },
      });
    });

    it("keeps the predictions of other algorithms", async () => {
      const { store, service } = await setup();
      await service.register(
        internal("a"),
        entry({ menstruation: [day("2025-06-28T00:00:00.000Z")] }),
      );
      await service.register(
        internal("b"),
        entry({ ovulation: [day("2025-07-10T00:00:00.000Z")] }),
      );

      await service.run("a");
      await service.run("b");

      expect(store.get().predictions.menstruation?.algorithm_id).toBe("a");
      expect(store.get().predictions.ovulation?.algorithm_id).toBe("b");
    });

    it("bumps the store revision once per run", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry({ menstruation: [] }));
      const before = store.get().revision;

      await service.run("a");

      expect(store.get().revision).toBe(before + 1);
    });

    it("returns run_failed when the algorithm throws", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), {
        run: () => {
          throw new Error("boom");
        },
      });
      const before = store.get();

      const res = await service.run("a");

      expect(res).toMatchObject({ ok: false, error: { code: "run_failed" } });
      expect(res.ok === false && res.error.message).toContain("boom");
      expect(store.get()).toEqual(before);
    });

    it("returns run_failed when the algorithm rejects", async () => {
      const { service } = await setup();
      await service.register(internal("a"), {
        run: () => Promise.reject(new Error("late boom")),
      });

      expect(await service.run("a")).toMatchObject({
        ok: false,
        error: { code: "run_failed" },
      });
    });

    it.each([
      ["null", null],
      ["an array", []],
      ["a string", "x"],
      ["a non-array value", { menstruation: 1 }],
      ["days without a date", { menstruation: [{}] }],
      ["a non-string date", { menstruation: [{ date: 1 }] }],
    ])("returns invalid_output for %s", async (_name, output) => {
      const { store, service } = await setup();
      await service.register(internal("a"), {
        run: () => output as unknown as AlgorithmOutput,
      });
      const before = store.get();

      const res = await service.run("a");

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_output" },
      });
      expect(store.get()).toEqual(before);
    });

    it("returns invalid_output when the store rejects the dates", async () => {
      const { store, service } = await setup();
      await service.register(
        internal("a"),
        entry({ menstruation: [day("x")] }),
      );
      const before = store.get();

      const res = await service.run("a");

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_output" },
      });
      expect(store.get()).toEqual(before);
    });

    it("keeps the old predictions when a new output is rejected", async () => {
      const { store, service } = await setup();
      let output: AlgorithmOutput = {
        menstruation: [day("2025-06-28T00:00:00.000Z")],
      };
      await service.register(internal("a"), { run: () => output });
      await service.run("a");

      output = { menstruation: [day("bad")] };
      await service.run("a");

      expect(store.get().predictions.menstruation?.days).toEqual([
        day("2025-06-28T00:00:00.000Z"),
      ]);
    });
  });
});
