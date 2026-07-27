import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const widgetLayoutVariants = cva(
  "flex w-full shrink-0 scrollbar-none flex-col overflow-y-auto p-2",
  {
    variants: {
      gap: {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        "2xl": "gap-10",
      },
    },
    defaultVariants: {
      gap: "md",
    },
  },
);

type WidgetLayoutProps = VariantProps<typeof widgetLayoutVariants> &
  Pick<ComponentProps<"div">, "children">;

export const WidgetLayout = ({ gap, children }: WidgetLayoutProps) => {
  return <div className={cn(widgetLayoutVariants({ gap }))}>{children}</div>;
};
