# Contributing

## Translations

We welcome contributions for translating our application into various languages. If you'd like to help with translations, please follow these steps.

### Steps

1. Look for the `/utils/translations` directory to find existing translations. If you don't find the language you wish to translate the application into, proceed to step 2.

2. Create a new file for the language by duplicating the `ru.ts` file in the `/translations` directory. Name it using the language code (e.g., `fr.ts` for French translations).

3. Translate the content within the file into your desired language.

4. In the directory `/utils` open the file `translation.ts`. Import the generated file like this:

   ```ts
   import en from "./translations/en";
   import ru from "./translations/ru";
   ```

5. Add the language to the `supportedLanguages` variable like this:

   ```ts
   export const supportedLanguages = new Map([
     ["en", "english"],
     ["ru", "русский"],
   ]);
   ```

6. Added language to resources like this:

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

7. In the directory `/utils` open the file `datetime.ts`. Add the locale to the `locales` variable like this:

   ```ts
   const locales = new Map([
     ["en", enUS],
     ["ru", ru],
   ]);
   ```

8. Submit a Pull Request with the translated file.

### Guidelines

- Please ensure accuracy and maintain consistency with the existing translations.
- Add comments to clarify if necessary.
- Respect the original meaning when translating phrases.
