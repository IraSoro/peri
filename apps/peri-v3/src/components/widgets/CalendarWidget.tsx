import { useState } from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps as DayButtonPrimitiveProps,
} from "react-day-picker";
import { useDirection } from "@base-ui/react/direction-provider";
import { useDrag } from "@use-gesture/react";
import { addMonths } from "date-fns";
import { cva, type VariantProps } from "class-variance-authority";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  Settings,
} from "lucide-react";
import { IconButton } from "../ui/IconButton";

const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export const CalendarWidget = () => {
  const direction = useDirection();
  const [month, setMonth] = useState(new Date());

  return (
    <WidgetLayout>
      <Calendar
        mode="single"
        showOutsideDays
        fixedWeeks
        dir={direction}
        month={month}
        onMonthChange={setMonth}
      />
      <div className="flex justify-end gap-2 ps-3 pe-3 md:ps-5 md:pe-5">
        <Button>Discard</Button>
        <Button variant="contained">Save</Button>
      </div>
    </WidgetLayout>
  );
};

const defaultClassNames = getDefaultClassNames();

type CalendarProps = React.ComponentProps<typeof DayPicker>;

const Calendar = ({ dir, month, onMonthChange, ...props }: CalendarProps) => {
  const bind = useDrag(
    ({ swipe: [swipeX], last, movement: [mx], velocity: [vx] }) => {
      if (!last || !month || !onMonthChange) return;
      const isSwipe =
        swipeX !== 0 ||
        (Math.abs(mx) > SWIPE_DISTANCE_THRESHOLD &&
          vx > SWIPE_VELOCITY_THRESHOLD);
      if (!isSwipe) return;

      const direction = (swipeX || Math.sign(mx)) * (dir === "rtl" ? -1 : 1);
      onMonthChange(addMonths(month, direction > 0 ? -1 : 1));
    },
    { axis: "x", filterTaps: true, pointer: { touch: true } },
  );

  return (
    <div {...bind()} className="touch-pan-y">
      <DayPicker
        {...props}
        dir={dir}
        month={month}
        onMonthChange={onMonthChange}
        className="border-base-ternary aspect-square rounded-xl border-2 p-2 md:rounded-2xl md:border-3 md:p-4"
        classNames={{
          root: cn("w-full", defaultClassNames.root),
          months: cn(
            "relative flex relative flex-col",
            defaultClassNames.months,
          ),
          month: cn("flex w-full flex-col gap-1", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between ps-3 pe-3 md:ps-9 md:pe-9",
            defaultClassNames.nav,
          ),
          month_caption: cn(
            "flex w-full text-base-primary font-bold text-sm md:text-xl items-center justify-center h-10 lg:text-2xl",
            defaultClassNames.month_caption,
          ),
          month_grid: cn(
            "w-full border-collapse",
            defaultClassNames.month_grid,
          ),
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "flex flex-1 items-center justify-center text-sm md:text-xl text-base-secondary aspect-square font-normal select-none",
            defaultClassNames.weekday,
          ),
          week: cn("flex w-full", defaultClassNames.week),
          day: cn(
            "flex-1 aspect-square p-0 text-center select-none p-px md:p-1",
            defaultClassNames.day,
          ),
        }}
        components={{
          DayButton,
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeft
                  className={cn(
                    "h-10 stroke-2 md:stroke-3 rtl:rotate-180",
                    className,
                  )}
                  {...props}
                />
              );
            }
            if (orientation === "right") {
              return (
                <ChevronRight
                  className={cn(
                    "h-10 stroke-2 md:stroke-3 rtl:rotate-180",
                    className,
                  )}
                  {...props}
                />
              );
            }
            return (
              <ChevronDown
                className={cn("h-10 stroke-2 md:stroke-3", className)}
                {...props}
              />
            );
          },
        }}
        footer={<CalendarFooter />}
        modifiers={{
          future: (date) => {
            return date > new Date();
          },
          menstrual: (_date) => {
            return false;
          },
          ovulation: (_date) => {
            return false;
          },
        }}
      />
    </div>
  );
};

const dayButtonVariants = cva(
  "flex relative h-full w-full items-center justify-center select-none min-h-0 p-0",
  {
    variants: {
      today: {
        true: "bg-base-primary/80 text-base-primary-inverse",
      },
      selected: {
        true: "bg-base-primary text-base-primary-inverse",
      },
      outside: {
        true: "text-base-secondary",
      },
      menstrual: {
        true: "",
      },
    },
    compoundVariants: [
      {
        outside: true,
        selected: true,
        class: "text-base-primary-inverse",
      },
      {
        outside: true,
        today: true,
        class: "text-base-primary-inverse",
      },
    ],
  },
);

type DayButtonProps = VariantProps<typeof dayButtonVariants> &
  DayButtonPrimitiveProps;

const DayButton = ({ day, modifiers, className, ...props }: DayButtonProps) => {
  return (
    <Button
      {...props}
      variant="text"
      color="primary"
      className={cn(
        "rounded-[40%] text-sm md:text-base lg:text-xl",
        dayButtonVariants({ ...modifiers }),
        defaultClassNames.day,
        className,
      )}
    >
      {day.date.getDate()}
      <DayStatusRing modifiers={modifiers} />
    </Button>
  );
};

const dayStatusRingVariants = cva(
  "absolute top-1.25 md:top-2.5 end-1.25 md:end-2.5 h-2 md:h-3 w-2 md:w-3 rounded-full",
  {
    variants: {
      menstrual: {
        true: "",
      },
      future: {
        true: "",
      },
      ovulation: {
        true: "bg-ovulation-primary",
      },
    },
    compoundVariants: [
      {
        menstrual: true,
        future: false,
        class: "bg-menstrual-primary",
      },
      {
        menstrual: true,
        future: true,
        class: "border-menstrual-primary border-2 md:border-3",
      },
    ],
  },
);

type DayStatusRingProps = VariantProps<typeof dayStatusRingVariants> &
  Pick<DayButtonPrimitiveProps, "modifiers">;

const DayStatusRing = ({ modifiers }: DayStatusRingProps) => {
  return <span className={dayStatusRingVariants({ ...modifiers })}></span>;
};

const CalendarFooter = () => {
  return (
    <div className="flex flex-col gap-3 p-2 md:gap-4 md:p-3">
      <div className="flex gap-2 md:gap-4">
        <Button size="sm" variant="outlined" color="menstrual">
          Mark the first day
        </Button>
        <Button size="sm" variant="outlined">
          Today
        </Button>
      </div>
      <div className="flex justify-end gap-2 md:gap-4">
        <IconButton size="md" color="secondary">
          <CircleQuestionMark />
        </IconButton>
        <IconButton size="md" color="secondary">
          <Settings />
        </IconButton>
      </div>
    </div>
  );
};
