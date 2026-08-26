import { PageLayout } from "@/components/layouts/PageLayout";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { PeriodStatusWidget } from "@/components/widgets/PeriodStatusWidget";

export const FirstPage = () => {
  return (
    <PageLayout gap="xl">
      <PeriodStatusWidget />
      <CalendarWidget />
    </PageLayout>
  );
};
