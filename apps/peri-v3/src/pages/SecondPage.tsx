import { PageLayout } from "@/components/layouts/PageLayout";
import { CycleInfoWidget } from "@/components/widgets/CycleInfoWidget";
import { PhaseInfoWidget } from "@/components/widgets/PhaseInfoWidget";

export const SecondPage = () => {
  return (
    <PageLayout>
      <PhaseInfoWidget />
      <CycleInfoWidget />
    </PageLayout>
  );
};
