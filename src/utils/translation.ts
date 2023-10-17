import i18n, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import intervalPlural from "i18next-intervalplural-postprocessor";

import en from "./translations/en";
import ru from "./translations/ru";
import { storage } from "../data/Storage";

export const supportedLanguages = new Map([
  ["en", "english"],
  ["ru", "русский"],
]);

const defaultLanguageCode = "en";

export async function init() {
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
      lng: (await storage.getUnsafe.language()) || navigator.language,
      fallbackLng: {
        ru: ["ru"],
        default: [defaultLanguageCode],
      },
    } satisfies InitOptions);

  const appLanguage = i18n.languages.at(-1);

  if (!appLanguage) {
    throw new Error("Can't get language from i18next");
  }

  await storage.set.language(appLanguage);

  console.log(`App language is ${appLanguage}`);
}

export function changeTranslation(language: string) {
  return i18n.changeLanguage(language);
}
