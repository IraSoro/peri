import { ErrorBoundary } from "react-error-boundary";
import { Typography } from "@/components/ui/Typography";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import { AppContext } from "@/lib/sdk/app/context";
import { service as apps } from "@/services/apps/service";
import { PermissionError } from "@/lib/sdk/app/errors";

interface Props {
  id: string;
}

/**
 * Renders a registered app by id with its access and an error boundary, so a
 * broken app does not take the screen down. An app with no code gets a
 * placeholder, it is never unregistered because that would delete its data
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
        <ErrorBoundary
          fallbackRender={({ error }) => {
            const reason =
              error instanceof Error ? error.message : String(error);
            return (
              <Typography size={3} color="secondary">
                {error instanceof PermissionError
                  ? `"${id}" needs the "${error.permission}" permission, add it to the permissions of its manifest`
                  : `"${id}" failed to render: ${reason}`}
              </Typography>
            );
          }}
        >
          <AppContext.Provider
            value={{
              source: manifest.source,
              permissions: manifest.permissions,
            }}
          >
            <Component />
          </AppContext.Provider>
        </ErrorBoundary>
      ) : (
        <Typography size={3} color="secondary">
          {`"${id}" is not installed`}
        </Typography>
      )}
    </div>
  );
};
