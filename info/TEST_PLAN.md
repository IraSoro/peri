# Test plan

- [ ] [If there are no any cycle app should show Welcome modal](#if-there-are-no-any-cycle-app-should-show-welcome-modal)
- [ ] [Application should be translated to default language on the first launch](#application-should-be-translated-to-default-language-on-the-first-launch)
- [ ] [User cannot select date after the today and can select current day in Welcome modal independent to UTC time](#user-cannot-select-date-after-the-today-and-can-select-current-day-in-welcome-modal-independent-to-utc-time)
- [ ] [User cannot select date after the today and can select current day on Tab Home independent to UTC time](#user-cannot-select-date-after-the-today-and-can-select-current-day-on-tab-home-independent-to-utc-time)
- [ ] [When user click on the Mark button, then menstruation should be noted starting from the current day without shifts](#when-user-click-on-the-mark-button-then-menstruation-should-be-noted-starting-from-the-current-day-without-shifts)

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

## User cannot select date after the today and can select current day in Welcome modal independent to UTC time

Related task: <https://github.com/IraSoro/peri/issues/143>

Steps:

- Depending on the current UTC time, change the current timezone in Chrome Devtools `Sensors` so that the day in this timezone differs from UTC by one. For example, It's October 28, 02:00, set the timezone to `America/Los_Angeles` (UTC-7). If it's October 28, 23:00, then set `Asia/Tokyo` (UTC+9)
- Reload page

Expected result: The user can't mark a day that has not yet arrived and can mark the current day

## User cannot select date after the today and can select current day on Tab Home independent to UTC time

Related task: <https://github.com/IraSoro/peri/issues/143>

Steps:

- Depending on the current UTC time, change the current timezone in Chrome Devtools `Sensors` so that the day in this timezone differs from UTC by one. For example, It's October 28, 02:00, set the timezone to `America/Los_Angeles` (UTC-7). If it's October 28, 23:00, then set `Asia/Tokyo` (UTC+9)
- Reload page

Expected result: The user can't mark a day that has not yet arrived and can mark the current day

## When user click on the Mark button, then menstruation should be noted starting from the current day without shifts

Related task: <https://github.com/IraSoro/peri/issues/143>

Steps:

- Depending on the current UTC time, change the current timezone in Chrome Devtools `Sensors` so that the day in this timezone differs from UTC by one. For example, It's October 28, 02:00, set the timezone to `America/Los_Angeles` (UTC-7). If it's October 28, 23:00, then set `Asia/Tokyo` (UTC+9)
- Click on `Mark` button on TabHome

Expected result: Menstruation should be noted starting from the current day without any shifts
