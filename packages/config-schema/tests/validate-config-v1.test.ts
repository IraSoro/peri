import { describe, expect, it } from "vitest";
import { validateConfigV1 } from "../src/validate-config-v1";
import { read } from "./helpers";

const fixture = () => {
  return read("fixtures/config-v1.json");
};

describe("validateConfigV1", () => {
  it("accepts the fixture", () => {
    expect(validateConfigV1(fixture()).ok).toBe(true);
  });

  it("reports missing required fields with the full path", () => {
    const { cycles: _cycles, ...rest } = fixture();
    expect(validateConfigV1(rest)).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: "required", path: "/cycles" })],
    });
  });

  it("reports wrong types and out-of-range values", () => {
    const config = fixture();
    config.cycles[0].periodLength = 0;
    config.cycles[1].cycleLength = "31";
    const result = validateConfigV1(config);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "out_of_range",
          path: "/cycles/0/periodLength",
        }),
      );
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "type",
          path: "/cycles/1/cycleLength",
        }),
      );
    }
  });

  it("rejects non-objects", () => {
    for (const bad of [null, undefined, 1, "x", []]) {
      expect(validateConfigV1(bad).ok).toBe(false);
    }
  });
});
