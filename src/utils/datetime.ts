import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import en from "dayjs/locale/en";
import ru from "dayjs/locale/ru";

import { storage } from "../data/Storage";

const locales = new Map([
  ["en", en],
  ["ru", ru],
]);

const defaultLocale = "en";

export async function init() {
  dayjs.extend(isSameOrBefore);

  const appLanguage = await storage.get.language();

  if (!locales.has(appLanguage)) {
    dayjs.locale(defaultLocale);
    console.log(
      `Application language ${appLanguage} is not supported now by datetime, set default ${defaultLocale}`,
    );
    return;
  }
  dayjs.locale(appLanguage);
  console.log(`Datetime locale is ${dayjs.locale()}`);
}

export function changeDateTimeLocale(language: string) {
  dayjs.locale(language);
}
