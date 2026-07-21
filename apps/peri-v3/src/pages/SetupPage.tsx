import { PageLayout } from "@/components/layouts/PageLayout";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import periLookup from "@/assets/peri-lookup.webp";

export const SetupPage = () => {
  return (
    <PageLayout>
      <img src={periLookup} alt="Peri lookup" className="h-45" />
      <div className="text-base-secondary text-center text-3xl font-bold whitespace-pre-line">
        {"Let's mark the day of your\nlast period:"}
      </div>
      <CalendarWidget />
    </PageLayout>
  );
};
