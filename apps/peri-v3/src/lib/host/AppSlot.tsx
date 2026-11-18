import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/Button";
import { useAlertsContext } from "@/components/layouts/Alerts";
import { Typography } from "@/components/ui/Typography";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import { AppContext } from "@/lib/sdk/app/context";
import { service as apps } from "@/services/apps/service";
import { NoDataError, PermissionError } from "@/lib/sdk/app/errors";

/** What to paste to the developers: the app, the message and the stack */
const describe = (id: string, error: unknown): string => {
  const message =
    error instanceof PermissionError
      ? `"${id}" needs the "${error.permission}" permission, add it to the permissions of its manifest`
      : `"${id}" failed to render: ${error instanceof Error ? error.message : String(error)}`;
  return error instanceof Error && error.stack
    ? `${message}\n\n${error.stack}`
    : message;
};

interface Props {
  id: string;
}

/**
 * Renders a registered app by id with its access and an error boundary, so a
 * broken app does not take the screen down and retries when the data changes.
 * An app that throws NoDataError gets the empty state, a failed one the error
 * state. An app with no code gets a placeholder, it is never unregistered because that would delete its data
 */
export const AppSlot = ({ id }: Props) => {
  const manifest = useStoreSelector((config) => {
    return config.apps.find((app) => {
      return app.manifest.id === id;
    })?.manifest;
  });
  // Any change of the data lets a failed app try again, it may have failed
  // only because the data it needs was not there yet
  const revision = useStoreSelector((config) => {
    return config.revision;
  });
  const Component = apps.get(id)?.component;
  return (
    <div className="flex w-full shrink-0 scrollbar-none flex-col overflow-y-auto">
      {Component && manifest ? (
        <ErrorBoundary
          resetKeys={[revision]}
          fallbackRender={({ error }) => {
            if (error instanceof NoDataError) {
              return (
                <NoDataFallback
                  title={manifest.name}
                  description={error.message}
                />
              );
            }
            return (
              <ErrorFallback
                title={manifest.name}
                details={describe(id, error)}
              />
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

const FallbackCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className="border-base-ternary flex w-full flex-col gap-4 rounded-xl border-2 p-4 md:gap-6 md:border-3 md:p-6">
      <Typography size={4} weight="bold">
        {title}
      </Typography>
      <div className="flex flex-col items-center gap-3 text-center md:gap-4">
        {children}
      </div>
    </div>
  );
};

const NoDataFallback = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <FallbackCard title={title}>
      <div className="flex max-w-64 flex-col gap-1 md:max-w-80">
        <Typography size={2} weight="bold">
          Nothing here yet
        </Typography>
        <Typography size={1} color="secondary">
          {description}
        </Typography>
      </div>
    </FallbackCard>
  );
};

const copyWithSelection = (text: string): boolean => {
  const field = document.createElement("textarea");
  field.value = text;
  field.style.cssText =
    "position:fixed;top:0;left:-9999px;font-size:16px;opacity:0";
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, text.length);
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
};

const ErrorFallback = ({
  title,
  details,
}: {
  title: string;
  details: string;
}) => {
  const { showAlert } = useAlertsContext();
  const copy = () => {
    // The clipboard API exists only on secure pages, a dev server opened by
    // IP address on a phone is not one. Then the old way has to do
    const done =
      window.isSecureContext && navigator.clipboard
        ? navigator.clipboard.writeText(details).then(
            () => {
              return true;
            },
            () => {
              return copyWithSelection(details);
            },
          )
        : Promise.resolve(copyWithSelection(details));
    void done.then((ok) => {
      if (ok) {
        showAlert({
          type: "success",
          title: "Copied",
          message: "The details are in your clipboard.",
        });
      }
    });
  };
  return (
    <FallbackCard title={title}>
      <div className="flex max-w-64 flex-col gap-1 md:max-w-80">
        <Typography size={2} weight="bold">
          Something went wrong
        </Typography>
        <Typography size={1} color="secondary">
          This app couldn't load. Other apps are not affected.
        </Typography>
      </div>
      <Button size="sm" variant="contained" onClick={copy}>
        Copy details
      </Button>
    </FallbackCard>
  );
};
