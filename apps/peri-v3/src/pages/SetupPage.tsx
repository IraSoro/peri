import { PageLayout } from "@/components/layouts/PageLayout";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { Logo } from "@/components/ui/Logo";
import { Typography } from "@/components/ui/Typography";

export const SetupPage = () => {
  return (
    <PageLayout>
      <Logo size={7} />
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
