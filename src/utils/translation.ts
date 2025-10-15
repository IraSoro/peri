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
import hu from "./translations/hu";
import fr from "./translations/fr";
import fi from "./translations/fi";
import id from "./translations/id";
import gu from "./translations/gu";
import vi from "./translations/vi";
import ta from "./translations/ta";
import fa from "./translations/fa";
import pt from "./translations/pt";
import ar from "./translations/ar";
import zh from "./translations/zh";
import te from "./translations/te";
import pl from "./translations/pl";

import { storage } from "../data/Storage";
import { configuration } from "../data/AppConfiguration";

export const supportedLanguages = new Map<string, string>([
  ["en", "english"],
  ["de", "deutsch"],
  ["es", "español"],
  ["fi", "suomi"],
  ["fr", "français"],
  ["hi", "हिन्दी"],
  ["ru", "русский"],
  ["pt", "português"],
  ["ar", "العربية"],
  ["pl", "polski"],
  ...(configuration.features.betaLanguages
    ? ([
        ["gu", "ગુજરાતી (β)"],
        ["hg", "hinglish (β)"],
        ["hu", "hungarian (β)"],
        ["id", "bahasa indonesia (β)"],
        ["ta", "தமிழ் (β)"],
        ["fa", "پارسی (β)"],
        ["tl", "tagalog (β)"],
        ["vi", "tiếng Việt (β)"],
        ["zh", "中文 (β)"],
        ["te", "తెలుగు (β)"],
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
        hu: {
          translation: hu,
        },
        fa: {
          translation: fa,
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
        pt: {
          translation: pt,
        },
        ar: {
          translation: ar,
        },
        zh: {
          translation: zh,
        },
        te: {
          translation: te,
        },
        pl: {
          translation: pl,
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
        fa: ["fa"],
        fr: ["fr"],
        fi: ["fi"],
        id: ["id"],
        gu: ["gu"],
        hu: ["hu"],
        vi: ["vi"],
        ta: ["ta"],
        pt: ["pt"],
        ar: ["ar"],
        zh: ["zh"],
        te: ["te"],
        pl: ["pl"],
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
