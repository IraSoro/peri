import { it, expect } from "vitest";
import { render } from "@testing-library/react";
import Welcome from "../modals/WelcomeModal";

it("renders without crashing", () => {
  const { baseElement } = render(
    <Welcome
      isOpen
      setIsOpen={() => {}}
    />,
  );
  expect(baseElement).toBeDefined();
});
