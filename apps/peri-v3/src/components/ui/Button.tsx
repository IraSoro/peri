import { cva, type VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "flex items-center justify-center transition duration-150",
  {
    variants: {
      variant: {
        contained:
          "bg-[var(--c-bg)] text-[var(--c-text)] border-transparent active:brightness-70",
        outlined:
          "border bg-transparent text-[var(--c-bg)] border-[var(--c-border)] active:text-[var(--c-text)] active:bg-[var(--c-bg)]",
        text: "bg-transparent text-[var(--c-bg)] border-transparent active:opacity-30",
      },
      size: {
        sm: "text-sm md:text-lg pt-2 pb-2 ps-4 pe-4 rounded-lg",
        md: "text-md md:text-xl pt-2 pb-2 ps-5 pe-5 rounded-lg",
        lg: "text-lg md:text-2xl pt-2 pb-2 ps-6 pe-6 rounded-lg",
      },
      color: {
        primary:
          "[--c-bg:theme(--color-base-primary)] [--c-text:theme(--color-base-primary-inverse)]",
        menstrual:
          "[--c-bg:theme(--color-menstrual-primary)] [--c-text:theme(--color-base-primary-inverse)] [--c-border:theme(--color-menstrual-primary)]",
      },
      disabled: {
        true: "border-base-disabled text-base-disabled bg-transparent border",
      },
    },
    defaultVariants: {
      variant: "text",
      size: "md",
      color: "primary",
    },
  },
);

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
