import { manifest as phaseInfoAppManifest } from "@/apps/PhaseInfo/manifest";
import { manifest as cycleInfoAppManifest } from "@/apps/CycleInfo/manifest";
import { PageLayout } from "@/components/layouts/PageLayout";
import { AppSlot } from "@/lib/host/AppSlot";

export const SecondPage = () => {
  return (
    <PageLayout>
      <AppSlot id={phaseInfoAppManifest.id} />
      <AppSlot id={cycleInfoAppManifest.id} />
    </PageLayout>
  );
};
