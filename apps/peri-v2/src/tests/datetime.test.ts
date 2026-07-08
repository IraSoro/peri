import { it, expect } from "vitest";
import { format as dateFnsFormat } from "date-fns";
import { changeDateTimeLocale, format } from "../utils/datetime";
import { ru } from "date-fns/locale";

it("Show day before month on specific language", () => {
  changeDateTimeLocale("en");

  expect(format(new Date(), "MMMM d")).toEqual(
    dateFnsFormat(new Date(), "MMMM d"),
  );

  changeDateTimeLocale("ru");

  expect(format(new Date(), "MMMM d")).toEqual(
    dateFnsFormat(new Date(), "d MMMM", {
      locale: ru,
    }),
  );
});
