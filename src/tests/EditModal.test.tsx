import { render } from "@testing-library/react";
import EditModal from "../modals/EditModal";

test("renders without crashing", () => {
  const { baseElement } = render(
    <EditModal
      isOpen
      setIsOpen={() => {}}
    />,
  );
  expect(baseElement).toBeDefined();
});
