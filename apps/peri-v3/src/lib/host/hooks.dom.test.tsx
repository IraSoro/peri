// @vitest-environment jsdom
import { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FooterProvider, useFooterContext } from "@/components/layouts/Footer";
import { HeaderProvider, useHeaderContext } from "@/components/layouts/Header";
import {
  PagerProvider,
  PagerViewport,
} from "@/components/layouts/PagerProvider";
import { DuplicatePagerViewportError } from "@/components/layouts/errors";
import {
  useBlockNextPage,
  useBlockPrevPage,
  useCanGoNextPage,
  useCanGoPrevPage,
  useHideHeaderMenuButton,
  useShowFooterLoader,
} from "./hooks";

// jsdom has none of these, embla needs them to start
beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer);
  vi.stubGlobal("IntersectionObserver", Observer);
  vi.stubGlobal("matchMedia", () => {
    return { matches: false, addEventListener() {}, removeEventListener() {} };
  });
});

afterEach(() => {
  cleanup();
});

describe("useShowFooterLoader", () => {
  const Observer = () => {
    return <p data-testid="out">{String(useFooterContext().loaderMessage)}</p>;
  };
  const Loader = ({ show, message }: { show: boolean; message: string }) => {
    useShowFooterLoader(show, message);
    return null;
  };
  const tree = (loaders: React.ReactNode) => {
    return (
      <FooterProvider>
        <Observer />
        {loaders}
      </FooterProvider>
    );
  };

  it("shows the message while show is true", () => {
    const view = render(tree(<Loader show message="Saving" />));
    expect(view.getByTestId("out").textContent).toBe("Saving");

    view.rerender(tree(<Loader show={false} message="Saving" />));
    expect(view.getByTestId("out").textContent).toBe("null");
  });

  it("follows a changed message", () => {
    const view = render(tree(<Loader show message="Saving" />));

    view.rerender(tree(<Loader show message="Loading" />));

    expect(view.getByTestId("out").textContent).toBe("Loading");
  });

  it("hides the loader when the component unmounts", () => {
    const view = render(tree(<Loader show message="Saving" />));

    view.rerender(tree(null));

    expect(view.getByTestId("out").textContent).toBe("null");
  });

  it("shows the last loader and falls back to the previous one", () => {
    const view = render(
      tree(
        <>
          <Loader show message="first" />
          <Loader show message="second" />
        </>,
      ),
    );
    expect(view.getByTestId("out").textContent).toBe("second");

    view.rerender(tree(<Loader show message="first" />));
    expect(view.getByTestId("out").textContent).toBe("first");
  });
});

describe("useHideHeaderMenuButton", () => {
  const Observer = () => {
    return <p data-testid="out">{String(useHeaderContext().showMenuButton)}</p>;
  };
  const Hider = ({ hidden }: { hidden: boolean }) => {
    useHideHeaderMenuButton(hidden);
    return null;
  };
  const tree = (hiders: React.ReactNode) => {
    return (
      <HeaderProvider>
        <Observer />
        {hiders}
      </HeaderProvider>
    );
  };

  it("hides the button while hidden is true", () => {
    const view = render(tree(<Hider hidden />));
    expect(view.getByTestId("out").textContent).toBe("false");

    view.rerender(tree(<Hider hidden={false} />));
    expect(view.getByTestId("out").textContent).toBe("true");
  });

  it("shows the button again when the component unmounts", () => {
    const view = render(tree(<Hider hidden />));

    view.rerender(tree(null));

    expect(view.getByTestId("out").textContent).toBe("true");
  });

  it("keeps the button hidden while another component hides it", () => {
    const view = render(
      tree(
        <>
          <Hider hidden />
          <Hider hidden={false} />
        </>,
      ),
    );

    expect(view.getByTestId("out").textContent).toBe("false");
  });
});

describe("pager hooks", () => {
  const Observer = () => {
    return (
      <p data-testid="out">{`${useCanGoNextPage()}-${useCanGoPrevPage()}`}</p>
    );
  };
  const Blocker = ({ next, prev }: { next?: boolean; prev?: boolean }) => {
    useBlockNextPage(next ?? false);
    useBlockPrevPage(prev ?? false);
    return null;
  };
  const tree = (blockers: React.ReactNode) => {
    return (
      <PagerProvider pageIds={["a", "b", "c"]} startPageId="b">
        <Observer />
        {blockers}
      </PagerProvider>
    );
  };

  it("can go both ways on the middle page", () => {
    const view = render(tree(null));

    expect(view.getByTestId("out").textContent).toBe("true-true");
  });

  it("blocks next and previous independently", () => {
    const view = render(tree(<Blocker next />));
    expect(view.getByTestId("out").textContent).toBe("false-true");

    view.rerender(tree(<Blocker prev />));
    expect(view.getByTestId("out").textContent).toBe("true-false");
  });

  it("releases the block when the component unmounts", () => {
    const view = render(tree(<Blocker next prev />));
    expect(view.getByTestId("out").textContent).toBe("false-false");

    view.rerender(tree(null));

    expect(view.getByTestId("out").textContent).toBe("true-true");
  });
});

describe("PagerViewport", () => {
  const provider = (children: React.ReactNode) => {
    return <PagerProvider pageIds={["a"]}>{children}</PagerProvider>;
  };

  it("throws when a second viewport mounts", () => {
    const quiet = console.error;
    console.error = () => {};
    try {
      expect(() => {
        render(
          provider(
            <>
              <PagerViewport>
                <div>one</div>
              </PagerViewport>
              <PagerViewport>
                <div>two</div>
              </PagerViewport>
            </>,
          ),
        );
      }).toThrow(DuplicatePagerViewportError);
    } finally {
      console.error = quiet;
    }
  });

  it("allows a new viewport after the first one unmounts", () => {
    const view = render(
      provider(
        <PagerViewport>
          <div>one</div>
        </PagerViewport>,
      ),
    );
    view.rerender(provider(null));

    view.rerender(
      provider(
        <PagerViewport>
          <div>two</div>
        </PagerViewport>,
      ),
    );

    expect(view.container.textContent).toBe("two");
  });

  it("allows one viewport under StrictMode", () => {
    const view = render(
      <StrictMode>
        {provider(
          <PagerViewport>
            <div>one</div>
          </PagerViewport>,
        )}
      </StrictMode>,
    );

    expect(view.container.textContent).toBe("one");
  });
});
