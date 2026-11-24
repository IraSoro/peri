import { useState } from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { LazyMount } from "@/components/ui/LazyMount";
import { Button } from "@/components/ui/Button";
import { defineInternalApp } from "@/lib/sdk/app/api";
import { toLocalDate } from "@/lib/sdk/calculations/dates";
import { CalendarFooter } from "./components/CalendarFooter";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarSlide } from "./components/CalendarSlide";
import { EditBorder } from "./components/EditBorder";
import { useCalendarEdit } from "./hooks/useCalendarEdit";
import { useCalendarModifiers } from "./hooks/useCalendarModifiers";
import { HOLD_MS, HOLD_SHOW_MS } from "./hooks/useHold";
import { useMonthCarousel } from "./hooks/useMonthCarousel";
import { usePeriodStart } from "./hooks/usePeriodStart";
import { useStroke } from "./hooks/useStroke";
import { manifest } from "./manifest";
import { useWeekStart } from "./settings";

export const CalendarApp = () => {
  const [holding, setHolding] = useState(false);

  const direction = useDirection();
  const [weekStart] = useWeekStart();
  const editor = useCalendarEdit();
  const modifiers = useCalendarModifiers(editor.periods, editor.editing);
  const carousel = useMonthCarousel(direction === "rtl" ? "rtl" : "ltr");
  const periodStart = usePeriodStart(editor.periods, editor.editing);
  const startStroke = useStroke();

  const onDayHold = (date: Date) => {
    if (!editor.editing) {
      editor.hold();
      return;
    }
    const mode = editor.beginPaint(date);
    if (mode === null) {
      return;
    }
    const anchor = toLocalDate(date);
    // NOTE: A fast finger skips days and a finger may go back, so the whole
    // range from where the stroke began is painted again
    startStroke(anchor, (day) => {
      editor.paintTo(anchor, day, mode);
    });
  };

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="border-base-ternary relative flex aspect-square flex-col rounded-xl border-2 p-2 md:rounded-2xl md:border-3 md:p-4">
        <EditBorder
          drawn={editor.editing || holding}
          drawMs={HOLD_MS - HOLD_SHOW_MS}
        />
        <CalendarHeader
          dir={direction}
          month={carousel.months[carousel.activeIndex]}
          weekStartsOn={weekStart}
          canScrollPrev={carousel.canScrollPrev}
          canScrollNext={carousel.canScrollNext}
          onScrollPrev={carousel.scrollPrev}
          onScrollNext={carousel.scrollNext}
        />
        <div
          ref={carousel.emblaRef}
          className="min-h-0 flex-1 touch-pan-y overflow-hidden"
        >
          <div className="flex h-full">
            {carousel.months.map((month, index) => {
              const distance = Math.abs(index - carousel.activeIndex);
              return (
                <div
                  key={month.toISOString()}
                  className="h-full min-w-0 shrink-0 grow-0 basis-full"
                >
                  {distance <= 1 ? (
                    <LazyMount isActive={distance === 0}>
                      <CalendarSlide
                        month={month}
                        modifiers={modifiers}
                        weekStartsOn={weekStart}
                        onDayClick={editor.tap}
                        onDayHold={onDayHold}
                        onDayHoldChange={setHolding}
                        editing={editor.editing}
                      />
                    </LazyMount>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <CalendarFooter
          editing={editor.editing}
          canUndo={editor.canUndo}
          onUndo={editor.undo}
          onMarkToday={() => {
            void editor.markToday(periodStart.predictedLength());
          }}
          onToday={carousel.goToToday}
          canMarkToday={periodStart.canMarkToday}
          todayShown={carousel.todayShown}
        />
      </div>
      {editor.editing ? (
        <div className="flex justify-end gap-2 ps-3 pe-3 md:ps-5 md:pe-5">
          <Button disabled={editor.saving} onClick={editor.discard}>
            Discard
          </Button>
          <Button
            variant="contained"
            disabled={editor.saving}
            onClick={() => {
              void editor.save();
            }}
          >
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
};

void defineInternalApp(manifest, {
  component: CalendarApp,
});
