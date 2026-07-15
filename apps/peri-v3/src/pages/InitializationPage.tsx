import { PageLayout } from "@/components/layouts/PageLayout";
import periLookup from "@/assets/peri-lookup.webp";

export const InitializationPage = () => {
  return (
    <PageLayout alignment="center" gap="none">
      <img src={periLookup} alt="Peri lookup" className="h-45 md:h-60" />
    </PageLayout>
  );
};
