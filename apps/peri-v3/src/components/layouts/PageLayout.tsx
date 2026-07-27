import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const pageLayoutContentVariants = cva("flex flex-col items-center", {
  variants: {
    justify: {
      start: "",
      center: "m-auto",
    },
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-10",
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
    <div className="flex size-full scrollbar-none flex-col overflow-y-auto p-6">
      <div className={pageLayoutContentVariants({ justify, gap })}>
        {children}
      </div>
    </div>
  );
};
