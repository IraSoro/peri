import { cn } from "@/lib/utils/cn";
import { Button } from "@base-ui/react";
import { cva } from "class-variance-authority";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
} from "react-day-picker";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  Settings,
} from "lucide-react";

export type CalendarProps = Pick<React.ComponentProps<"div">, "className"> &
  React.ComponentProps<typeof DayPicker>;

const defaultClassNames = getDefaultClassNames();

export const Calendar = ({ className, locale, ...props }: CalendarProps) => {
  return (
    <DayPicker
      mode="single"
      showOutsideDays
      locale={locale}
      components={{
        DayButton,
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft
                className={cn("stroke-base-primary h-10 stroke-3", className)}
                {...props}
              />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRight
                className={cn("stroke-base-primary h-10 stroke-3", className)}
                {...props}
              />
            );
          }
          return (
            <ChevronDown
              className={cn("stroke-base-primary h-10 stroke-3", className)}
              {...props}
            />
          );
        },
      }}
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
      footer={<CalendarFooter />}
      className={cn(
        "border-base-ternary aspect-square rounded-2xl border-3 p-4",
        className,
      )}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 pl-9 pr-9",
          defaultClassNames.nav,
        ),
        month_caption: cn(
          "flex w-full text-base-primary font-bold text-xl items-center justify-center h-10",
          defaultClassNames.month_caption,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex flex-1 items-center justify-center text-xl text-base-secondary aspect-square font-normal select-none",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full", defaultClassNames.week),
        day: cn(
          "flex-1 aspect-square p-0 text-center select-none p-1 rounded-[25px]",
          defaultClassNames.day,
        ),
      }}
      {...props}
    />
  );
};

const dayButtonVariants = cva(
  "flex h-full w-full items-center justify-center text-xl select-none rounded-[40%]",
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
    ],
    defaultVariants: {},
  },
);

const DayButton = ({ day, modifiers, ...props }: DayButtonProps) => {
  return (
    <Button
      {...props}
      className={cn(
        "relative",
        dayButtonVariants({ ...modifiers }),
        defaultClassNames.day,
      )}
    >
      {day.date.getDate()}
      <DayStatusRing modifiers={modifiers} />
    </Button>
  );
};

const dayStatusRingVariants = cva(
  "absolute top-2.5 right-2.5 h-3 w-3 rounded-full",
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
        class: "border-menstrual-primary border-3",
      },
    ],
  },
);

const DayStatusRing = ({ modifiers }: Pick<DayButtonProps, "modifiers">) => {
  return <span className={dayStatusRingVariants({ ...modifiers })}></span>;
};

const CalendarFooter = () => {
  return (
    <div className="p-3">
      <div className="flex gap-4">
        <Button className="bg-menstrual-bg border-menstrual-primary text-menstrual-primary min-h-10 items-center justify-center rounded-lg border-2 p-1 pr-3 pl-3 text-xl">
          Mark the first day
        </Button>
        <Button className="border-base-primary text-base-primary min-h-10 items-center justify-center rounded-lg border-2 p-1 pr-3 pl-3 text-xl">
          Today
        </Button>
      </div>
      <div className="flex justify-end gap-4">
        <CircleQuestionMark size={32} className="stroke-base-secondary" />
        <Settings size={32} className="stroke-base-secondary" />
      </div>
    </div>
  );
};
