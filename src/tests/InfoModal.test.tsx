import { render } from "@testing-library/react";
import InfoModal from "../modals/InfoModal";

test("renders without crashing", () => {
  const { baseElement } = render(
    <InfoModal
      isOpen
      setIsOpen={() => {}}
    />
  );
  expect(baseElement).toBeDefined();
});
