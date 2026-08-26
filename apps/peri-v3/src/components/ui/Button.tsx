import { cva, type VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva("flex items-center justify-center", {
  variants: {
    variant: {
      contained: "text-base-primary-inverse bg-base-primary",
      outlined: "border md:border-2 bg-transparent",
      text: "bg-transparent",
    },
    size: {
      sm: "text-sm md:text-lg pt-2 pb-2 pl-3 pr-3 gap-2 rounded-lg",
      md: "text-md md:text-xl pt-2 pb-2 pl-6 pr-6 gap-2 rounded-lg",
    },
    color: {
      primary: "border-base-primary text-base-primary",
      menstrual:
        "bg-menstrual-bg text-menstrual-primary border-menstrual-primary",
    },
    disabled: {
      true: "border-base-disabled text-base-disabled",
    },
  },
  compoundVariants: [
    {
      variant: "contained",
      color: "primary",
      class: "text-base-primary-inverse bg-base-primary",
    },
    {
      variant: "contained",
      disabled: true,
      class: "text-base-disabled bg-base-disabled/20",
    },
  ],
  defaultVariants: {
    variant: "text",
    size: "md",
    color: "primary",
  },
});

export type ButtonProps = VariantProps<typeof buttonVariants> &
  ButtonPrimitive.Props;

export const Button = ({
  variant,
  size,
  color,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  return (
    <ButtonPrimitive
      {...props}
      className={cn(
        buttonVariants({ variant, size, color, disabled }),
        className,
      )}
    />
  );
};
