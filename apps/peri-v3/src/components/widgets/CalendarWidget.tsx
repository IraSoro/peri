import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { addMonths, startOfMonth } from "date-fns";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps as DayButtonPrimitiveProps,
} from "react-day-picker";
import { useDirection } from "@base-ui/react/direction-provider";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Button } from "@/components/ui/Button";
import { LazyMount } from "@/components/ui/LazyMount";
import { cn } from "@/lib/utils/cn";
import {
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  Settings,
} from "lucide-react";
import { IconButton } from "../ui/IconButton";

// Initial window size: how many months are rendered before/after the
// current month on first mount.
const MONTHS_BEFORE = 6;
const MONTHS_AFTER = 6;
// How many months to append/prepend each time the window needs to grow.
const MONTHS_GROW = 6;
// How close (in slides) the active month can get to either end of the
// window before it triggers growth.
const EDGE_THRESHOLD = 2;

export const CalendarWidget = () => {
  const direction = useDirection();

  const [months, setMonths] = useState(() => {
    const baseMonth = startOfMonth(new Date());
    return Array.from(
      { length: MONTHS_BEFORE + MONTHS_AFTER + 1 },
      (_, index) => addMonths(baseMonth, index - MONTHS_BEFORE),
    );
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    loop: false,
    direction: direction === "rtl" ? "rtl" : "ltr",
    startIndex: MONTHS_BEFORE,
  });

  const [activeIndex, setActiveIndex] = useState(MONTHS_BEFORE);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>();

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Grow the window once the active slide gets close to either edge.
  // Prepending shifts every existing index, so activeIndex is bumped by the
  // same amount in the same batch - the carousel itself only finds out once
  // the reInit effect below runs.
  useEffect(() => {
    if (activeIndex <= EDGE_THRESHOLD) {
      setMonths((prev) => {
        const additional = Array.from({ length: MONTHS_GROW }, (_, index) =>
          addMonths(prev[0], index - MONTHS_GROW),
        );
        return [...additional, ...prev];
      });
      setActiveIndex((prev) => prev + MONTHS_GROW);
    } else if (activeIndex >= months.length - 1 - EDGE_THRESHOLD) {
      setMonths((prev) => {
        const additional = Array.from({ length: MONTHS_GROW }, (_, index) =>
          addMonths(prev[prev.length - 1], index + 1),
        );
        return [...prev, ...additional];
      });
    }
  }, [activeIndex, months.length]);

  // Reconcile embla with newly-inserted slide DOM nodes - a reInit alone
  // keeps the same pixel scroll offset, which after a prepend now points at
  // the wrong slide, so jump back to the (already-adjusted) active index.
  const prevMonthsLengthRef = useRef(months.length);
  useEffect(() => {
    if (!emblaApi || prevMonthsLengthRef.current === months.length) return;
    prevMonthsLengthRef.current = months.length;
    emblaApi.reInit();
    emblaApi.scrollTo(activeIndex, true);
  }, [emblaApi, months.length, activeIndex]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <WidgetLayout>
      <div className="border-base-ternary flex aspect-square flex-col rounded-xl border-2 p-2 md:rounded-2xl md:border-3 md:p-4">
        <CalendarHeader
          dir={direction}
          month={months[activeIndex]}
          canScrollPrev={canScrollPrev}
          canScrollNext={canScrollNext}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
        />
        <div
          ref={emblaRef}
          className="min-h-0 flex-1 touch-pan-y overflow-hidden"
        >
          <div className="flex h-full">
            {months.map((month, index) => {
              const distance = Math.abs(index - activeIndex);
              return (
                <div
                  key={month.toISOString()}
                  className="h-full min-w-0 shrink-0 grow-0 basis-full"
                >
                  {distance <= 1 ? (
                    <LazyMount isActive={distance === 0}>
                      <CalendarSlide
                        month={month}
                        selected={selected}
                        onSelect={setSelected}
                      />
                    </LazyMount>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <CalendarFooter />
      </div>
      <div className="flex justify-end gap-2 ps-3 pe-3 md:ps-5 md:pe-5">
        <Button>Discard</Button>
        <Button variant="contained">Save</Button>
      </div>
    </WidgetLayout>
  );
};

const defaultClassNames = getDefaultClassNames();

const calendarClassNames = {
  root: cn("w-full", defaultClassNames.root),
  months: cn("relative flex relative flex-col", defaultClassNames.months),
  month: cn("flex w-full flex-col gap-1", defaultClassNames.month),
  nav: cn(
    "absolute inset-x-0 top-0 flex h-10 w-full items-center justify-between ps-3 pe-3 md:ps-9 md:pe-9",
    defaultClassNames.nav,
  ),
  button_previous: cn(
    "flex items-center justify-center",
    defaultClassNames.button_previous,
  ),
  button_next: cn(
    "flex items-center justify-center",
    defaultClassNames.button_next,
  ),
  month_caption: cn(
    "flex w-full text-base-primary font-bold text-sm md:text-xl items-center justify-center h-10 lg:text-2xl",
    defaultClassNames.month_caption,
  ),
  month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
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
};

const calendarModifiers = {
  future: (date: Date) => date > new Date(),
  menstrual: (_date: Date) => false,
  ovulation: (_date: Date) => false,
};

type CalendarHeaderProps = {
  dir: "ltr" | "rtl";
  month: Date;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
};

const CalendarHeader = ({
  dir,
  month,
  canScrollPrev,
  canScrollNext,
  onScrollPrev,
  onScrollNext,
}: CalendarHeaderProps) => {
  return (
    <DayPicker
      dir={dir}
      month={month}
      disableNavigation
      classNames={calendarClassNames}
      components={{
        Weeks: () => <></>,
        Nav: () => (
          <div className={calendarClassNames.nav}>
            <IconButton disabled={!canScrollPrev} onClick={onScrollPrev}>
              {dir === "rtl" ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
            <IconButton disabled={!canScrollNext} onClick={onScrollNext}>
              {dir === "rtl" ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </div>
        ),
      }}
    />
  );
};

type CalendarSlideProps = {
  month: Date;
  selected: Date | undefined;
  onSelect: (selected: Date | undefined) => void;
};

const CalendarSlide = ({ month, selected, onSelect }: CalendarSlideProps) => {
  return (
    <DayPicker
      mode="single"
      showOutsideDays
      fixedWeeks
      disableNavigation
      hideWeekdays
      month={month}
      selected={selected}
      onSelect={onSelect}
      className="flex h-full flex-col"
      classNames={calendarClassNames}
      components={{ DayButton, Nav: () => <></>, MonthCaption: () => <></> }}
      modifiers={calendarModifiers}
    />
  );
};

const dayButtonVariants = cva(
  "flex relative h-full w-full items-center justify-center select-none min-h-0 p-0 text-base-primary transition-colors duration-150",
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
    <ButtonPrimitive
      {...props}
      className={cn(
        "rounded-[40%] text-sm md:text-base lg:text-xl",
        dayButtonVariants({ ...modifiers }),
        defaultClassNames.day,
        className,
      )}
    >
      {day.date.getDate()}
      <DayStatusRing modifiers={modifiers} />
    </ButtonPrimitive>
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
