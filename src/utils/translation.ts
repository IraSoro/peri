import i18n, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import intervalPlural from "i18next-intervalplural-postprocessor";

import en from "./translations/en";
import ru from "./translations/ru";
import es from "./translations/es";
import tl from "./translations/tl";
import de from "./translations/de";
import hi from "./translations/hi";
import hg from "./translations/hg";
import fr from "./translations/fr";
import fi from "./translations/fi";
import id from "./translations/id";
import gu from "./translations/gu";
import vi from "./translations/vi";
import ta from "./translations/ta";

import { storage } from "../data/Storage";
import { configuration } from "../data/AppConfiguration";

export const supportedLanguages = new Map<string, string>([
  ["fr", "français"],
  ["de", "deutsch"],
  ["es", "español"],
  ["fi", "suomi"],
  ["hi", "हिन्दी"],
  ["en", "english"],
  ["ru", "русский"],
  ...(configuration.features.moreLanguages
    ? ([
        ["id", "bahasa indonesia"],
        ["gu", "ગુજરાતી"],
        ["hg", "hinglish"],
        ["tl", "tagalog"],
        ["ta", "தமிழ்"],
        ["vi", "tiếng Việt"],
      ] as const)
    : []),
]);

const defaultLanguageCode = "en";
let currentLanguage = defaultLanguageCode;

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
        es: {
          translation: es,
        },
        tl: {
          translation: tl,
        },
        de: {
          translation: de,
        },
        hi: {
          translation: hi,
        },
        hg: {
          translation: hg,
        },
        fr: {
          translation: fr,
        },
        fi: {
          translation: fi,
        },
        id: {
          translation: id,
        },
        gu: {
          translation: gu,
        },
        vi: {
          translation: vi,
        },
        ta: {
          translation: ta,
        },
      },
      lng: (await storage.getUnsafe.language()) || navigator.language,
      fallbackLng: {
        ru: ["ru"],
        es: ["es"],
        tl: ["tl"],
        de: ["de"],
        hi: ["hi"],
        hg: ["hg"],
        fr: ["fr"],
        fi: ["fi"],
        id: ["id"],
        gu: ["gu"],
        vi: ["vi"],
        ta: ["ta"],
        default: [defaultLanguageCode],
      },
    } satisfies InitOptions);

  const appLanguage = i18n.languages.at(-1);

  if (!appLanguage) {
    throw new Error("Can't get language from i18next");
  }

  currentLanguage = appLanguage;
  await storage.set.language(appLanguage);

  console.log(`App language is ${appLanguage}`);
}

export function changeTranslation(language: string) {
  if (!supportedLanguages.has(language)) {
    console.warn(`Language ${language} is not supported yet`);
    return;
  }
  currentLanguage = language;
  return i18n.changeLanguage(language);
}

export function getCurrentTranslation(): string {
  return currentLanguage;
}
