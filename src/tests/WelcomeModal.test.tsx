import { it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WelcomeModal } from "../modals/WelcomeModal";

it("renders without crashing", () => {
  const { baseElement } = render(
    <WelcomeModal
      isOpen
      setIsOpen={() => {}}
    />,
  );
  expect(baseElement).toBeDefined();
});
