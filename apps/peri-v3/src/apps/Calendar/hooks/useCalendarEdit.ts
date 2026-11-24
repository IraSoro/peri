import { useMemo, useRef, useState } from "react";
import { Temporal } from "temporal-polyfill";
import { useShowFooterLoader } from "@/lib/host/hooks";
import { useAlert, useCycles } from "@/lib/sdk/app/hooks";
import { toLocalDate, toLocalMidnight } from "@/lib/sdk/calculations/dates";
import {
  containsDay,
  markDay,
  tapDay,
  unmarkDay,
  type Period,
} from "../periods";

type PaintMode = "add" | "remove";

/**
 * View mode shows the logged periods. Edit mode works on a draft of them
 * (`draft` is null in view mode) that `save` writes back and `discard` drops
 */
export const useCalendarEdit = () => {
  const [cycles, updateCycles] = useCycles();
  const alert = useAlert();
  const [draft, setDraft] = useState<Period[] | null>(null);
  // The drafts before each change, the last one is what undo goes back to
  const [history, setHistory] = useState<Period[][]>([]);
  const [saving, setSaving] = useState(false);
  // The draft as it was when the stroke began, every move repaints from it
  const strokeBase = useRef<Period[]>([]);
  useShowFooterLoader(saving, "Saving");

  const periods = useMemo(() => {
    return cycles.map((cycle) => {
      return {
        start: toLocalDate(cycle.start_date),
        length: cycle.period_length,
      };
    });
  }, [cycles]);

  const edit = () => {
    setDraft(periods);
    setHistory([]);
  };

  const discard = () => {
    setDraft(null);
    setHistory([]);
  };

  const change = (next: Period[]) => {
    if (draft !== null) {
      setHistory([...history, draft]);
    }
    setDraft(next);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (previous === undefined) {
      return;
    }
    setDraft(previous);
    setHistory(history.slice(0, -1));
  };

  // A tap marks a single day or takes it off
  const tap = (date: Date) => {
    if (draft === null) {
      return;
    }
    change(tapDay(draft, toLocalDate(date)));
  };

  // A hold in view mode starts editing
  const hold = () => {
    if (draft === null) {
      edit();
    }
  };

  // A hold in edit mode starts a stroke: the held day is marked, or taken out
  // when it was marked, and so is every day the finger moves over after it
  const beginPaint = (date: Date): PaintMode | null => {
    if (draft === null) {
      return null;
    }
    const day = toLocalDate(date);
    const mode = containsDay(draft, day) ? "remove" : "add";
    strokeBase.current = draft;
    change(mode === "add" ? markDay(draft, day) : unmarkDay(draft, day));
    return mode;
  };

  // The days from where the stroke began to where the finger is now get the
  // mode, in either direction. Moving back toward the start gives the days
  // the finger left their old state again
  const paintTo = (
    from: Temporal.PlainDate,
    to: Temporal.PlainDate,
    mode: PaintMode,
  ) => {
    const step = Temporal.PlainDate.compare(to, from) >= 0 ? 1 : -1;
    const days = Math.abs(to.since(from, { largestUnit: "days" }).days);
    let next = strokeBase.current;
    for (let index = 0; index <= days; index++) {
      const day = from.add({ days: index * step });
      next = mode === "add" ? markDay(next, day) : unmarkDay(next, day);
    }
    setDraft((prev) => {
      return prev === null ? prev : next;
    });
  };

  // Writes the periods to the cycles, true when it worked
  const persist = async (next: Period[]) => {
    setSaving(true);
    const res = await updateCycles(() => {
      return next.map((period) => {
        // NOTE: A period that was not touched keeps its stored timestamp, a
        // new one is saved as the moment its local day begins
        const logged = cycles.find((cycle) => {
          return toLocalDate(cycle.start_date).equals(period.start);
        });
        return {
          start_date: logged?.start_date ?? toLocalMidnight(period.start),
          period_length: period.length,
        };
      });
    });
    setSaving(false);
    if (!res.ok) {
      alert.show({
        type: "error",
        title: "Can't save",
        message: res.error.message,
      });
    }
    return res.ok;
  };

  // Logs a period that starts today, without going through edit mode
  const markToday = async (length: number) => {
    let next = periods;
    const today = Temporal.Now.plainDateISO();
    for (let index = 0; index < length; index++) {
      next = markDay(next, today.add({ days: index }));
    }
    await persist(next);
  };

  const save = async () => {
    if (draft === null) {
      return;
    }
    if (await persist(draft)) {
      setDraft(null);
      setHistory([]);
    }
  };

  return {
    periods: draft ?? periods,
    editing: draft !== null,
    saving,
    discard,
    tap,
    hold,
    beginPaint,
    markToday,
    paintTo,
    canUndo: history.length > 0,
    undo,
    save,
  };
};
