import { describe, expect, it } from "vitest";
import type { Grants } from "./permissions";
import { grantByPermissions } from "./permissions";

describe("grantByPermissions", () => {
  interface Parts {
    cycles: number[];
    predictions: number[];
  }
  const grants: Grants<Parts> = {
    "cycles:read": { cycles: [1] },
    "predictions:read": { predictions: [2] },
  };

  it("returns only the parts of the given permissions", () => {
    expect(grantByPermissions(["cycles:read"], grants)).toEqual({
      cycles: [1],
    });
  });

  it("merges the parts of several permissions", () => {
    expect(
      grantByPermissions(["cycles:read", "predictions:read"], grants),
    ).toEqual({ cycles: [1], predictions: [2] });
  });

  it("returns nothing without permissions", () => {
    expect(grantByPermissions([], grants)).toEqual({});
  });

  it("ignores permissions that unlock nothing", () => {
    expect(grantByPermissions(["unknown:read"], grants)).toEqual({});
  });
});
