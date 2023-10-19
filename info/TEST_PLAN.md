# Test plan

- [ ] [If there are no any cycle app should show Welcome modal](#if-there-are-no-any-cycle-app-should-show-welcome-modal)
- [ ] [Application should be translated to default language on the first launch](#application-should-be-translated-to-default-language-on-the-first-launch)
- [ ] [User cannot select date after the today in Welcome modal](#user-cannot-select-date-after-the-today-in-welcome-modal)

> Please copy the list above and past it into the new issue related to release
>
> Feel free to add new tests here if they are not covered by automated tests. But try to associate the test with specific bug in application. Don't add test for the sake of testing

## If there are no any cycle app should show Welcome modal

Steps:

- Clear app data from `Application` tool in Chrome Devtools
- Open peri

Expected result:

You should see Welcome modal

## Application should be translated to default language on the first launch

Steps:

- Open `Sensors` in Chrome Devtools
- Change `Location` to `London`/`Moscow`
- Open `Application` in Chrome Devtools
- Click on `Clear site data`
- Reload page

Expected result: Application will be translated to English/Russian

## User cannot select date after the today in Welcome modal

Related task: <https://github.com/IraSoro/peri/pull/124>

Steps:

- Clear app data from `Application` tool in Chrome Devtools
- Open peri page
- Select any date after today

Expected result: You can't select any day after today
