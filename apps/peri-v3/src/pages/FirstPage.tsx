import { AppSlot } from "@/lib/host/AppSlot";
import { PageLayout } from "@/components/layouts/PageLayout";

export const FirstPage = () => {
  return (
    <PageLayout gap="xl">
      <AppSlot id="com.peri.period_status" />
      <AppSlot id="com.peri.calendar" />
    </PageLayout>
  );
};
