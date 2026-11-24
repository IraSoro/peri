import { CircleQuestionMark, Settings, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/IconButton";
import { Typography } from "@/components/ui/Typography";
import { WEEK_STARTS, useWeekStart } from "../settings";

const VIEW_HELP = [
  {
    title: "Start editing",
    text: "Press and hold a day for a moment. A border draws around the calendar and the calendar switches to edit mode.",
  },
  {
    title: "Log period start",
    text: "When your period is expected, a button logs it from today for as many days as the prediction has.",
  },
  {
    title: "Colors",
    text: "A filled circle is a logged period day, a hollow one is a predicted day. Blue is ovulation.",
  },
];

const EDIT_HELP = [
  {
    title: "Mark or clear one day",
    text: "Tap a day to mark it as a period day, tap a marked day to take it off. A period that is cut in the middle becomes two periods.",
  },
  {
    title: "Mark or clear many days",
    text: "Press and hold a day, then move your finger over the days. If the first day was empty they are marked, if it was marked they are cleared. Days you skip by moving fast are included.",
  },
  {
    title: "Undo",
    text: "The undo button takes back the last change. It shows up once there is something to undo.",
  },
  {
    title: "Save or discard",
    text: "Save keeps your changes, Discard throws them away. Until then every period day is shown as a hollow circle.",
  },
];

const CalendarHelp = ({ editing }: { editing: boolean }) => {
  const help = editing ? EDIT_HELP : VIEW_HELP;
  return (
    <Dialog>
      <DialogTrigger
        render={
          <IconButton size="md" color="secondary" aria-label="Help">
            <CircleQuestionMark />
          </IconButton>
        }
      />
      <DialogContent>
        <DialogHeader title={editing ? "Editing periods" : "Calendar"} />
        <div className="flex flex-col gap-4 overflow-y-auto p-4 md:gap-6 md:p-6">
          {help.map((item) => {
            return (
              <div key={item.title} className="flex flex-col gap-1">
                <Typography size={3} weight="bold">
                  {item.title}
                </Typography>
                <Typography size={2} color="secondary">
                  {item.text}
                </Typography>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CalendarSettings = () => {
  const [weekStart, setWeekStart] = useWeekStart();
  return (
    <Dialog>
      <DialogTrigger
        render={
          <IconButton size="md" color="secondary" aria-label="Settings">
            <Settings />
          </IconButton>
        }
      />
      <DialogContent>
        <DialogHeader title="Settings" />
        <div className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
          <Typography size={3} color="secondary">
            The week starts on
          </Typography>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {WEEK_STARTS.map((start) => {
              return (
                <Button
                  key={start.value}
                  size="sm"
                  variant={start.value === weekStart ? "contained" : "outlined"}
                  aria-pressed={start.value === weekStart}
                  onClick={() => {
                    setWeekStart(start.value);
                  }}
                >
                  {start.label}
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type CalendarFooterProps = {
  editing: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onMarkToday: () => void;
  onToday: () => void;
  /** Today is a predicted period day that is not logged yet */
  canMarkToday: boolean;
  /** The month of today is the one on screen */
  todayShown: boolean;
};

export const CalendarFooter = ({
  editing,
  canUndo,
  onUndo,
  onMarkToday,
  onToday,
  canMarkToday,
  todayShown,
}: CalendarFooterProps) => {
  const showUndo = editing && canUndo;
  const showButtons = canMarkToday || !todayShown;
  return (
    <div className="flex flex-col gap-3 p-2 md:gap-4 md:p-3">
      {showButtons ? (
        <div className="flex gap-2 md:gap-4">
          {canMarkToday ? (
            <Button
              size="sm"
              variant="outlined"
              color="menstrual"
              onClick={onMarkToday}
            >
              Log period start
            </Button>
          ) : null}
          {todayShown ? null : (
            <Button size="sm" variant="outlined" onClick={onToday}>
              Today
            </Button>
          )}
        </div>
      ) : null}
      <div className="flex justify-end gap-2 md:gap-4">
        {showUndo ? (
          <IconButton
            size="md"
            color="secondary"
            aria-label="Undo"
            onClick={onUndo}
          >
            <Undo2 />
          </IconButton>
        ) : null}
        <CalendarHelp editing={editing} />
        <CalendarSettings />
      </div>
    </div>
  );
};
