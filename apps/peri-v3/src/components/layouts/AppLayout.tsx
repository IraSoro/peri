import { usePager } from "./PagerProvider";
import { Header } from "./Header";
import { Content } from "./Content";
import { Footer } from "./Footer";

export type Page = {
  id: string;
  content: React.ReactNode;
};

type AppLayoutProps = {
  pages: Page[];
};

export const AppLayout = ({ pages }: AppLayoutProps) => {
  const { emblaRef, activePageId } = usePager();
  const activeIndex = pages.findIndex((page) => page.id === activePageId);

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
              {pages.map((page, index) => {
                const isMounted = Math.abs(index - activeIndex) <= 1;
                return (
                  <div
                    key={page.id}
                    className="size-full shrink-0 scrollbar-none overflow-y-auto"
                  >
                    {isMounted ? page.content : null}
                  </div>
                );
              })}
            </div>
          </div>
        </Content>
        <Footer />
      </div>
    </div>
  );
};
