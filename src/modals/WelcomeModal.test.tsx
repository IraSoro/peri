import { render } from "@testing-library/react";
import Welcome from "./WelcomeModal";

test("renders without crashing", () => {
  const { baseElement } = render(
    <Welcome
      isOpen
      setIsOpen={() => {}}
    />
  );
  expect(baseElement).toBeDefined();
});
