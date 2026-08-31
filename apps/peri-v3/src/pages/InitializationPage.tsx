import { PageLayout } from "@/components/layouts/PageLayout";
import { usePager } from "@/components/layouts/PagerProvider";
import { useFooterLoader } from "@/components/layouts/Footer";
import { useHeaderMenuButton } from "@/components/layouts/Header";
import { Logo } from "@/components/ui/Logo";

export const InitializationPage = () => {
  const { activePageId } = usePager();
  useFooterLoader(activePageId === "initialization" ? "Initialization" : null);
  useHeaderMenuButton(activePageId === "initialization" ? false : null);

  return (
    <PageLayout justify="center">
      <Logo size={5} />
    </PageLayout>
  );
};
