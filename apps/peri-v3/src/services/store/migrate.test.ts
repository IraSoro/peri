import { describe, expect, it } from "vitest";
import type { ConfigV2 } from "@repo/config-schema/config-v2.schema";
import { validateConfigV2 } from "@repo/config-schema/validate-config-v2";
import { createDefaultConfig } from "./defaults";
import { initDefault, v1ToV2 } from "./migrate";

const v1 = (cycles: unknown[]) => ({
  version: 1,
  cycles,
  language: "en",
  theme: "dark",
  isNotificationEnabled: false,
  lastNotificationId: 0,
  maxNumberOfDisplayedCycles: 6,
});

// v1 stored dates as `Date.prototype.toString()` output
const v1Date = (iso: string) => new Date(iso).toString();

describe("initDefault", () => {
  it("replaces null with the default config", () => {
    expect(initDefault(null)).toEqual({
      ok: true,
      data: createDefaultConfig(),
    });
  });

  it("passes any other data through", () => {
    const data = { version: 1 };
    expect(initDefault(data)).toEqual({ ok: true, data });
  });
});

describe("v1ToV2", () => {
  it.each([[[]], ["str"], [1], [undefined]])(
    "rejects non-object data %j",
    (data) => {
      expect(v1ToV2(data)).toMatchObject({
        ok: false,
        error: { code: "invalid_migration" },
      });
    },
  );

  it("rejects null", () => {
    expect(v1ToV2(null)).toMatchObject({ ok: false });
  });

  it("passes non-v1 data through untouched", () => {
    const data = createDefaultConfig();
    expect(v1ToV2(data)).toEqual({ ok: true, data });
  });

  it("rejects a v1 config that fails v1 validation", () => {
    expect(v1ToV2(v1([{ nope: true }]))).toMatchObject({
      ok: false,
      error: { code: "invalid_migration" },
    });
  });

  it("rejects an unparsable start date", () => {
    const res = v1ToV2(
      v1([
        {
          cycleLength: 0,
          periodLength: 5,
          startDate: "Foo Bar 99 2025 00:00:00 GMT+0100 (X)",
        },
      ]),
    );
    expect(res).toMatchObject({
      ok: false,
      error: { code: "invalid_migration" },
    });
  });

  it("converts an empty v1 config to an empty v2 config", () => {
    expect(v1ToV2(v1([]))).toEqual({
      ok: true,
      data: createDefaultConfig(),
    });
  });

  it("maps the open cycle and a closed cycle, oldest first", () => {
    const res = v1ToV2(
      v1([
        {
          cycleLength: 0,
          periodLength: 5,
          startDate: v1Date("2025-06-28T00:00:00.000Z"),
        },
        {
          cycleLength: 31,
          periodLength: 4,
          startDate: v1Date("2025-05-28T00:00:00.000Z"),
        },
      ]),
    );

    expect(res.ok && (res.data as ConfigV2).cycles).toEqual([
      {
        start_date: "2025-05-28T00:00:00Z",
        end_date: "2025-06-27T00:00:00Z",
        period_length: 4,
        cycle_length: 31,
      },
      {
        start_date: "2025-06-28T00:00:00Z",
        end_date: null,
        period_length: 5,
        cycle_length: null,
      },
    ]);
  });

  it("uses the UTC calendar day of the parsed date", () => {
    const res = v1ToV2(
      v1([
        {
          cycleLength: 0,
          periodLength: 5,
          startDate:
            "Sat Jun 28 2025 00:00:00 GMT+0100 (Central European Standard Time)",
        },
      ]),
    );

    expect(res.ok && (res.data as ConfigV2).cycles[0]?.start_date).toBe(
      "2025-06-27T00:00:00Z",
    );
  });

  it("produces a config that passes v2 validation", () => {
    const res = v1ToV2(
      v1([
        {
          cycleLength: 0,
          periodLength: 5,
          startDate: v1Date("2025-06-28T00:00:00.000Z"),
        },
        {
          cycleLength: 31,
          periodLength: 5,
          startDate: v1Date("2025-05-28T00:00:00.000Z"),
        },
      ]),
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      const validated = validateConfigV2(res.data);
      expect(validated.ok, JSON.stringify(validated)).toBe(true);
    }
  });
});
