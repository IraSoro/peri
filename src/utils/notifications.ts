import { LocalNotifications } from "@capacitor/local-notifications";

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

export const scheduleNotification = () => {
  LocalNotifications.removeAllDeliveredNotifications()
    .then(() => {
      console.log("Old notifications removed");

      const notificationId = Date.now();

      return LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: "Notification!",
            body: "Time for something important",
            schedule: { at: new Date(Date.now() + 5000) },
            sound: "default",
            smallIcon: "ic_launcher",
            largeIcon: "ic_launcher",
          },
        ],
      });
    })
    .then(() => {
      console.log("Notification scheduled");
    })
    .catch((error) => {
      console.error("Error handling notifications:", error);
    });
};
