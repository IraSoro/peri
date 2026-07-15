type AppLayout = Pick<React.ComponentProps<"div">, "children">;

export const AppLayout = ({ children }: AppLayout) => {
  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="relative flex h-full w-full flex-col lg:max-w-150">
        <Header />
        <Content>{children}</Content>
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
      <div className="size-full overflow-y-auto">{children}</div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="absolute bottom-0 flex min-h-12 w-full items-center justify-center md:min-h-13">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2 p-3">
        {/* <Loader message="Loading" /> */}
        {/* <div className="flex items-center justify-center">
          <ChevronsUp className="stroke-base-primary h-6 w-6" />
          <div className="text-base-primary text-base md:text-xl">
            Swipe to continue
          </div>
        </div> */}
      </div>
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 p-3" />
    </div>
  );
};
