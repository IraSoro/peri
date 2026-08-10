import { cn } from "@/lib/utils/cn";
import { Accordion as AccordionPrimitive } from "@base-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type AccordionProps = AccordionPrimitive.Root.Props;

export const Accordion = ({ className, ...props }: AccordionProps) => {
  return (
    <AccordionPrimitive.Root
      {...props}
      className={cn("flex flex-col rounded-xl border-2 p-3", className)}
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
        "stroke-base-primary text-base-primary group flex w-full items-center justify-between text-lg font-bold",
        className,
      )}
    >
      {children}
      <ChevronDown className="group-data-panel-open:hidden" />
      <ChevronUp className="hidden group-data-panel-open:block" />
    </AccordionPrimitive.Trigger>
  );
};

export type AccordionContentProps = AccordionPrimitive.Panel.Props;

export const AccordionContent = ({
  className,
  ...props
}: AccordionContentProps) => {
  return (
    <AccordionPrimitive.Panel
      {...props}
      className={cn("flex flex-wrap gap-2 pt-3 pb-3", className)}
    />
  );
};
