import { PageLayout } from "@/components/layouts/PageLayout";
import { Typography } from "@/components/ui/Typography";
import { Logo } from "@/components/ui/Logo";

export const WelcomePage = () => {
  return (
    <PageLayout justify="center" gap="none">
      <Typography size={9} weight="bold" color="gradient">
        Welcome to
      </Typography>
      <Logo variant="lockup" size={4} />
    </PageLayout>
  );
};
