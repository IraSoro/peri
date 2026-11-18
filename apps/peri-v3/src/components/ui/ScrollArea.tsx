import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils/cn";

export type ScrollAreaProps = ScrollAreaPrimitive.Root.Props;

export const ScrollArea = ({
  className,
  children,
  ...props
}: ScrollAreaProps) => {
  return (
    <ScrollAreaPrimitive.Root
      {...props}
      className={cn("relative overflow-hidden", className)}
    >
      <ScrollAreaPrimitive.Viewport className="max-h-[inherit] overscroll-contain">
        <ScrollAreaPrimitive.Content>{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="absolute top-2 right-1 bottom-2 flex w-1.5 touch-none opacity-0 transition-opacity duration-150 select-none data-hovering:opacity-100 data-scrolling:opacity-100"
      >
        <ScrollAreaPrimitive.Thumb className="bg-base-ternary w-full rounded-full" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
};
