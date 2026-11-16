import { PageLayout } from "@/components/layouts/PageLayout";
import { App } from "@/lib/host/App";

export const SecondPage = () => {
  return (
    <PageLayout>
      <App id="com.peri.phase_info" />
      <App id="com.peri.cycle_info" />
    </PageLayout>
  );
};
