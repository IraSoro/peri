import { render } from "@testing-library/react";
import TabHome from "../pages/TabHome";

test("renders without crashing", () => {
  const { baseElement } = render(<TabHome />);
  expect(baseElement).toBeDefined();
});
