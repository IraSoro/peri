import { Popover as PopoverPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils/cn";

export type PopoverProps = PopoverPrimitive.Root.Props;

export const Popover = (props: PopoverProps) => {
  return <PopoverPrimitive.Root {...props} />;
};

export type PopoverTriggerProps = PopoverPrimitive.Trigger.Props;

export const PopoverTrigger = (props: PopoverTriggerProps) => {
  return <PopoverPrimitive.Trigger {...props} />;
};

export type PopoverContentProps = PopoverPrimitive.Popup.Props & {
  sideOffset?: number;
};

export const PopoverContent = ({
  className,
  sideOffset = 8,
  ...props
}: PopoverContentProps) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner sideOffset={sideOffset} className="z-30">
        <PopoverPrimitive.Popup
          {...props}
          className={cn(
            "border-base-ternary bg-base-bg text-base-primary max-w-64 rounded-xl border-2 p-3 text-sm md:max-w-80 md:p-4 md:text-base",
            className,
          )}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
};
