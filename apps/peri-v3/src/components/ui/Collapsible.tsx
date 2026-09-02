import { cn } from "@/lib/utils/cn";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react";
import { ChevronsUpDown } from "lucide-react";
import { useHeightTransition } from "@/lib/hooks/useHeightTransition";

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
      <ChevronsUpDown className="h-5 w-5 transition-transform duration-200 ease-out group-data-panel-open:rotate-180 md:h-6 md:w-6" />
    </CollapsiblePrimitive.Trigger>
  );
};

export type CollapsibleContentProps = CollapsiblePrimitive.Panel.Props;

export const CollapsibleContent = ({
  className,
  children,
  keepMounted = true,
  ...props
}: CollapsibleContentProps) => {
  return (
    <CollapsiblePrimitive.Panel
      {...props}
      keepMounted={keepMounted}
      className="overflow-hidden"
      render={(panelProps, state) => (
        <CollapsibleContentBody panelProps={panelProps} open={state.open}>
          <div
            className={cn(
              "flex flex-col gap-1.5 ps-1 pe-1 pt-2 pb-2 md:pe-3 md:pt-3 md:pb-3",
              className,
            )}
          >
            {children}
          </div>
        </CollapsibleContentBody>
      )}
    />
  );
};

type CollapsibleContentBodyProps = {
  panelProps: React.ComponentProps<"div">;
  open: boolean;
  children: React.ReactNode;
};

const CollapsibleContentBody = ({
  panelProps,
  open,
  children,
}: CollapsibleContentBodyProps) => {
  const { ref } = useHeightTransition(open, { collapsedHeight: 0 });

  return (
    <div {...panelProps} ref={ref}>
      {children}
    </div>
  );
};
