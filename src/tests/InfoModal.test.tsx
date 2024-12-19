import { it, expect } from "vitest";
import { render } from "@testing-library/react";
import InfoModal from "../modals/InfoModal";

it("renders without crashing", () => {
  const { baseElement } = render(
    <InfoModal
      isOpen
      setIsOpen={() => {}}
    />,
  );
  expect(baseElement).toBeDefined();
});
