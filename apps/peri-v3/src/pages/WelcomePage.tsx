import { PageLayout } from "@/components/layouts/PageLayout";
import { usePager } from "@/components/layouts/PagerProvider";
import { useHeaderMenuButton } from "@/components/layouts/Header";
import { Typography } from "@/components/ui/Typography";
import { Logo } from "@/components/ui/Logo";

export const WelcomePage = () => {
  const { activePageId } = usePager();
  useHeaderMenuButton(activePageId === "welcome" ? false : null);

  return (
    <PageLayout justify="center" gap="none">
      <Typography size={9} weight="bold" color="gradient">
        Welcome to
      </Typography>
      <Logo variant="lockup" size={4} />
    </PageLayout>
  );
};
