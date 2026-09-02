import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const iconButtonVariants = cva(
  "flex items-center justify-center transition duration-150",
  {
    variants: {
      size: {
        sm: "h-4 w-4 md:h-6 md:w-6",
        md: "h-6 w-6 md:h-8 md:w-8",
      },
      color: {
        primary: "stroke-base-primary active:opacity-30",
        secondary: "stroke-base-secondary active:opacity-30",
        ternary: "stroke-base-ternary active:opacity-30",
      },
      disabled: {
        true: "stroke-base-disabled",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  },
);

export type IconButtonProps = VariantProps<typeof iconButtonVariants> &
  ButtonPrimitive.Props;

export const IconButton = ({
  size,
  color,
  disabled,
  className,
  children,
  ...props
}: IconButtonProps) => {
  return (
    <ButtonPrimitive {...props}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return child;
        }
        return cloneElement(child as ReactElement<IconButtonProps>, {
          className: cn(
            iconButtonVariants({ size, color, disabled }),
            className,
          ),
        });
      })}
    </ButtonPrimitive>
  );
};
