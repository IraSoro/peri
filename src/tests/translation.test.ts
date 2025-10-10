import { it, expect, vi } from "vitest";
import i18n from "i18next";
import { changeTranslation, getCurrentTranslation } from "../utils/translation";
import en from "../utils/translations/en";
import fr from "../utils/translations/fr";
import ru from "../utils/translations/ru";

// Initialize i18n for testing ordinal translations
i18n.init({
  lng: "en",
  resources: {
    en: {
      translation: en,
    },
    fr: {
      translation: fr,
    },
    ru: {
      translation: ru,
    },
  },
});

it("Change translation", async () => {
  // @ts-expect-error It doesn't matter what we return here
  vi.spyOn(i18n, "changeLanguage").mockResolvedValue({});

  await changeTranslation("en");
  expect(getCurrentTranslation()).toEqual("en");

  await changeTranslation("ru");
  expect(getCurrentTranslation()).toEqual("ru");

  await changeTranslation("some-unknown-lang-code");
  expect(getCurrentTranslation()).toEqual("ru");
});

it("Check ordinal day translations work correctly", () => {
  // Test that ordinal translations work with i18n.t
  expect(i18n.t("day", { count: 1, ordinal: true })).toBe("1st day");
  expect(i18n.t("day", { count: 2, ordinal: true })).toBe("2nd day");
  expect(i18n.t("day", { count: 3, ordinal: true })).toBe("3rd day");
  expect(i18n.t("day", { count: 24, ordinal: true })).toBe("24th day");
});
