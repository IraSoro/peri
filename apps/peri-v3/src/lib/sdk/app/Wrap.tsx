import { Component, createContext } from "react";
import type { ReactNode } from "react";
import { AppCard } from "@/components/layouts/AppCard";
import { Typography } from "@/components/ui/Typography";
import type { AppEntry } from "@/services/apps/types";
import { PermissionError } from "./errors";

export interface AppContextValue {
  source: "internal" | "community";
  permissions: readonly string[];
}

export const AppContext = createContext<AppContextValue | null>(null);

interface Props {
  appId: string;
  children: ReactNode;
}

interface State {
  error: unknown;
  failed: boolean;
}

/**
 * Keeps a broken app from taking the rest of the screen down. It is a
 * class because React can catch a render error only with the class lifecycle
 * `getDerivedStateFromError`, there is no hook for it. It catches errors
 * thrown while rendering, like a hook without its permission, but not errors
 * in event handlers or async code
 */
export class AppBoundary extends Component<Props, State> {
  state: State = { error: null, failed: false };

  static getDerivedStateFromError(error: unknown): State {
    return { error, failed: true };
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    const { error } = this.state;
    const id = this.props.appId;
    let message: string;
    if (error instanceof PermissionError) {
      message = `"${id}" needs the "${error.permission}" permission, add it to the permissions of its manifest`;
    } else {
      const reason = error instanceof Error ? error.message : String(error);
      message = `"${id}" failed to render: ${reason}`;
    }
    return (
      <AppCard gap="md">
        <Typography size={3} color="secondary">
          {message}
        </Typography>
      </AppCard>
    );
  }
}

/**
 * Puts the app inside its access and an error boundary, so hooks
 * can tell which app calls them and a failure stays inside the app
 */
export function wrapApp(
  id: string,
  entry: AppEntry,
  access: AppContextValue,
): AppEntry {
  const Inner = entry.component;
  return {
    ...entry,
    component() {
      return (
        <AppBoundary appId={id}>
          <AppContext.Provider value={access}>
            <Inner />
          </AppContext.Provider>
        </AppBoundary>
      );
    },
  };
}
