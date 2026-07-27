import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps as DayButtonPrimitiveProps,
} from "react-day-picker";
import { cva, type VariantProps } from "class-variance-authority";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Loader } from "@/components/ui/Loader";
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

export const CalendarWidget = () => {
  return (
    <WidgetLayout>
      <Calendar2 mode="single" showOutsideDays />
      <div className="flex justify-between pr-5 pl-5">
        <Loader size="sm" message="Saving" />
        <div className="flex gap-4">
          <Button>Discard</Button>
          <Button variant="contained">Save</Button>
        </div>
      </div>
    </WidgetLayout>
  );
};

const defaultClassNames = getDefaultClassNames();

const calendarVariants = cva(
  "border-base-ternary aspect-square rounded-2xl border-3 p-4",
  {
    variants: {
      size: {
        md: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const calendarRootGridVariants = cva("w-full", {
  variants: {
    size: {
      md: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const calendarMonthsVariants = cva("relative flex relative flex-col gap-4", {
  variants: {
    size: {
      md: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const calendarMonthVariants = cva("flex w-full flex-col gap-4", {
  variants: {
    size: {
      md: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const calendarNavVariants = cva(
  "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 pl-9 pr-9",
  {
    variants: {
      size: {
        md: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const calendarMonthCaptionVariants = cva(
  "flex w-full text-base-primary font-bold text-xl items-center justify-center h-10",
  {
    variants: {
      size: {
        md: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const calendarMonthGridVariants = cva("w-full border-collapse", {
  variants: {
    size: {
      md: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const calendarWeekdaysVariants = cva("flex", {
  variants: {
    size: {
      md: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const calendarWeekdayVariants = cva(
  "flex flex-1 items-center justify-center text-xl text-base-secondary aspect-square font-normal select-none",
  {
    variants: {
      size: {
        md: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const calendarWeekVariants = cva("flex w-full", {
  variants: {
    size: {
      md: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const calendarDayVariants = cva(
  "flex-1 aspect-square p-0 text-center select-none p-1 rounded-[25px]",
  {
    variants: {
      size: {
        md: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const calendarChevronVariants = cva("stroke-base-primary", {
  variants: {
    size: {
      md: "h-10 stroke-3",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type Calendar2Props = VariantProps<typeof calendarVariants> &
  React.ComponentProps<typeof DayPicker>;

const Calendar2 = ({ size, ...props }: Calendar2Props) => {
  return (
    <DayPicker
      {...props}
      className={calendarVariants({ size })}
      classNames={{
        root: cn(calendarRootGridVariants({ size }), defaultClassNames.root),
        months: cn(calendarMonthsVariants({ size }), defaultClassNames.months),
        month: cn(calendarMonthVariants({ size }), defaultClassNames.month),
        nav: cn(calendarNavVariants({ size }), defaultClassNames.nav),
        month_caption: cn(
          calendarMonthCaptionVariants({ size }),
          defaultClassNames.month_caption,
        ),
        month_grid: cn(
          calendarMonthGridVariants({ size }),
          defaultClassNames.month_grid,
        ),
        weekdays: cn(
          calendarWeekdaysVariants({ size }),
          defaultClassNames.weekdays,
        ),
        weekday: cn(
          calendarWeekdayVariants({ size }),
          defaultClassNames.weekday,
        ),
        week: cn(calendarWeekVariants({ size }), defaultClassNames.week),
        day: cn(calendarDayVariants({ size }), defaultClassNames.day),
      }}
      components={{
        DayButton,
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft
                className={cn(calendarChevronVariants({ size }), className)}
                {...props}
              />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRight
                className={cn(calendarChevronVariants({ size }), className)}
                {...props}
              />
            );
          }
          return (
            <ChevronDown
              className={cn(calendarChevronVariants({ size }), className)}
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
  );
};

const dayButtonVariants = cva(
  "flex relative h-full w-full items-center justify-center select-none min-h-0 p-0",
  {
    variants: {
      size: {
        md: "text-xl rounded-[40%]",
      },
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
    defaultVariants: {
      size: "md",
    },
  },
);

type DayButtonProps = VariantProps<typeof dayButtonVariants> &
  DayButtonPrimitiveProps;

const DayButton = ({
  day,
  modifiers,
  size,
  className,
  ...props
}: DayButtonProps) => {
  return (
    <Button
      {...props}
      variant="text"
      color="primary"
      className={cn(
        dayButtonVariants({ size, ...modifiers }),
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
  "absolute top-2.5 right-2.5 h-3 w-3 rounded-full",
  {
    variants: {
      size: {
        md: "",
      },
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

type DayStatusRingProps = VariantProps<typeof dayStatusRingVariants> &
  Pick<DayButtonPrimitiveProps, "modifiers">;

const DayStatusRing = ({ size, modifiers }: DayStatusRingProps) => {
  return (
    <span className={dayStatusRingVariants({ size, ...modifiers })}></span>
  );
};

const CalendarFooter = () => {
  return (
    <div className="p-3">
      <div className="flex gap-4">
        <Button size="sm" variant="outlined" color="menstrual">
          Mark the first day
        </Button>
        <Button size="sm" variant="outlined">
          Today
        </Button>
      </div>
      <div className="flex justify-end gap-4">
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
