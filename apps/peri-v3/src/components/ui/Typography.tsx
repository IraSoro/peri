import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const typographyVariants = cva("", {
  variants: {
    size: {
      1: "text-xs",
      2: "text-sm",
      3: "text-base",
      4: "text-lg",
      5: "text-xl",
      6: "text-2xl",
      7: "text-3xl",
      8: "text-4xl",
      9: "text-5xl",
      10: "text-6xl",
      11: "text-7xl",
      12: "text-8xl",
      13: "text-9xl",
    },
    weight: {
      normal: "font-normal",
      bold: "font-bold",
    },
    color: {
      primary: "text-base-primary",
      secondary: "text-base-secondary",
      disabled: "text-base-disabled",
      follicular: "text-follicular-primary",
      menstrual: "text-menstrual-primary",
      ovulation: "text-ovulation-primary",
      luteal: "text-luteal-primary",
      delayed: "text-delayed-primary",
      gradient: "peri-gradient-linear bg-clip-text text-transparent",
    },
  },
  defaultVariants: {
    size: 3,
    weight: "normal",
    color: "primary",
  },
});

export type TypographyProps = VariantProps<typeof typographyVariants> &
  Pick<React.ComponentProps<"div">, "className" | "children">;

export const Typography = ({
  size,
  weight,
  color,
  className,
  ...props
}: TypographyProps) => {
  return (
    <div
      {...props}
      className={cn(typographyVariants({ size, weight, color }), className)}
    />
  );
};
