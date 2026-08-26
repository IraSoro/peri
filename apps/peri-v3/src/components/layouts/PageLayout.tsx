import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const pageLayoutContentVariants = cva("flex w-full flex-col items-center", {
  variants: {
    justify: {
      start: "",
      center: "my-auto",
    },
    gap: {
      none: "gap-0",
      sm: "gap-1 md:gap-2",
      md: "gap-2 md:gap-4",
      lg: "gap-4 md:gap-6",
      xl: "gap-6 md:gap-8",
      "2xl": "gap-8 md:gap-10",
    },
  },
  defaultVariants: {
    justify: "start",
    gap: "md",
  },
});

type PageLayout = VariantProps<typeof pageLayoutContentVariants> &
  Pick<ComponentProps<"div">, "children">;

export const PageLayout = ({ justify, gap, children }: PageLayout) => {
  return (
    <div className="flex min-h-full w-full flex-col pt-10 pr-6 pb-11 pl-6 md:pt-14 md:pb-14">
      <div className={pageLayoutContentVariants({ justify, gap })}>
        {children}
      </div>
    </div>
  );
};
