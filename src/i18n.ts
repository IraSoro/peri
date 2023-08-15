import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import intervalPlural from "i18next-intervalplural-postprocessor";

import ru from "./translations/ru";
import { storage } from "./data/Storage";

const resources = {
  ru: {
    translation: ru,
  },
};

i18n
  .use(initReactI18next)
  .use(intervalPlural)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    storage.set.language("en").catch((err) => console.error(err));
  })
  .catch((err) => console.error(err));

export default i18n;
