import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Info } from "lucide-react";
import { Typography } from "../ui/Typography";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "../ui/IconButton";

export const PeriodStatusWidget = () => {
  return (
    <WidgetLayout gap="lg">
      <PeriodCountdown />
      <PeriodInfo />
    </WidgetLayout>
  );
};

const PeriodCountdown = () => {
  return (
    <div className="flex flex-col gap-1">
      <Typography size={7} weight="bold">
        Period in
      </Typography>
      <Typography size={11} weight="bold" color="follicular">
        12 days
      </Typography>
    </div>
  );
};

const PeriodInfo = () => {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <PeriodInfoIndicator label="Follicular" color="follicular" />
      <PeriodInfoIndicator label="Low" color="pregnancyLow" />
    </div>
  );
};

const periodInfoIndicatorVariants = cva("", {
  variants: {
    color: {
      follicular: "bg-follicular-primary",
      menstrual: "bg-menstrual-primary",
      ovulation: "bg-ovulation-primary",
      luteal: "bg-luteal-primary",
      pregnancyLow: "bg-pregnancyLow-primary",
      pregnancyHigh: "bg-pregnancyHigh-primary",
    },
  },
});

type PeriodInfoIndicatorProps = {
  label: string;
} & VariantProps<typeof periodInfoIndicatorVariants>;

const PeriodInfoIndicator = ({ label, color }: PeriodInfoIndicatorProps) => {
  return (
    <div className="flex gap-0.5 md:gap-1">
      <div className="flex items-center gap-1 md:gap-2">
        <div
          className={cn(
            "size-3 rounded-full md:size-4",
            periodInfoIndicatorVariants({ color }),
          )}
        />
        <Typography size={3}>{label}</Typography>
      </div>
      <IconButton size="sm" color="ternary">
        <Info />
      </IconButton>
    </div>
  );
};
