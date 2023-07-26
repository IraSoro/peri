import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en";
import ru from "./translations/ru";

const resources = {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((err) => console.error(err));

export default i18n;
