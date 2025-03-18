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
    console.log("All notifications removed");
  } catch (error) {
    console.error("Error removing notifications:", error);
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

export const createNotifications = async (cycles: Cycle[]) => {
  try {
    const notificationsId1 = await getNextNotificationId();
    const notificationsId2 = await getNextNotificationId();
    const dayBeforePeriod = getPeriodShiftInDays(cycles, -1);
    const dayOfPeriod = getPeriodShiftInDays(cycles, 0);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationsId1,
          title: "Period is coming soon",
          body: "Your period may start tomorrow",
          schedule: { at: dayBeforePeriod },
          sound: "default",
          smallIcon: "ic_launcher",
          largeIcon: "ic_launcher",
        },
        {
          id: notificationsId2,
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
