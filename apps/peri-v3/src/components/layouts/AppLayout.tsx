import { usePager } from "./PagerProvider";

export type Page = {
  id: string;
  content: React.ReactNode;
};

type AppLayoutProps = {
  pages: Page[];
};

export const AppLayout = ({ pages }: AppLayoutProps) => {
  const { emblaRef } = usePager();

  return (
    <div className="flex h-dvh w-screen justify-center">
      <div className="relative flex h-full w-full flex-col lg:max-w-150">
        <Header />
        <Content>
          <div
            ref={emblaRef}
            className="h-full w-full touch-pan-y overflow-hidden"
          >
            <div className="flex h-full w-full flex-col">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="size-full shrink-0 scrollbar-none overflow-y-auto"
                >
                  {page.content}
                </div>
              ))}
            </div>
          </div>
        </Content>
        <Footer />
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="absolute top-0 flex min-h-12 items-center justify-center md:min-h-14">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3">
        {/* <Menu className="stroke-base-primary h-5 md:h-6" /> */}
      </div>
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2 p-3" />
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
    </div>
  );
};

type ContentProps = Pick<React.ComponentProps<"div">, "children">;

const Content = ({ children }: ContentProps) => {
  return (
    <div className="flex size-full flex-col items-center justify-start overflow-hidden">
      {children}
    </div>
  );
};

const Footer = () => {
  const { canGoNext, canGoPrev } = usePager();

  return (
    <div className="absolute bottom-0 flex min-h-12 w-full items-center justify-center md:min-h-13">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2 p-3">
        <div className="text-base-primary flex items-center gap-x-2 text-base md:text-xl">
          <span className={canGoPrev ? "" : "opacity-50"}>
            {canGoPrev ? "Can swipe back" : "Can't swipe back"}
          </span>
          <span>·</span>
          <span className={canGoNext ? "" : "opacity-50"}>
            {canGoNext ? "Can swipe next" : "Can't swipe next"}
          </span>
        </div>
      </div>
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
    </div>
  );
};
