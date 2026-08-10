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
        "group stroke-base-primary text-base-primary flex w-full items-center justify-between text-lg font-bold",
        className,
      )}
    >
      {children}
      <ChevronsUpDown className="group-data-panel-open:hidden" />
      <ChevronsDownUp className="hidden group-data-panel-open:block" />
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
      className={cn("flex flex-col gap-2 pt-3 pb-3", className)}
    />
  );
};
