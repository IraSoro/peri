import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
} from "react";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const iconButtonVariants = cva("", {
  variants: {
    size: {
      sm: "min-h-6 min-w-6 p-1",
      md: "min-h-8 min-w-8 p-1",
    },
    color: {
      primary: "",
      secondary: "",
      ternary: "",
    },
    disabled: {
      true: "border-base-disabled text-base-disabled",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

export type IconButtonProps = VariantProps<typeof iconButtonVariants> &
  ButtonPrimitive.Props;

const iconButtonIconVariants = cva("", {
  variants: {
    size: {
      sm: "min-h-6 min-w-6",
      md: "min-h-8 min-w-8",
    },
    color: {
      primary: "stroke-base-primary",
      secondary: "stroke-base-secondary",
      ternary: "stroke-base-ternary",
    },
    disabled: {
      true: "border-base-disabled text-base-disabled",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

export type IconButtonIconProps = VariantProps<typeof iconButtonIconVariants> &
  ComponentProps<"svg">;

export const IconButton = ({
  size,
  color,
  disabled,
  className,
  children,
  ...props
}: IconButtonProps) => {
  return (
    <ButtonPrimitive
      {...props}
      className={cn(iconButtonVariants({ size, color, disabled }), className)}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return child;
        }
        return cloneElement(child as ReactElement<IconButtonIconProps>, {
          className: cn(iconButtonIconVariants({ size, color, disabled })),
        });
      })}
    </ButtonPrimitive>
  );
};
