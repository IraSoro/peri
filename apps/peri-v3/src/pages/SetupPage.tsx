import { PageLayout } from "@/components/layouts/PageLayout";
import { usePager } from "@/components/layouts/PagerProvider";
import { useHeaderMenuButton } from "@/components/layouts/Header";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { Typography } from "@/components/ui/Typography";

export const SetupPage = () => {
  const { activePageId } = usePager();
  useHeaderMenuButton(activePageId === "setup" ? false : null);

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
