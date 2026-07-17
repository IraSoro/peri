import { PageLayout } from "@/components/layouts/PageLayout";
import periLookup from "@/assets/peri-lookup.webp";

export const InitializationPage = () => {
  return (
    <PageLayout justify="center" gap="none">
      <img src={periLookup} alt="Peri lookup" className="h-60" />
    </PageLayout>
  );
};
