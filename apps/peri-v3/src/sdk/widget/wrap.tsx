import { Component, createContext } from "react";
import type { ReactNode } from "react";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Typography } from "@/components/ui/Typography";
import type { AppEntry } from "@/services/apps/types";
import { PermissionError } from "./errors";

export interface WidgetContextValue {
  source: "internal" | "community";
  permissions: readonly string[];
}

export const WidgetContext = createContext<WidgetContextValue | null>(null);

interface Props {
  widgetId: string;
  children: ReactNode;
}

interface State {
  error: unknown;
  failed: boolean;
}

/**
 * Keeps a broken widget from taking the rest of the screen down. It is a
 * class because React can catch a render error only with the class lifecycle
 * `getDerivedStateFromError`, there is no hook for it. It catches errors
 * thrown while rendering, like a hook without its permission, but not errors
 * in event handlers or async code
 */
export class WidgetBoundary extends Component<Props, State> {
  state: State = { error: null, failed: false };

  static getDerivedStateFromError(error: unknown): State {
    return { error, failed: true };
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    const { error } = this.state;
    const id = this.props.widgetId;
    let message: string;
    if (error instanceof PermissionError) {
      message = `"${id}" needs the "${error.permission}" permission, add it to the permissions of its manifest`;
    } else {
      const reason = error instanceof Error ? error.message : String(error);
      message = `"${id}" failed to render: ${reason}`;
    }
    return (
      <WidgetLayout gap="md">
        <Typography size={3} color="secondary">
          {message}
        </Typography>
      </WidgetLayout>
    );
  }
}

/**
 * Puts the widget inside its access and an error boundary, so hooks
 * can tell which widget calls them and a failure stays inside the widget
 */
export function wrapWidget(
  id: string,
  entry: AppEntry,
  access: WidgetContextValue,
): AppEntry {
  const Inner = entry.component;
  return {
    ...entry,
    component() {
      return (
        <WidgetBoundary widgetId={id}>
          <WidgetContext.Provider value={access}>
            <Inner />
          </WidgetContext.Provider>
        </WidgetBoundary>
      );
    },
  };
}
