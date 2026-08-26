import { PageLayout } from "@/components/layouts/PageLayout";
import { usePager } from "@/components/layouts/PagerProvider";
import { useFooterLoader } from "@/components/layouts/Footer";
import { Logo } from "@/components/ui/Logo";

export const InitializationPage = () => {
  const { activePageId } = usePager();
  useFooterLoader(activePageId === "initialization" ? "Initialization" : null);

  return (
    <PageLayout justify="center">
      <Logo size={5} />
    </PageLayout>
  );
};
