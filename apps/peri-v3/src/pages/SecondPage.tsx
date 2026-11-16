import { PageLayout } from "@/components/layouts/PageLayout";
import { AppSlot } from "@/lib/host/AppSlot";

export const SecondPage = () => {
  return (
    <PageLayout>
      <AppSlot id="com.peri.phase_info" />
      <AppSlot id="com.peri.cycle_info" />
    </PageLayout>
  );
};
