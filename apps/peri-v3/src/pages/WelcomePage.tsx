import { PageLayout } from "@/components/layouts/PageLayout";
import periLookup from "@/assets/peri-lookup.webp";

export const WelcomePage = () => {
  return (
    <PageLayout alignment="center" gap="none">
      <div className="peri-gradient-linear bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
        Welcome to
      </div>
      <img src={periLookup} alt="Peri lookup" className="h-45 md:h-60" />
    </PageLayout>
  );
};
