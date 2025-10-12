import { format as dateFnsFormat } from "date-fns";
import {
  enUS,
  ru,
  es,
  de,
  faIR,
  fr,
  hi,
  fi,
  id,
  gu,
  vi,
  ta,
  ptBR,
  zhCN,
  pl,
} from "date-fns/locale";

import { storage } from "../data/Storage";

const locales = new Map([
  ["en", enUS],
  ["ru", ru],
  ["es", es],
  ["tl", enUS],
  ["de", de],
  ["hi", hi],
  ["hg", enUS],
  ["fa", faIR],
  ["fr", fr],
  ["fi", fi],
  ["id", id],
  ["gu", gu],
  ["vi", vi],
  ["ta", ta],
  ["pt", ptBR],
  ["zh", zhCN],
  ["pl", pl],
]);

const defaultLocale = "en";
let currentLocale = defaultLocale;

export async function init() {
  const appLanguage = await storage.get.language();

  if (!locales.has(appLanguage)) {
    console.log(
      `Application language ${appLanguage} is not supported now by datetime, set default ${defaultLocale}`,
    );
    return;
  }

  currentLocale = appLanguage;
  console.log(`Set datetime locale ${currentLocale}`);
}

export function changeDateTimeLocale(language: string) {
  if (!locales.has(language)) {
    console.warn(`Language ${language} is not supported yet`);
    return;
  }
  currentLocale = language;
}

function modifyFormatString(formatString: string) {
  if (formatString === "MMMM d" && ["ru"].includes(currentLocale)) {
    return "d MMMM";
  }
  return formatString;
}

export function format(date: Date, formatString: string) {
  formatString = modifyFormatString(formatString);

  return dateFnsFormat(date, formatString, {
    locale: locales.get(currentLocale),
  });
}
