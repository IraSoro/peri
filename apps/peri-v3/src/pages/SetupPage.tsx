import { PageLayout } from "@/components/layouts/PageLayout";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { Typography } from "@/components/ui/Typography";
import { useActivePageId, useHideHeaderMenuButton } from "@/lib/host/hooks";

export const SetupPage = () => {
  const activePageId = useActivePageId();
  useHideHeaderMenuButton(activePageId === "setup");

  return (
    <PageLayout justify="center">
      <Typography
        size={7}
        weight="bold"
        color="secondary"
        className="text-center whitespace-pre-line"
      >
        {"Let's mark the day of your\nlast period:"}
      </Typography>
      <CalendarWidget />
    </PageLayout>
  );
};
