import { cva, type VariantProps } from "class-variance-authority";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { ChartNoAxesCombined } from "lucide-react";
import { Typography } from "../ui/Typography";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/Collapsible";
import { Button } from "../ui/Button";

export const CycleInfoWidget = () => {
  return (
    <WidgetLayout>
      <Typography size={7} weight="bold">
        Cycle
      </Typography>
      <div className="flex w-full flex-col gap-3">
        <CapsuleList>
          <Capsule color="follicular" />
          <Capsule color="menstrual" />
          <Capsule color="ovulation" />
          <Capsule color="luteal" />
        </CapsuleList>
        <Collapsible>
          <CollapsibleTrigger>Started on January 4th</CollapsibleTrigger>
          <CollapsibleContent>
            <Legend />
          </CollapsibleContent>
        </Collapsible>
        <CycleSummary />
      </div>
      <Button size="sm" variant="outlined">
        <ChartNoAxesCombined />
        Statistics
      </Button>
    </WidgetLayout>
  );
};

type CapsuleListProps = Pick<React.ComponentProps<"div">, "children">;

const CapsuleList = ({ children }: CapsuleListProps) => {
  return <div className="flex gap-1">{children}</div>;
};

const capsuleVariants = cva("flex-1 rounded-2xl border-2", {
  variants: {
    size: {
      xs: "h-7 max-w-4",
      md: "h-14 max-w-7",
    },
    color: {
      follicular: "bg-follicular-bg border-follicular-primary",
      menstrual: "bg-menstrual-bg border-menstrual-primary",
      ovulation: "bg-ovulation-bg border-ovulation-primary",
      luteal: "bg-luteal-bg border-luteal-primary",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type CapsuleProps = VariantProps<typeof capsuleVariants> &
  React.ComponentProps<"div">;

const Capsule = ({ size, color, ...props }: CapsuleProps) => {
  return <div {...props} className={capsuleVariants({ size, color })} />;
};

const Legend = () => {
  return (
    <>
      <LegendItem color="luteal" text="1st day of luteal" />
      <LegendItem color="ovulation" text="1 day of ovulation" />
      <LegendItem color="menstrual" text="1 day of menstrual" />
      <LegendItem color="follicular" text="1 day of follicular" />
    </>
  );
};

type LegendItemProps = {
  text: string;
  color: React.ComponentProps<typeof Capsule>["color"];
};

const LegendItem = ({ text, color }: LegendItemProps) => {
  return (
    <div className="flex w-full gap-1">
      <Capsule size="xs" color={color} />
      <Typography size={4} color="secondary">
        {text}
      </Typography>
    </div>
  );
};

const CycleSummary = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full justify-between">
        <Typography size={4} color="secondary">
          Day of cycle
        </Typography>
        <Typography size={4} color="primary" weight="bold">
          3rd
        </Typography>
      </div>
      <div className="flex w-full justify-between">
        <Typography size={4} color="secondary">
          Cycle length
        </Typography>
        <Typography size={4} color="primary" weight="bold">
          28 ± 2 days
        </Typography>
      </div>
      <div className="flex w-full justify-between">
        <Typography size={4} color="secondary">
          Period length
        </Typography>
        <Typography size={4} color="primary" weight="bold">
          6 days
        </Typography>
      </div>
    </div>
  );
};
