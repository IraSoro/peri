import { it, expect, vi } from "vitest";
import i18n from "i18next";
import { changeTranslation, getCurrentTranslation } from "../utils/translation";

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
