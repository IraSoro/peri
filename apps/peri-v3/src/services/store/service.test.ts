import { describe, expect, it, vi } from "vitest";
import type { ConfigV2 } from "@repo/config-schema/config-v2.schema";
import { Service } from "./service";
import { createDefaultConfig } from "./defaults";
import type { StoreBackend, StoreOperationResult } from "./types";

function createBackend(initial: unknown = null) {
  let stored: unknown = initial;
  const read = vi.fn((): Promise<unknown> => {
    return Promise.resolve(structuredClone(stored));
  });
  const write = vi.fn((data: unknown): Promise<void> => {
    stored = structuredClone(data);
    return Promise.resolve();
  });
  const backend: StoreBackend = { read, write };
  return {
    backend,
    read,
    write,
    stored: () => stored,
  };
}

async function createLoaded(initial: unknown = null) {
  const fake = createBackend(initial);
  const service = new Service(fake.backend);
  const res: StoreOperationResult = await service.load();
  expect(res).toEqual({ ok: true });
  return { backend: fake, service };
}

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

describe("store service", () => {
  describe("load", () => {
    it("creates and persists the default config for empty storage", async () => {
      const { backend, service } = await createLoaded(null);

      expect(service.get()).toEqual(createDefaultConfig());
      expect(backend.write).toHaveBeenCalledTimes(1);
      expect(backend.stored()).toEqual(createDefaultConfig());
    });

    it("loads an existing v2 config as is", async () => {
      const stored: ConfigV2 = {
        ...createDefaultConfig(),
        revision: 7,
        cycles: [closedCycle, openCycle],
      };
      const { service } = await createLoaded(stored);

      expect(service.get()).toEqual(stored);
    });

    it("migrates a v1 config and persists the result", async () => {
      const { backend, service } = await createLoaded({
        version: 1,
        cycles: [
          {
            cycleLength: 0,
            periodLength: 5,
            startDate: new Date("2025-05-28T00:00:00.000Z").toString(),
          },
        ],
        language: "en",
        theme: "dark",
        isNotificationEnabled: false,
        lastNotificationId: 0,
        maxNumberOfDisplayedCycles: 6,
      });

      expect(service.get().version).toBe(2);
      expect(service.get().cycles).toHaveLength(1);
      expect((backend.stored() as ConfigV2).version).toBe(2);
    });

    it("fails with invalid_migration and keeps the current state", async () => {
      const backend = createBackend([]);
      const service = new Service(backend.backend);
      const before = service.get();

      const res = await service.load();

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_migration" },
      });
      expect(service.get()).toEqual(before);
      expect(backend.write).not.toHaveBeenCalled();
    });

    it("fails with invalid_config for data that breaks the schema", async () => {
      const backend = createBackend({ ...createDefaultConfig(), cycles: 1 });
      const service = new Service(backend.backend);

      const res = await service.load();

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_config" },
      });
      expect(backend.write).not.toHaveBeenCalled();
    });

    it("fails with invalid_config for a broken domain rule", async () => {
      const backend = createBackend({
        ...createDefaultConfig(),
        cycles: [{ ...closedCycle, end_date: null }, openCycle],
      });
      const service = new Service(backend.backend);

      const res = await service.load();

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_config" },
      });
      expect(res.ok === false && res.error.message).toContain("end_date");
    });

    it("notifies listeners after a successful load", async () => {
      const service = new Service(createBackend().backend);
      const listener = vi.fn();
      service.subscribe(listener);

      await service.load();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("does not notify listeners after a failed load", async () => {
      const service = new Service(createBackend([]).backend);
      const listener = vi.fn();
      service.subscribe(listener);

      await service.load();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("returns a copy, mutating it does not change the store", async () => {
      const { service } = await createLoaded();

      const config = service.get();
      config.cycles.push(openCycle);
      config.revision = 100;

      expect(service.get().cycles).toEqual([]);
      expect(service.get().revision).toBe(0);
    });
  });

  describe("update", () => {
    it("applies the change, bumps the revision and persists", async () => {
      const { backend, service } = await createLoaded();

      const res = await service.update((config) => ({
        ...config,
        cycles: [openCycle],
      }));

      expect(res).toEqual({ ok: true });
      expect(service.get().cycles).toEqual([openCycle]);
      expect(service.get().revision).toBe(1);
      expect((backend.stored() as ConfigV2).revision).toBe(1);
      expect((backend.stored() as ConfigV2).cycles).toEqual([openCycle]);
    });

    it("overrides a revision set by the change", async () => {
      const { service } = await createLoaded();

      await service.update((config) => ({ ...config, revision: 999 }));

      expect(service.get().revision).toBe(1);
    });

    it("notifies listeners once per successful update", async () => {
      const { service } = await createLoaded();
      const listener = vi.fn();
      service.subscribe(listener);

      await service.update((config) => config);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("rejects an invalid result and leaves everything untouched", async () => {
      const { backend, service } = await createLoaded();
      const listener = vi.fn();
      service.subscribe(listener);
      const writes = backend.write.mock.calls.length;

      const res = await service.update((config) => ({
        ...config,
        cycles: [{ ...openCycle, period_length: 0 }],
      }));

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_config" },
      });
      expect(service.get().cycles).toEqual([]);
      expect(service.get().revision).toBe(0);
      expect(backend.write).toHaveBeenCalledTimes(writes);
      expect(listener).not.toHaveBeenCalled();
    });

    it("rejects a result that breaks a domain rule", async () => {
      const { service } = await createLoaded();

      const res = await service.update((config) => ({
        ...config,
        cycles: [
          { ...openCycle, start_date: "2025-01-01T00:00:00.000Z" },
          openCycle,
        ],
      }));

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_config" },
      });
    });

    it("hands the change a copy, so mutating it cannot corrupt the store", async () => {
      const { service } = await createLoaded();

      await service.update((config) => {
        config.cycles.push({ ...openCycle, period_length: 0 });
        return config;
      });

      expect(service.get().cycles).toEqual([]);
    });

    it("runs concurrent updates one after another on the latest config", async () => {
      const { service } = await createLoaded();
      const seen: number[] = [];

      const results = await Promise.all([
        service.update((config) => {
          seen.push(config.cycles.length);
          return { ...config, cycles: [closedCycle] };
        }),
        service.update((config) => {
          seen.push(config.cycles.length);
          return { ...config, cycles: [...config.cycles, openCycle] };
        }),
      ]);

      expect(results).toEqual([{ ok: true }, { ok: true }]);
      expect(seen).toEqual([0, 1]);
      expect(service.get().cycles).toEqual([closedCycle, openCycle]);
      expect(service.get().revision).toBe(2);
    });

    it("keeps working after a failed update", async () => {
      const { service } = await createLoaded();

      const bad = await service.update((config) => ({
        ...config,
        cycles: [{ ...openCycle, period_length: 0 }],
      }));
      const good = await service.update((config) => ({
        ...config,
        cycles: [openCycle],
      }));

      expect(bad.ok).toBe(false);
      expect(good).toEqual({ ok: true });
      expect(service.get().revision).toBe(1);
    });

    it("rejects when the change throws and keeps the queue alive", async () => {
      const { service } = await createLoaded();

      await expect(
        service.update(() => {
          throw new Error("boom");
        }),
      ).rejects.toThrow("boom");

      const res = await service.update((config) => config);
      expect(res).toEqual({ ok: true });
      expect(service.get().revision).toBe(1);
    });

    it("rejects when the backend write fails and keeps the old state", async () => {
      const { backend, service } = await createLoaded();
      backend.write.mockRejectedValueOnce(new Error("disk full"));

      await expect(
        service.update((config) => ({ ...config, cycles: [openCycle] })),
      ).rejects.toThrow("disk full");

      expect(service.get().cycles).toEqual([]);
      expect(service.get().revision).toBe(0);

      const res = await service.update((config) => config);
      expect(res).toEqual({ ok: true });
    });
  });

  describe("subscribe", () => {
    it("stops notifying after unsubscribe", async () => {
      const { service } = await createLoaded();
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);

      unsubscribe();
      await service.update((config) => config);

      expect(listener).not.toHaveBeenCalled();
    });

    it("keeps notifying others when a listener throws", async () => {
      const { service } = await createLoaded();
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const second = vi.fn();
      service.subscribe(() => {
        throw new Error("bad listener");
      });
      service.subscribe(second);

      const res = await service.update((config) => config);

      expect(res).toEqual({ ok: true });
      expect(second).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalled();
      error.mockRestore();
    });

    it("lets a listener read the new state", async () => {
      const { service } = await createLoaded();
      let revision = -1;
      service.subscribe(() => {
        revision = service.get().revision;
      });

      await service.update((config) => config);

      expect(revision).toBe(1);
    });
  });
});
