import { useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PermissionError } from "./errors";
import { WidgetBoundary, WidgetContext, wrapWidget } from "./wrap";

function Permissions() {
  const context = useContext(WidgetContext);
  return (
    <p>
      {context?.source}:{context?.permissions.join(",")}
    </p>
  );
}

describe("wrapWidget", () => {
  it("gives the widget its permissions", () => {
    const wrapped = wrapWidget(
      "w",
      { component: Permissions },
      { source: "community", permissions: ["cycles:read"] },
    );
    const Component = wrapped.component;

    expect(renderToStaticMarkup(<Component />)).toBe(
      "<p>community:cycles:read</p>",
    );
  });

  it("tells an internal widget apart", () => {
    const wrapped = wrapWidget(
      "w",
      { component: Permissions },
      { source: "internal", permissions: [] },
    );
    const Component = wrapped.component;

    expect(renderToStaticMarkup(<Component />)).toBe("<p>internal:</p>");
  });

  it("keeps the other fields of the entry", () => {
    const wrapped = wrapWidget(
      "w",
      { component: Permissions },
      { source: "internal", permissions: [] },
    );

    expect(typeof wrapped.component).toBe("function");
  });
});

describe("WidgetBoundary", () => {
  it("switches to the fallback state on an error", () => {
    const error = new Error("boom");

    expect(WidgetBoundary.getDerivedStateFromError(error)).toEqual({
      error,
      failed: true,
    });
  });
});

describe("WidgetBoundary fallback", () => {
  function fallback(error: unknown): string {
    const boundary = new WidgetBoundary({ widgetId: "w", children: null });
    boundary.state = { error, failed: true };
    return renderToStaticMarkup(boundary.render());
  }

  it("names the missing permission", () => {
    const html = fallback(new PermissionError("cycles:read"));

    expect(html).toContain("&quot;w&quot;");
    expect(html).toContain("&quot;cycles:read&quot;");
    expect(html).toContain("permission");
  });

  it("includes the message of any other error", () => {
    expect(fallback(new Error("boom"))).toContain("boom");
  });

  it("copes with a thrown value that is not an error", () => {
    expect(fallback("oops")).toContain("oops");
  });

  it("renders the children while nothing has failed", () => {
    const boundary = new WidgetBoundary({
      widgetId: "w",
      children: <p>fine</p>,
    });

    expect(renderToStaticMarkup(boundary.render())).toBe("<p>fine</p>");
  });
});
