import { render } from "@testing-library/react";
import CalendarModal from "./CalendarModal";

test("renders without crashing", () => {
  const { baseElement } = render(
    <CalendarModal
      isOpen
      setIsOpen={() => {}}
    />
  );
  expect(baseElement).toBeDefined();
});
