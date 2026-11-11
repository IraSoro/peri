import { PageLayout } from "@/components/layouts/PageLayout";
import { Logo } from "@/components/ui/Logo";
import {
  useActivePageId,
  useShowFooterLoader,
  useHideHeaderMenuButton,
} from "@/lib/host/hooks";

export const InitializationPage = () => {
  const activePageId = useActivePageId();
  useShowFooterLoader(activePageId === "initialization", "Initialization");
  useHideHeaderMenuButton(activePageId === "initialization");

  return (
    <PageLayout justify="center">
      <Logo size={5} />
    </PageLayout>
  );
};
