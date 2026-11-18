import { cva } from "class-variance-authority";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import { Typography } from "./Typography";

export type AlertType = "warning" | "error" | "info" | "success";

export type AlertAction = { label: string; onClick: () => void };

const alertVariants = cva("flex overflow-hidden rounded-lg", {
  variants: {
    type: {
      warning: "bg-warning-bg text-warning-primary",
      error: "bg-error-bg text-error-primary",
      info: "bg-info-bg text-info-primary",
      success: "bg-success-bg text-success-primary",
    },
  },
});

const barVariants = cva("w-1 shrink-0", {
  variants: {
    type: {
      warning: "bg-warning-primary",
      error: "bg-error-primary",
      info: "bg-info-primary",
      success: "bg-success-primary",
    },
  },
});

const icons = {
  warning: TriangleAlert,
  error: CircleX,
  info: Info,
  success: CircleCheck,
};

type AlertProps = {
  type: AlertType;
  title: string;
  message: string;
  actions?: AlertAction[];
};

export const Alert = ({ type, title, message, actions = [] }: AlertProps) => {
  const Icon = icons[type];
  return (
    <div
      role={type === "error" || type === "warning" ? "alert" : "status"}
      className={alertVariants({ type })}
    >
      <div className={barVariants({ type })} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-2.5 md:gap-2 md:p-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 shrink-0 md:size-5" />
          <Typography size={2} weight="bold" className="text-inherit">
            {title}
          </Typography>
        </div>
        <Typography size={1} className="text-inherit">
          {message}
        </Typography>
        {actions.length > 0 && (
          <div className="flex items-center justify-end gap-1">
            {actions.map((action, index) => {
              return (
                <Button
                  key={action.label}
                  size="sm"
                  className="ps-3 pe-3 pt-1 pb-1"
                  color={type}
                  variant={index === actions.length - 1 ? "contained" : "text"}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
