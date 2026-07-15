import { PageLayout } from "@/components/layouts/PageLayout";
import periLookup from "@/assets/peri-lookup.webp";

export const SetupPage = () => {
  return (
    <PageLayout>
      <img src={periLookup} alt="Peri lookup" className="h-37 md:h-45" />
      <div className="flex flex-col items-center gap-2">
        <div className="text-base-secondary max-w-[80%] text-center align-middle text-2xl font-bold md:text-3xl">
          {"Let's mark the day of your last period:"}
        </div>
        <div>{/* TODO: Calendar */}</div>
      </div>
    </PageLayout>
  );
};
