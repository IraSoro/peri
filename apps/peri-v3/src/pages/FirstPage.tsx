import { manifest as calendarAppManifest } from "@/apps/Calendar/manifest";
import { manifest as periodStatusAppManifest } from "@/apps/PeriodStatus/manifest";
import { AppSlot } from "@/lib/host/AppSlot";
import { PageLayout } from "@/components/layouts/PageLayout";

export const FirstPage = () => {
  return (
    <PageLayout gap="xl">
      <AppSlot id={periodStatusAppManifest.id} />
      <AppSlot id={calendarAppManifest.id} />
    </PageLayout>
  );
};
