import { describe, expect, it } from "vitest";
import { compileSchema, read } from "./helpers";

const cycle = {
  cycleLength: 0,
  periodLength: 5,
  startDate:
    "Wed Jan 08 2025 00:00:00 GMT+0100 (Central European Standard Time)",
};

const config = {
  version: 1,
  cycles: [cycle],
  language: "en",
  theme: "dark",
  isNotificationEnabled: false,
  lastNotificationId: 0,
  maxNumberOfDisplayedCycles: 6,
};

describe("config v1", () => {
  const validate = compileSchema("config-v1");

  it("accepts a real config", () => {
    const real = read("fixtures/config-v1.json");
    expect(validate(real), JSON.stringify(validate.errors)).toBe(true);
  });

  it("accepts a minimal config", () => {
    expect(validate(config)).toBe(true);
  });

  it("rejects a malformed startDate", () => {
    const cycles = [{ ...cycle, startDate: "2025-01-08" }];
    expect(validate({ ...config, cycles })).toBe(false);
  });

  it("rejects a cycle without periodLength", () => {
    const cycles = [{ cycleLength: 0, startDate: cycle.startDate }];
    expect(validate({ ...config, cycles })).toBe(false);
  });

  it("rejects an unknown theme", () => {
    expect(validate({ ...config, theme: "neon" })).toBe(false);
  });

  it("rejects another version", () => {
    expect(validate({ ...config, version: 2 })).toBe(false);
  });
});
