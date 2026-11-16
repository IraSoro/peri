import { Component } from "react";
import type { ReactNode } from "react";
import { Typography } from "@/components/ui/Typography";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import { AppContext } from "@/lib/sdk/app/context";
import { service as apps } from "@/services/apps/service";
import { PermissionError } from "@/lib/sdk/app/errors";

interface BoundaryProps {
  appId: string;
  children: ReactNode;
}

interface BoundaryState {
  error: unknown;
  failed: boolean;
}

/**
 * Keeps a broken app from taking the screen down. A class, because only a
 * class can catch render errors. Event handlers and async code are not caught
 */
class AppBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null, failed: false };

  static getDerivedStateFromError(error: unknown): BoundaryState {
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
      <Typography size={3} color="secondary">
        {message}
      </Typography>
    );
  }
}

interface Props {
  id: string;
}

/**
 * Renders a registered app by id with its access and an error boundary. An
 * app with no code gets a placeholder, it is never unregistered because that
 * would delete its data
 */
export const AppSlot = ({ id }: Props) => {
  const manifest = useStoreSelector((config) => {
    return config.apps.find((app) => {
      return app.manifest.id === id;
    })?.manifest;
  });
  const Component = apps.get(id)?.component;
  return (
    <div className="flex w-full shrink-0 scrollbar-none flex-col overflow-y-auto">
      {Component && manifest ? (
        <AppBoundary appId={id}>
          <AppContext.Provider
            value={{
              source: manifest.source,
              permissions: manifest.permissions,
            }}
          >
            <Component />
          </AppContext.Provider>
        </AppBoundary>
      ) : (
        <Typography size={3} color="secondary">
          {`"${id}" is not installed`}
        </Typography>
      )}
    </div>
  );
};
