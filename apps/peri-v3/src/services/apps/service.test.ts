import { describe, expect, it } from "vitest";
import type { ManifestBase } from "@repo/config-schema/config-v2.schema";
import { Service as StoreService } from "@/services/store/service";
import { Stub } from "@/services/store/backends/stub";
import { Service } from "./service";
import type { AppEntry } from "./types";

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

function entry(): AppEntry {
  return { component: () => null };
}

async function setup() {
  const store = new StoreService(new Stub());
  await store.load();
  return { store, service: new Service(store) };
}

describe("apps service", () => {
  describe("register", () => {
    it("adds the manifest with empty data to the config", async () => {
      const { store, service } = await setup();

      const res = await service.register(internal("a"), entry());

      expect(res).toEqual({ ok: true });
      expect(store.get().apps).toEqual([{ manifest: internal("a"), data: {} }]);
    });

    it("rejects a second registration of the same id", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      const res = await service.register(internal("a"), entry());

      expect(res).toMatchObject({
        ok: false,
        error: { code: "already_registered" },
      });
      expect(store.get().apps).toHaveLength(1);
    });

    it("rejects an invalid manifest and does not register it", async () => {
      const { store, service } = await setup();
      const { installed_at: _, ...noInstalledAt } = community("a", "x");

      const res = await service.register(noInstalledAt, entry());

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_manifest" },
      });
      expect(store.get().apps).toEqual([]);
      expect(await service.register(internal("a"), entry())).toEqual({
        ok: true,
      });
    });

    it("replaces a stored manifest on restart, keeping its data", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());
      await store.update((config) => {
        return {
          ...config,
          apps: config.apps.map((a) => {
            return { ...a, data: { theme: "dark" } };
          }),
        };
      });

      const restarted = new Service(store);
      const next = { ...internal("a"), version: "1.1.0" };
      const res = await restarted.register(next, entry());

      expect(res).toEqual({ ok: true });
      expect(store.get().apps).toEqual([
        { manifest: next, data: { theme: "dark" } },
      ]);
    });

    it("keeps the stored installed_at of a community manifest", async () => {
      const { store, service } = await setup();
      await service.register(
        community("a", "2025-01-01T00:00:00.000Z"),
        entry(),
      );

      await new Service(store).register(
        community("a", "2025-09-09T00:00:00.000Z"),
        entry(),
      );

      expect(store.get().apps[0]?.manifest.installed_at).toBe(
        "2025-01-01T00:00:00.000Z",
      );
    });

    it("does not add installed_at to an internal manifest", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      await new Service(store).register(internal("a"), entry());

      expect(store.get().apps[0]?.manifest).not.toHaveProperty("installed_at");
    });
  });

  describe("unregister", () => {
    it("rejects an unknown id", async () => {
      const { service } = await setup();

      expect(await service.unregister("a")).toMatchObject({
        ok: false,
        error: { code: "unknown_app" },
      });
    });

    it("removes the app with its data, keeps the others", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());
      await service.register(internal("b"), entry());

      const res = await service.unregister("a");

      expect(res).toEqual({ ok: true });
      expect(store.get().apps.map((a) => a.manifest.id)).toEqual(["b"]);
    });

    it("works for an app stored before a restart", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());

      const res = await new Service(store).unregister("a");

      expect(res).toEqual({ ok: true });
      expect(store.get().apps).toEqual([]);
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

  describe("get", () => {
    it("returns undefined for an unknown app", async () => {
      const { service } = await setup();

      expect(service.get("a")).toBeUndefined();
    });

    it("returns the data of the app", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());
      await service.update("a", () => ({ theme: "dark" }));

      expect(service.get("a")).toEqual({ theme: "dark" });
    });

    it("returns a copy, mutating it does not change the store", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());
      await service.update("a", () => ({ list: [1] }));

      const data = service.get("a") as { list: number[] };
      data.list.push(2);

      expect(service.get("a")).toEqual({ list: [1] });
    });
  });

  describe("update", () => {
    it("rejects an unknown app without touching the store", async () => {
      const { store, service } = await setup();
      const before = store.get();

      const res = await service.update("a", () => ({ x: 1 }));

      expect(res).toMatchObject({
        ok: false,
        error: { code: "unknown_app" },
      });
      expect(store.get()).toEqual(before);
    });

    it("hands the change the current data and stores the result", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());
      await service.update("a", () => ({ count: 1 }));
      const revision = store.get().revision;

      const res = await service.update("a", (data) => {
        return { count: (data as { count: number }).count + 1 };
      });

      expect(res).toEqual({ ok: true });
      expect(service.get("a")).toEqual({ count: 2 });
      expect(store.get().revision).toBe(revision + 1);
    });

    it("changes only the data of the given app", async () => {
      const { store, service } = await setup();
      await service.register(internal("a"), entry());
      await service.register(internal("b"), entry());
      await service.update("b", () => ({ keep: true }));

      await service.update("a", () => ({ x: 1 }));

      expect(service.get("b")).toEqual({ keep: true });
      expect(store.get().apps.map((a) => a.manifest.id)).toEqual(["a", "b"]);
      expect(store.get().apps[0]?.manifest).toEqual(internal("a"));
    });

    it("returns invalid_data and keeps the old data for a non-object", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());
      await service.update("a", () => ({ keep: true }));

      const res = await service.update("a", () => {
        return [];
      });

      expect(res).toMatchObject({
        ok: false,
        error: { code: "invalid_data" },
      });
      expect(service.get("a")).toEqual({ keep: true });
    });

    it("hands the change a copy, so mutating it cannot corrupt the store", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());
      await service.update("a", () => ({ list: [1] }));

      await service.update("a", (data) => {
        (data as { list: number[] }).list.push(2);
        return [];
      });

      expect(service.get("a")).toEqual({ list: [1] });
    });

    it("runs concurrent updates one after another", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());
      await service.update("a", () => ({ count: 0 }));

      const increment = (data: Record<string, unknown>) => {
        return { count: (data as { count: number }).count + 1 };
      };
      await Promise.all([
        service.update("a", increment),
        service.update("a", increment),
        service.update("a", increment),
      ]);

      expect(service.get("a")).toEqual({ count: 3 });
    });

    it("rejects when the change throws and keeps working", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());

      await expect(
        service.update("a", () => {
          throw new Error("boom");
        }),
      ).rejects.toThrow("boom");

      expect(await service.update("a", () => ({ ok: 1 }))).toEqual({
        ok: true,
      });
    });

    it("reports an app removed before the change ran", async () => {
      const { service } = await setup();
      await service.register(internal("a"), entry());

      const [removed, updated] = await Promise.all([
        service.unregister("a"),
        service.update("a", () => ({ x: 1 })),
      ]);

      expect(removed).toEqual({ ok: true });
      expect(updated).toMatchObject({
        ok: false,
        error: { code: "unknown_app" },
      });
    });
  });
});
