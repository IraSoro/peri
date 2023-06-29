import { render } from "@testing-library/react";
import TabDetails from "./TabDetails";

test("renders without crashing", () => {
  const { baseElement } = render(<TabDetails />);
  expect(baseElement).toBeDefined();
});
