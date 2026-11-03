import { describe, expect, it } from "vitest";
import type { ConfigV2 } from "../dist/config-v2.schema";
import { validateConfigV2 } from "../src/validate-config-v2";
import { read } from "./helpers";

const fixture = () => {
  return read("fixtures/config-v2.json");
};

const validConfig = () => {
  return fixture() as ConfigV2;
};

const errorsOf = (data: unknown) => {
  const result = validateConfigV2(data);
  return result.ok ? [] : result.errors;
};

describe("validateConfigV2", () => {
  it("accepts the fixture and returns it typed", () => {
    const result = validateConfigV2(fixture());
    expect(result.ok).toBe(true);
  });

  it("accepts unknown fields", () => {
    expect(validateConfigV2({ ...fixture(), future_field: 1 }).ok).toBe(true);
  });

  it("reports missing required fields with the full path", () => {
    const { core: _core, ...rest } = fixture();
    const result = validateConfigV2(rest);
    expect(result).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: "required", path: "/core" })],
    });
  });

  it("reports wrong types", () => {
    const result = validateConfigV2({ ...fixture(), cycles: "nope" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: "type", path: "/cycles" }),
      );
    }
  });

  it("reports an unsupported version as invalid_value", () => {
    const result = validateConfigV2({ ...fixture(), version: 3 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: "invalid_value", path: "/version" }),
      );
    }
  });

  it("reports format errors", () => {
    const config = fixture();
    config.cycles[0].start_date = "yesterday";
    const result = validateConfigV2(config);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "invalid_format",
          path: "/cycles/0/start_date",
        }),
      );
    }
  });

  it("rejects non-objects", () => {
    for (const bad of [null, undefined, 1, "x", []]) {
      expect(validateConfigV2(bad).ok).toBe(false);
    }
  });

  it("does not run the rules on a config that fails the schema", () => {
    const config = validConfig() as unknown as Record<string, unknown>;
    delete config.apps;
    config.predictions = {
      ovulation: { algorithm_id: "com.missing", days: [] },
    };
    expect(errorsOf(config)).toEqual([
      expect.objectContaining({ code: "required", path: "/apps" }),
    ]);
  });

  describe("unique ids", () => {
    it("rejects duplicate ids in apps", () => {
      const config = validConfig();
      config.apps.push(structuredClone(config.apps[0]));
      expect(errorsOf(config)).toEqual([
        expect.objectContaining({
          code: "duplicate_id",
          path: `/apps/${config.apps.length - 1}/manifest/id`,
        }),
      ]);
    });

    it("rejects duplicate ids in algorithms", () => {
      const config = validConfig();
      config.algorithms.push(structuredClone(config.algorithms[0]));
      expect(errorsOf(config)).toEqual([
        expect.objectContaining({
          code: "duplicate_id",
          path: `/algorithms/${config.algorithms.length - 1}/manifest/id`,
        }),
      ]);
    });

    it("allows the same id in apps and algorithms", () => {
      const config = validConfig();
      config.apps[0].manifest.id = config.algorithms[0].manifest.id;
      expect(validateConfigV2(config).ok).toBe(true);
    });
  });

  describe("prediction algorithms", () => {
    it("rejects a prediction that refers to an unknown algorithm", () => {
      const config = validConfig();
      config.predictions.ovulation!.algorithm_id = "com.missing.algorithm";
      expect(errorsOf(config)).toEqual([
        expect.objectContaining({
          code: "unknown_algorithm",
          path: "/predictions/ovulation/algorithm_id",
        }),
      ]);
    });

    it("checks custom prediction types and escapes their keys in the path", () => {
      const config = validConfig();
      config.predictions["pms/mood"] = {
        algorithm_id: "com.missing.algorithm",
        days: [],
      };
      expect(errorsOf(config)).toEqual([
        expect.objectContaining({
          path: "/predictions/pms~1mood/algorithm_id",
        }),
      ]);
    });

    it("does not match an algorithm id from apps", () => {
      const config = validConfig();
      config.predictions.ovulation!.algorithm_id = config.apps[0].manifest.id;
      expect(errorsOf(config)).toHaveLength(1);
    });
  });

  it("reports every violation, not just the first", () => {
    const config = validConfig();
    config.apps.push(structuredClone(config.apps[0]));
    config.algorithms.push(structuredClone(config.algorithms[0]));
    config.predictions.ovulation!.algorithm_id = "com.missing.algorithm";
    expect(errorsOf(config)).toHaveLength(3);
  });
});
