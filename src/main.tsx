import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import { init as initTranslation } from "./utils/translation";
import { init as initDateTimeLocale } from "./utils/datetime";
import { migrateToTheNewStorage, storage } from "./data/Storage";

async function init() {
  await migrateToTheNewStorage();

  await initTranslation();
  await initDateTimeLocale();

  const container = document.getElementById("root");

  if (!container) {
    throw new Error("Can't find element in the document with id `root`");
  }

  // NOTE: We get a theme here to get rid of the blink due to React's
  //       lifecycle when the application starts.
  //       The theme is also controlled inside the `App` component
  let theme: string | undefined;
  try {
    theme = await storage.get.theme();
    const metaStatusBarColorAndroid = document.querySelector(
      "meta[name=theme-color]",
    );
    if (metaStatusBarColorAndroid) {
      metaStatusBarColorAndroid.setAttribute(
        "content",
        theme === "basic" ? "#eae7ff" : "#1f1f1f",
      );
    }
    const metaStatusBarColorIOS = document.querySelector(
      "meta[name=apple-mobile-web-app-status-bar-style]",
    );
    if (metaStatusBarColorIOS) {
      metaStatusBarColorIOS.setAttribute(
        "content",
        theme === "basic" ? "default" : "black",
      );
    }
  } catch (err) {
    console.error(`Can't get theme ${(err as Error).message}`);
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App theme={theme} />
    </React.StrictMode>,
  );
}

init().catch((err) => console.error(err));
