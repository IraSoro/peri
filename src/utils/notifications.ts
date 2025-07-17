import { LocalNotifications } from "@capacitor/local-notifications";
import i18n from "i18next";

import { getPeriodShiftInDays } from "../state/CalculationLogics";
import { Cycle } from "../data/ICycle";
import { storage } from "../data/Storage";

export const requestPermission = async () => {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    console.log(
      display !== "granted"
        ? "Notification permission not received"
        : "Notification permission granted",
    );
  } catch (err) {
    console.error("Error requesting notification permission:", err);
  }
};

export const clearAllDeliveredNotifications = async () => {
  try {
    await LocalNotifications.removeAllDeliveredNotifications();
    console.log("All delivered notifications have been removed.");
  } catch (error) {
    console.error("Error removing delivered notifications:", error);
  }
};

export const removePendingNotifications = async () => {
  try {
    const pending = await LocalNotifications.getPending();

    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((notification) => ({
          id: notification.id,
        })),
      });
      console.log("All pending notifications removed");
    } else {
      console.log("No pending notifications");
    }
  } catch (err) {
    console.error("Error removing pending notifications:", err);
  }
};

const getNextNotificationId = async () => {
  try {
    const lastId = await storage.get.lastNotificationId();
    const nextId = lastId + 1;

    await storage.set.lastNotificationId(nextId);
    return nextId;
  } catch (err) {
    console.error(`Can't get lastNotificationId: ${(err as Error).message}`);
    await storage.set.lastNotificationId(1);
    return 1;
  }
};

export const createNotifications = async (
  cycles: Cycle[],
  maxDisplayedCycles: number,
) => {
  try {
    const notificationsId1 = await getNextNotificationId();
    const notificationsId2 = await getNextNotificationId();
    const dayBeforePeriod = getPeriodShiftInDays(
      cycles,
      -1,
      maxDisplayedCycles,
    );
    const dayOfPeriod = getPeriodShiftInDays(cycles, 0, maxDisplayedCycles);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationsId1,
          title: i18n.t("Period is coming soon"),
          body: i18n.t("Your period may start tomorrow"),
          schedule: { at: dayBeforePeriod },
          sound: "default",
          smallIcon: "ic_launcher",
          largeIcon: "ic_launcher",
        },
        {
          id: notificationsId2,
          title: i18n.t("Period is coming soon"),
          body: i18n.t("Your period may start today"),
          schedule: { at: dayOfPeriod },
          sound: "default",
          smallIcon: "ic_launcher",
          largeIcon: "ic_launcher",
        },
      ],
    });
    console.log("Notifications scheduled");
  } catch (err) {
    console.log("Error creating notifications:", err);
  }
};
