import { cn } from "@/lib/utils/cn";
import type { ComponentProps } from "react";

type WidgetLayout = Pick<ComponentProps<"div">, "className" | "children">;

export const WidgetLayout = ({ className, children }: WidgetLayout) => {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 scrollbar-none flex-col gap-4 overflow-y-auto p-2",
        className,
      )}
    >
      {children}
    </div>
  );
};
