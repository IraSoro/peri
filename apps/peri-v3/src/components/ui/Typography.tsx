import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const typographyVariants = cva("", {
  variants: {
    size: {
      1: "text-xs md:text-sm lg:text-base",
      2: "text-sm md:text-base lg:text-md",
      3: "text-base md:text-md lg:text-lg",
      4: "text-md md:text-lg lg:text-xl",
      5: "text-lg md:text-xl lg:text-2xl",
      6: "text-xl md:text-2xl lg:text-3xl",
      7: "text-2xl md:text-3xl lg:text-4xl",
      8: "text-3xl md:text-4xl lg:text-5xl",
      9: "text-4xl md:text-5xl lg:text-6xl",
      10: "text-5xl md:text-6xl lg:text-7xl",
      11: "text-6xl md:text-7xl lg:text-8xl",
      12: "text-7xl md:text-8xl lg:text-9xl",
      13: "text-8xl md:text-9xl lg:text-[10rem]",
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
      action: "text-action-primary",
    },
  },
  defaultVariants: {
    size: 2,
    weight: "normal",
    color: "primary",
  },
});

export type TypographyProps = VariantProps<typeof typographyVariants> &
  Pick<React.ComponentProps<"div">, "className" | "children" | "onClick">;

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
