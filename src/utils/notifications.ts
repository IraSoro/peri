import { LocalNotifications } from "@capacitor/local-notifications";

import { getPeriodShiftInDays } from "../state/CalculationLogics";
import { Cycle } from "../data/ClassCycle";
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

export const removeAllNotifications = async () => {
  try {
    await LocalNotifications.removeAllDeliveredNotifications();
    console.log("Old notifications removed");
  } catch (error) {
    console.error("Error removing notifications:", error);
  }
};

const getNextNotificationIds = async () => {
  try {
    const lastId = Number(await storage.get.lastNotificationId());
    const nextId = lastId + 1;
    const secondNextId = nextId + 1;

    await storage.set.lastNotificationId(secondNextId);
    return [nextId, secondNextId];
  } catch (err) {
    console.error(`Can't get lastNotificationId: ${(err as Error).message}`);
    await storage.set.lastNotificationId(2);
    return [1, 2];
  }
};

export const createNotifications = async (cycles: Cycle[]) => {
  try {
    const notificationsId = await getNextNotificationIds();
    const dayBeforePeriod = getPeriodShiftInDays(cycles, -1);
    const dayOfPeriod = getPeriodShiftInDays(cycles, 0);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationsId[0],
          title: "Period is coming soon",
          body: "Your period may start tomorrow",
          schedule: { at: dayBeforePeriod },
          sound: "default",
          smallIcon: "ic_launcher",
          largeIcon: "ic_launcher",
        },
        {
          id: notificationsId[1],
          title: "Period is coming soon",
          body: "Your period may start today",
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
