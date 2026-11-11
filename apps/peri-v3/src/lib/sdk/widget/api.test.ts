import { describe, expect, it } from "vitest";
import { Service as StoreService } from "@/services/store/service";
import { Stub } from "@/services/store/backends/stub";
import { Service as AlgorithmsService } from "@/services/algorithms/service";
import { Service as AppsService } from "@/services/apps/service";
import { Service as CoreService } from "@/services/core/service";
import { createWidgetApi } from "./api";
import type { CommunityManifest } from "../types";

const widget = { component: () => null };

function community(id: string): CommunityManifest {
  return {
    manifest_version: 1,
    id,
    name: id,
    version: "1.0.0",
    permissions: ["cycles:read"],
  };
}

async function setup() {
  const store = new StoreService(new Stub());
  await store.load();
  const core = new CoreService(
    store,
    new AlgorithmsService(store),
    new AppsService(store),
  );
  return { store, api: createWidgetApi(core) };
}

describe("widget api", () => {
  describe("defineInternalWidget", () => {
    it("stores the manifest as internal without permissions", async () => {
      const { store, api } = await setup();

      const res = await api.defineInternalWidget(
        { manifest_version: 1, id: "i", name: "i", version: "1.0.0" },
        widget,
      );

      expect(res).toEqual({ ok: true });
      expect(store.get().apps[0]?.manifest).toMatchObject({
        source: "internal",
        permissions: [],
      });
    });
  });

  describe("defineWidget", () => {
    it("stores the manifest as community with an install date", async () => {
      const { store, api } = await setup();

      const res = await api.defineWidget(community("w"), widget);

      expect(res).toEqual({ ok: true });
      const stored = store.get().apps[0]?.manifest;
      expect(stored?.source).toBe("community");
      expect(stored?.permissions).toEqual(["cycles:read"]);
      expect(stored?.installed_at).toMatch(/^\d{4}-\d\d-\d\dT.*\.\d{3}Z$/);
    });

    it("ignores a source smuggled in through the manifest", async () => {
      const { store, api } = await setup();
      const sneaky = { ...community("w"), source: "internal" } as never;

      await api.defineWidget(sneaky, widget);

      expect(store.get().apps[0]?.manifest.source).toBe("community");
    });

    it("reports a duplicate id", async () => {
      const { api } = await setup();
      await api.defineWidget(community("w"), widget);

      const res = await api.defineWidget(community("w"), widget);

      expect(res).toMatchObject({
        ok: false,
        error: { code: "registration_failed" },
      });
    });
  });
});
