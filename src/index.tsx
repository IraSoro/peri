import React from "react";
import { createRoot } from "react-dom/client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import intervalPlural from "i18next-intervalplural-postprocessor";

import en from "./languages/en";
import ru from "./languages/ru";
import { storage } from "./data/Storage";

import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

async function initTranslation() {
  const selectedLanguage =
    (await storage.getUnsafe.language()) || navigator.language.split("-")[0];

  console.log(selectedLanguage);

  await i18n
    .use(initReactI18next)
    .use(intervalPlural)
    .init({
      resources: {
        en: {
          translation: en,
        },
        ru: {
          translation: ru,
        },
      },
      lng: selectedLanguage,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });

  await storage.set.language(selectedLanguage);
}

initTranslation()
  .then(() => {
    const container = document.getElementById("root");

    if (!container) {
      throw new Error("Can't find element in the document with id `root`");
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://cra.link/PWA
    serviceWorkerRegistration.unregister();

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
  })
  .catch((err) => console.error(err));
