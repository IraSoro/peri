import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, type AlertAction, type AlertType } from "../ui/Alert";
import { OutsideProviderError } from "./errors";

/** How long an alert without actions stays, one with actions waits for a choice */
const ALERT_MS = 5000;

export type AlertInput = {
  type: AlertType;
  title: string;
  message: string;
  /** Pressing one also closes the alert */
  actions?: { label: string; onClick?: () => void }[];
};

type AlertEntry = AlertInput & { id: number };

type AlertsContextProps = {
  /** Newest first */
  alerts: AlertEntry[];
  showAlert: (alert: AlertInput) => number;
  dismissAlert: (id: number) => void;
};

const AlertsContext = createContext<AlertsContextProps | null>(null);

export function useAlertsContext() {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new OutsideProviderError("useAlertsContext", "AlertProvider");
  }

  return context;
}

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissAlert = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setAlerts((current) => {
      return current.filter((alert) => {
        return alert.id !== id;
      });
    });
  }, []);

  const showAlert = useCallback(
    (alert: AlertInput) => {
      const id = nextId.current++;
      setAlerts((current) => {
        return [{ ...alert, id }, ...current];
      });
      if (!alert.actions || alert.actions.length === 0) {
        timers.current.set(
          id,
          setTimeout(() => {
            dismissAlert(id);
          }, ALERT_MS),
        );
      }
      return id;
    },
    [dismissAlert],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const value = useMemo(
    () => ({ alerts, showAlert, dismissAlert }),
    [alerts, showAlert, dismissAlert],
  );

  return <AlertsContext value={value}>{children}</AlertsContext>;
};

export const AlertStack = () => {
  const { alerts, dismissAlert } = useAlertsContext();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex flex-col-reverse gap-2 px-3 md:bottom-14">
      {alerts.map((alert) => {
        const actions: AlertAction[] = (alert.actions ?? []).map((action) => {
          return {
            label: action.label,
            onClick: () => {
              action.onClick?.();
              dismissAlert(alert.id);
            },
          };
        });
        return (
          <div
            key={alert.id}
            className="animate-in fade-in slide-in-from-bottom-2 pointer-events-auto duration-200"
          >
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              actions={actions}
            />
          </div>
        );
      })}
    </div>
  );
};
