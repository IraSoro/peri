export const configuration = {
  app: {
    version: process.env.REACT_APP_APP_VERSION || "",
  },
  features: {
    useCustomVersionUpdate:
      process.env.REACT_APP_FEATURE_USE_CUSTOM_VERSION_UPDATE === "true",
    demoMode: process.env.REACT_APP_FEATURE_DEMO_MODE === "true",
    moreLanguages: process.env.REACT_APP_FEATURE_MORE_LANGUAGES === "true",
  },
};
