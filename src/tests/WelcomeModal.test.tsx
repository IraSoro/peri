import { render } from "@testing-library/react";
import Welcome from "../modals/WelcomeModal";

test("renders without crashing", () => {
  const { baseElement } = render(
    <Welcome
      isOpen
      setIsOpen={() => {}}
    />,
  );
  expect(baseElement).toBeDefined();
});
