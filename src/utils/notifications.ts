import { LocalNotifications } from "@capacitor/local-notifications";

import { getNotificationDates } from "../state/CalculationLogics";
import { Cycle } from "../data/ClassCycle";

export const requestPermission = () => {
  LocalNotifications.requestPermissions()
    .then(({ display }) => {
      if (display !== "granted") {
        console.log("Notification permission not received");
        return;
      }
      console.log("Notification permission granted");
    })
    .catch((err) => {
      console.error("Error requesting notification permission:", err);
    });
};

export const removeAllNotifications = () => {
  LocalNotifications.removeAllDeliveredNotifications()
    .then(() => {
      console.log("Old notifications removed");
    })
    .catch((error) => {
      console.error("Error removing notifications:", error);
    });
};

export const createNotifications = (cycles: Cycle[]) => {
  const notificationsId = new Uint16Array(2);
  crypto.getRandomValues(notificationsId);

  const dates = getNotificationDates(cycles);

  LocalNotifications.schedule({
    notifications: [
      {
        id: notificationsId[0],
        title: "Period's coming soon",
        body: "Your period may start tomorrow",
        schedule: { at: dates[0] },
        sound: "default",
        smallIcon: "ic_launcher",
        largeIcon: "ic_launcher",
      },
      {
        id: notificationsId[1],
        title: "Period's coming soon",
        body: "Your period may start today",
        schedule: { at: dates[1] },
        sound: "default",
        smallIcon: "ic_launcher",
        largeIcon: "ic_launcher",
      },
    ],
  })
    .then(() => {
      console.log("Notification scheduled");
    })
    .catch((error) => {
      console.error("Error creating notifications:", error);
    });
};
