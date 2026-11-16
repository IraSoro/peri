import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Typography } from "@/components/ui/Typography";
import { useStoreSelector } from "@/lib/hooks/useStoreSelector";
import { service as apps } from "@/services/apps/service";

interface Props {
  id: string;
}

/**
 * Renders a registered app by id, already wrapped by its API. An app with
 * no registered code gets a placeholder, it is never unregistered because
 * that would delete its data. It re-renders on store changes, so an app
 * registered later or replaced on hot reload shows up
 */
export const App = ({ id }: Props) => {
  useStoreSelector((config) => {
    return config.apps;
  });
  const entry = apps.get(id);
  if (!entry) {
    return (
      <WidgetLayout>
        <Typography size={3} color="secondary">
          {`"${id}" is not installed`}
        </Typography>
      </WidgetLayout>
    );
  }
  const Component = entry.component;
  return <Component />;
};
