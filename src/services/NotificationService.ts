import { Store } from 'react-notifications-component';

class NotificationService {
    private currentNotificationId: string | null = null;

    showProgressNotification(message: string, progress?: number) {
        // Remove previous notification if it exists
        // if (this.currentNotificationId) {
        //     Store.removeNotification(this.currentNotificationId);
        // }

        // Create new notification
        const notification = Store.addNotification({
            title: "WebLLM Loading",
            message: progress !== undefined ? `${message} (${Math.round(progress * 100)}%)` : message,
            type: "info",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
                duration: 3000, // Don't auto-dismiss
                onScreen: false // Don't show close button
            }
        });

        this.currentNotificationId = notification;
    }

    hideProgressNotification() {
        if (this.currentNotificationId) {
            Store.removeNotification(this.currentNotificationId);
            this.currentNotificationId = null;
        }
    }

    showSuccessNotification(message: string) {
        Store.addNotification({
            title: "Success",
            message,
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
                duration: 3000,
                onScreen: true
            }
        });
    }

    showErrorNotification(message: string) {
        Store.addNotification({
            title: "Error",
            message,
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
                duration: 5000,
                onScreen: true
            }
        });
    }
}

export const notificationService = new NotificationService();