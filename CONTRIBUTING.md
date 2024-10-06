# Contributing

## Translations

We welcome contributions for translating our application into various languages. If you'd like to help with translations, please follow these steps.

### Steps

1. Look for the `./src/utils/translations` directory to find existing translations. If you didn't find the language you interested in then proceed to step 2.

2. Create a new file for the language by duplicating the `./src/utils/translations/ru.ts` file. Name it using the language code (e.g., `fr.ts` for French translations).

3. Translate the keys into your language. Remember to also change the language code in first the line:

   ```ts
   const ru = {
   ```
   And at the end of the file:
   ```ts
   export default ru;
   ```

4. Import translation file in the `./src/utils/translations.ts`. Import the generated file like this:

   ```ts
   import en from "./translations/en";
   import ru from "./translations/ru";
   ```

5. Add the language to the `supportedLanguages` map like this, to show this language in the app's menu:

   ```ts
   export const supportedLanguages = new Map([
     ["en", "english"],
     ["ru", "русский"],
   ]);
   ```

6. Add language to `resources` like this:

   ```ts
   resources: {
       en: {
         translation: en,
       },
       ru: {
         translation: ru,
       },
   },
   ```

7. Add language to `fallbackLng` like this:

   ```ts
   fallbackLng: {
        ru: ["ru"],
        default: [defaultLanguageCode],
      },
   ```

8. Open the file `./src/utils/datetime.ts`. Import the locale from `date-fns/locale` as follows:

    ```ts
    import { enUS, ru } from "date-fns/locale";
    ```

9. And add the locale to the `locales` variable like this:

   ```ts
   const locales = new Map([
     ["en", enUS],
     ["ru", ru],
   ]);
   ```

10. Build the project (see instructions [here](https://github.com/IraSoro/peri/blob/master/BUILDING.md)).

11. Check the work of the `formatter` and `linter`. To do this, use the following commands:

    ```bash
    npm run fmt
    npm run lint
    ```

12. Make a Pull Request with the translated file.

### Guidelines

- Please ensure accuracy and maintain consistency with the existing translations.
- Add comments to clarify if necessary.
- Respect the original meaning when translating phrases.
