import { it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TabDetails } from "../pages/TabDetails/TabDetails";

it("renders without crashing", () => {
  const { baseElement } = render(<TabDetails />);
  expect(baseElement).toBeDefined();
});
