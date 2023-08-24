import { render } from "@testing-library/react";
import MarkModal from "../modals/MarkModal";

test("renders without crashing", () => {
  const { baseElement } = render(
    <MarkModal
      isOpen
      setIsOpen={() => {}}
    />,
  );
  expect(baseElement).toBeDefined();
});
