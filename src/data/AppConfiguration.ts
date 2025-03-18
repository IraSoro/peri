import { isPlatform } from "@ionic/core";

function isPlatformAndroid() {
  return (
    isPlatform("android") &&
    isPlatform("mobile") &&
    !isPlatform("mobileweb") &&
    !isPlatform("pwa")
  );
}

export const configuration = {
  app: {
    version: import.meta.env.VITE_APP_VERSION || "",
  },
  features: {
    useCustomVersionUpdate:
      import.meta.env.VITE_FEATURE_USE_CUSTOM_VERSION_UPDATE === "true",
    demoMode: import.meta.env.VITE_FEATURE_DEMO_MODE === "true",
    betaLanguages: import.meta.env.VITE_FEATURE_BETA_LANGUAGES === "true",
    notifications:
      isPlatformAndroid() &&
      import.meta.env.VITE_FEATURE_NOTIFICATIONS === "true",
  },
};
