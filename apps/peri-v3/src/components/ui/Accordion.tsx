import { cn } from "@/lib/utils/cn";
import { Accordion as AccordionPrimitive } from "@base-ui/react";
import { ChevronDown } from "lucide-react";
import { useHeightTransition } from "@/lib/hooks/useHeightTransition";

export type AccordionProps = AccordionPrimitive.Root.Props;

export const Accordion = ({ className, ...props }: AccordionProps) => {
  return (
    <AccordionPrimitive.Root
      {...props}
      className={cn("flex flex-col rounded-xl border p-3 md:p-4", className)}
    />
  );
};

export type AccordionItemProps = AccordionPrimitive.Item.Props;

export const AccordionItem = ({ ...props }: AccordionItemProps) => {
  return <AccordionPrimitive.Item {...props} />;
};

export type AccordionTriggerProps = AccordionPrimitive.Trigger.Props;

export const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionTriggerProps) => {
  return (
    <AccordionPrimitive.Trigger
      {...props}
      className={cn(
        "stroke-base-primary text-base-primary group flex w-full items-center justify-between text-sm font-bold md:text-lg",
        className,
      )}
    >
      {children}
      <ChevronDown className="h-5 w-5 transition-transform duration-200 ease-out group-data-panel-open:rotate-180 md:h-6 md:w-6" />
    </AccordionPrimitive.Trigger>
  );
};

export type AccordionContentProps = AccordionPrimitive.Panel.Props;

export const AccordionContent = ({
  className,
  children,
  keepMounted = true,
  ...props
}: AccordionContentProps) => {
  return (
    <AccordionPrimitive.Panel
      {...props}
      keepMounted={keepMounted}
      className="overflow-hidden"
      render={(panelProps, state) => (
        <AccordionContentBody panelProps={panelProps} open={state.open}>
          <div
            className={cn(
              "flex flex-wrap gap-2 pt-2 pb-2 md:pt-3 md:pb-3",
              className,
            )}
          >
            {children}
          </div>
        </AccordionContentBody>
      )}
    />
  );
};

type AccordionContentBodyProps = {
  panelProps: React.ComponentProps<"div">;
  open: boolean;
  children: React.ReactNode;
};

const AccordionContentBody = ({
  panelProps,
  open,
  children,
}: AccordionContentBodyProps) => {
  const { ref } = useHeightTransition(open, { collapsedHeight: 0 });

  return (
    <div {...panelProps} ref={ref}>
      {children}
    </div>
  );
};
