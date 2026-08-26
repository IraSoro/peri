type ContentProps = Pick<React.ComponentProps<"div">, "children">;

export const Content = ({ children }: ContentProps) => {
  return (
    <div className="flex size-full flex-col items-center justify-start overflow-hidden">
      {children}
    </div>
  );
};
