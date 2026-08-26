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

const iconButtonVariants = cva("flex items-center justify-center", {
  variants: {
    size: {
      sm: "min-h-4 min-w-4 md:min-h-6 md:min-w-6",
      md: "min-h-6 min-w-6 md:min-h-8 md:min-w-8",
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

const iconButtonIconVariants = cva("flex items-center justify-center", {
  variants: {
    size: {
      sm: "h-4 w-4 md:h-6 md:w-6",
      md: "h-6 w-6 md:h-8 md:w-8",
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
