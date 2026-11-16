import { App } from "@/lib/host/App";
import { PageLayout } from "@/components/layouts/PageLayout";

export const FirstPage = () => {
  return (
    <PageLayout gap="xl">
      <App id="com.peri.period_status" />
      <App id="com.peri.calendar" />
    </PageLayout>
  );
};
