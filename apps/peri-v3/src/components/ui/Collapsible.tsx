import { cn } from "@/lib/utils/cn";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";

export type CollapsibleProps = CollapsiblePrimitive.Root.Props;

export const Collapsible = ({ className, ...props }: CollapsibleProps) => {
  return (
    <CollapsiblePrimitive.Root
      {...props}
      className={cn("flex flex-col", className)}
    />
  );
};

export type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props;

export const CollapsibleTrigger = ({
  className,
  children,
  ...props
}: CollapsibleTriggerProps) => {
  return (
    <CollapsiblePrimitive.Trigger
      {...props}
      className={cn(
        "group stroke-base-primary text-base-primary flex w-full items-center justify-between text-sm font-bold md:text-lg",
        className,
      )}
    >
      {children}
      <ChevronsUpDown className="h-5 w-5 group-data-panel-open:hidden md:h-6 md:w-6" />
      <ChevronsDownUp className="hidden h-5 w-5 group-data-panel-open:block md:h-6 md:w-6" />
    </CollapsiblePrimitive.Trigger>
  );
};

export type CollapsibleContentProps = CollapsiblePrimitive.Panel.Props;

export const CollapsibleContent = ({
  className,
  ...props
}: CollapsibleContentProps) => {
  return (
    <CollapsiblePrimitive.Panel
      {...props}
      className={cn(
        "flex flex-col gap-1.5 pt-2 pr-1 pb-2 pl-1 md:pt-3 md:pr-3 md:pb-3",
        className,
      )}
    />
  );
};
