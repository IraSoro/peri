import { PagerViewport } from "./PagerProvider";
import { Header } from "./Header";
import { Content } from "./Content";
import { Footer } from "./Footer";
import { LazyMount } from "@/components/ui/LazyMount";
import { useActivePageId } from "@/lib/host/hooks";

export type Page = {
  id: string;
  content: React.ReactNode;
};

type AppLayoutProps = {
  pages: Page[];
};

export const AppLayout = ({ pages }: AppLayoutProps) => {
  const activePageId = useActivePageId();
  const activeIndex = pages.findIndex((page) => page.id === activePageId);

  return (
    <div className="flex h-dvh w-screen justify-center">
      <div className="relative flex h-full w-full flex-col lg:max-w-150">
        <Header />
        <Content>
          <PagerViewport className="h-full w-full touch-pan-y overflow-hidden">
            <div className="flex h-full w-full flex-col">
              {pages.map((page, index) => {
                const distance = Math.abs(index - activeIndex);
                return (
                  <div
                    key={page.id}
                    className="size-full shrink-0 scrollbar-none overflow-y-auto [content-visibility:auto]"
                  >
                    {distance <= 1 ? (
                      <LazyMount isActive={distance === 0}>
                        {page.content}
                      </LazyMount>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </PagerViewport>
        </Content>
        <Footer />
      </div>
    </div>
  );
};
