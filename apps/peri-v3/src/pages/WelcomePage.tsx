import { PageLayout } from "@/components/layouts/PageLayout";
import periLookup from "@/assets/peri-lookup.webp";

export const WelcomePage = () => {
  return (
    <PageLayout justify="center" gap="none">
      <div className="peri-gradient-linear bg-clip-text text-5xl font-bold text-transparent">
        Welcome to
      </div>
      <img src={periLookup} alt="Peri lookup" className="h-60" />
    </PageLayout>
  );
};
