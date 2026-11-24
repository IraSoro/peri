import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";
import { toLocalDate, toLocalMidnight, toPlainDate } from "./dates";

describe("toPlainDate", () => {
  it("is the UTC date by default and follows a time zone", () => {
    expect(toPlainDate("2025-01-01T22:00:00.000Z").toString()).toBe(
      "2025-01-01",
    );
    expect(
      toPlainDate("2025-01-01T22:00:00.000Z", "Asia/Dubai").toString(),
    ).toBe("2025-01-02");
  });
});

describe("toLocalMidnight", () => {
  it("is an ISO timestamp in UTC", () => {
    expect(toLocalMidnight(Temporal.PlainDate.from("2025-01-02"))).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  it("reads back as the same local day", () => {
    for (const iso of [
      "2025-01-02",
      "2025-03-30",
      "2025-10-26",
      "2025-12-31",
    ]) {
      const date = Temporal.PlainDate.from(iso);
      expect(toLocalDate(toLocalMidnight(date)).equals(date)).toBe(true);
    }
  });
});

describe("toLocalDate", () => {
  it("takes a JS Date as the same moment as its ISO string", () => {
    const date = new Date("2025-06-15T12:00:00.000Z");
    expect(toLocalDate(date).equals(toLocalDate(date.toISOString()))).toBe(
      true,
    );
  });
});
