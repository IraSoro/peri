// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

afterEach(cleanup);

describe("Alert", () => {
  it("has no buttons without actions", () => {
    const view = render(<Alert type="info" title="T" message="M" />);

    expect(view.queryByRole("button")).toBeNull();
  });

  it("makes the last action the main one and calls them", () => {
    const cancel = vi.fn();
    const skip = vi.fn();
    const view = render(
      <Alert
        type="warning"
        title="T"
        message="M"
        actions={[
          { label: "Cancel", onClick: cancel },
          { label: "Skip", onClick: skip },
        ]}
      />,
    );

    expect(view.getByText("Skip").className).toContain("bg-[var(--c-bg)]");
    expect(view.getByText("Cancel").className).not.toContain(
      "border-transparent bg-[var(--c-bg)]",
    );
    fireEvent.click(view.getByText("Skip"));
    expect(skip).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();
  });
});
