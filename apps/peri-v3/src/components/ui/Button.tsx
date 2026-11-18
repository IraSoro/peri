import { cva, type VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "flex items-center justify-center transition duration-150 active:duration-0",
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
        warning:
          "[--c-bg:theme(--color-warning-primary)] [--c-text:theme(--color-warning-primary-inverse)] [--c-border:theme(--color-warning-primary)]",
        error:
          "[--c-bg:theme(--color-error-primary)] [--c-text:theme(--color-error-primary-inverse)] [--c-border:theme(--color-error-primary)]",
        info: "[--c-bg:theme(--color-info-primary)] [--c-text:theme(--color-info-primary-inverse)] [--c-border:theme(--color-info-primary)]",
        success:
          "[--c-bg:theme(--color-success-primary)] [--c-text:theme(--color-success-primary-inverse)] [--c-border:theme(--color-success-primary)]",
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
