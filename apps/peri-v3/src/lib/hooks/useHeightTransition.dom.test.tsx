// @vitest-environment jsdom
import { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useHeightTransition } from "./useHeightTransition";

const Box = () => {
  const { ref } = useHeightTransition(false);
  return <div ref={ref} data-testid="box" />;
};

afterEach(cleanup);

describe("useHeightTransition", () => {
  it("does not keep a fixed height when mounted twice by StrictMode", () => {
    const view = render(
      <StrictMode>
        <Box />
      </StrictMode>,
    );

    expect(view.getByTestId("box").style.height).toBe("auto");
  });
});
