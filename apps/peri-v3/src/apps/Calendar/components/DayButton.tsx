import { createContext, useContext, useEffect, useRef, useState } from "react";
import { type DayButtonProps as DayButtonPrimitiveProps } from "react-day-picker";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils/cn";
import { HOLD_MS, PAINT_HOLD_MS, useHold } from "../hooks/useHold";
import { defaultClassNames } from "./calendarClassNames";

// DayPicker builds the day buttons itself, so the hold handler reaches them
// through a context
export const DayHoldContext = createContext<{
  onHold: (date: Date) => void;
  onChange: (holding: boolean) => void;
  editing: boolean;
}>({
  onHold: () => {},
  onChange: () => {},
  editing: false,
});

const dayStatusRingVariants = cva(
  "absolute top-1.25 md:top-2.5 end-1.25 md:end-2.5 h-2 md:h-3 w-2 md:w-3 rounded-full transition-[transform,opacity] duration-200 ease-out",
  {
    variants: {
      shown: {
        true: "scale-100 opacity-100",
        false: "scale-0 opacity-0",
      },
      menstrual: {
        true: "",
      },
      predicted: {
        true: "",
      },
      ovulation: {
        true: "bg-ovulation-primary",
      },
    },
    compoundVariants: [
      {
        menstrual: true,
        predicted: false,
        class: "bg-menstrual-primary",
      },
      {
        menstrual: true,
        predicted: true,
        class: "border-menstrual-primary border-2 md:border-3",
      },
    ],
  },
);

type DayStatusRingProps = VariantProps<typeof dayStatusRingVariants> &
  Pick<DayButtonPrimitiveProps, "modifiers">;

const RING_FADE_MS = 200;

const DayStatusRing = ({ modifiers }: DayStatusRingProps) => {
  const marked = !!(modifiers.menstrual || modifiers.ovulation);
  const [leaving, setLeaving] = useState(false);
  const wasMarked = useRef(marked);

  // NOTE: A mark that goes away shrinks instead of vanishing. The mark is
  // kept for a moment with its old look, so the user sees what was removed
  useEffect(() => {
    const removed = wasMarked.current && !marked;
    wasMarked.current = marked;
    if (!removed) {
      return;
    }
    setLeaving(true);
    const timer = setTimeout(() => {
      setLeaving(false);
    }, RING_FADE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [marked]);

  return (
    <span
      className={dayStatusRingVariants({
        // NOTE: DayPicker leaves a modifier out when it is false, so a missing
        // `predicted` means a logged day, not an unknown one
        predicted: !!modifiers.predicted,
        ovulation: !!modifiers.ovulation,
        menstrual: !!modifiers.menstrual || leaving,
        shown: marked,
      })}
    ></span>
  );
};

const dayButtonVariants = cva(
  "flex relative h-full w-full items-center justify-center select-none min-h-0 p-0 text-base-primary transition-colors duration-150",
  {
    variants: {
      today: {
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
        today: true,
        class: "text-base-primary-inverse",
      },
    ],
  },
);

type DayButtonProps = VariantProps<typeof dayButtonVariants> &
  DayButtonPrimitiveProps;

export const DayButton = ({
  day,
  modifiers,
  className,
  onClick,
  ...props
}: DayButtonProps) => {
  const { onHold, onChange, editing } = useContext(DayHoldContext);
  const hold = useHold(
    () => {
      onHold(day.date);
    },
    (holding) => {
      // NOTE: Only starting edit mode shows progress, a hold in edit mode
      // adds or removes a period at once
      onChange(holding && !editing);
    },
    editing ? PAINT_HOLD_MS : HOLD_MS,
  );

  return (
    <ButtonPrimitive
      {...props}
      {...hold.handlers}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        // NOTE: A hold ends with a click too, which must not count as a tap
        if (hold.consumeClick()) {
          return;
        }
        onClick?.(event);
      }}
      className={cn(
        "rounded-[40%] text-sm md:text-base lg:text-xl",
        // NOTE: DayPicker marks the tapped day as selected, the Calendar shows
        // its own marks instead, so `selected` is left out
        dayButtonVariants({
          today: modifiers.today,
          outside: modifiers.outside,
        }),
        defaultClassNames.day,
        className,
      )}
    >
      {day.date.getDate()}
      <DayStatusRing modifiers={modifiers} />
    </ButtonPrimitive>
  );
};
