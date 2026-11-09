import { describe, expect, it } from "vitest";
import { compileSchema, read } from "./helpers";

const manifest = {
  manifest_version: 1,
  id: "com.test.app",
  name: "Test",
  version: "1.0.0",
  source: "internal",
  permissions: [],
};

const communityManifest = {
  ...manifest,
  source: "community",
  installed_at: "2025-06-01T00:00:00.000Z",
};

const config = {
  version: 2,
  revision: 0,
  core: { id: "peri", version: "3.0.0", data: {} },
  cycles: [],
  predictions: {},
  algorithms: [],
  apps: [],
};

const currentCycle = {
  start_date: "2025-01-08T00:00:00.000Z",
  end_date: null,
  period_length: 5,
  cycle_length: null,
};

const withManifest = (m: object) => ({
  ...config,
  apps: [{ manifest: m, data: {} }],
});

describe("config v2", () => {
  const validate = compileSchema("config-v2");

  it("accepts the example config", () => {
    const example = read("fixtures/config-v2.json");
    expect(validate(example), JSON.stringify(validate.errors)).toBe(true);
  });

  it("accepts a minimal config", () => {
    expect(validate(config)).toBe(true);
  });

  it("accepts the current cycle with null fields", () => {
    expect(validate({ ...config, cycles: [currentCycle] })).toBe(true);
  });

  it("ignores unknown fields", () => {
    expect(
      validate({
        ...config,
        extra: 1,
        core: { ...config.core, extra: 1 },
        cycles: [{ ...currentCycle, extra: 1 }],
        predictions: {
          menstruation: { algorithm_id: "a", days: [], probability: 0.5 },
        },
        apps: [{ manifest: { ...manifest, extra: 1 }, data: {} }],
      }),
    ).toBe(true);
  });

  it("accepts a new prediction type", () => {
    const predictions = { fertile_window: { algorithm_id: "a", days: [] } };
    expect(validate({ ...config, predictions })).toBe(true);
  });

  it("rejects an invalid prediction of a new type", () => {
    const predictions = { fertile_window: { days: [] } };
    expect(validate({ ...config, predictions })).toBe(false);
  });

  it.each(Object.keys(config))("requires top-level `%s`", (key) => {
    const { [key as keyof typeof config]: _, ...rest } = config;
    expect(validate(rest)).toBe(false);
  });

  it("rejects another version", () => {
    expect(validate({ ...config, version: 1 })).toBe(false);
  });

  it("requires nullable cycle fields to be present", () => {
    const { cycle_length: _, ...cycle } = currentCycle;
    expect(validate({ ...config, cycles: [cycle] })).toBe(false);
  });

  it("rejects period_length of 0", () => {
    const cycle = { ...currentCycle, period_length: 0 };
    expect(validate({ ...config, cycles: [cycle] })).toBe(false);
  });

  it("rejects a null period_length", () => {
    const cycle = { ...currentCycle, period_length: null };
    expect(validate({ ...config, cycles: [cycle] })).toBe(false);
  });

  it("rejects a non-ISO date", () => {
    const cycle = { ...currentCycle, start_date: "Wed Jan 08 2025" };
    expect(validate({ ...config, cycles: [cycle] })).toBe(false);
  });

  it("rejects a non-semver core version", () => {
    const core = { ...config.core, version: "3.0" };
    expect(validate({ ...config, core })).toBe(false);
  });

  it("requires `data` on apps", () => {
    expect(validate({ ...config, apps: [{ manifest }] })).toBe(false);
  });

  describe("manifest", () => {
    it("accepts a minimal internal manifest", () => {
      expect(validate(withManifest(manifest))).toBe(true);
    });

    it("rejects an unknown source", () => {
      expect(validate(withManifest({ ...manifest, source: "other" }))).toBe(
        false,
      );
    });

    it.each([
      ["author", "Jane Roe"],
      ["repository_url", "https://example.com"],
      ["manifest_url", "https://example.com/manifest.json"],
      ["installed_at", "2025-06-01T00:00:00.000Z"],
      ["verified", true],
    ])("rejects community-only `%s` on internal source", (field, value) => {
      expect(validate(withManifest({ ...manifest, [field]: value }))).toBe(
        false,
      );
    });

    it("accepts community-only fields on community source", () => {
      const community = {
        ...communityManifest,
        author: "Jane Roe",
        verified: false,
      };
      expect(validate(withManifest(community))).toBe(true);
    });

    it("rejects permissions on an internal source", () => {
      const m = { ...manifest, permissions: ["cycles:read"] };
      expect(validate(withManifest(m))).toBe(false);
    });

    it("accepts permissions on a community source", () => {
      const m = { ...communityManifest, permissions: ["cycles:read"] };
      expect(validate(withManifest(m))).toBe(true);
    });

    it("requires `installed_at` on a community source", () => {
      const { installed_at: _, ...m } = communityManifest;
      expect(validate(withManifest(m))).toBe(false);
    });

    it.each(["cycles*", "cycles:", ":read", "Cycles:Read", "cycles-read"])(
      "rejects malformed scope `%s`",
      (scope) => {
        const m = { ...communityManifest, permissions: [scope] };
        expect(validate(withManifest(m))).toBe(false);
      },
    );
  });
});
