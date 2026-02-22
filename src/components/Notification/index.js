import axios from "axios";

export function urlBase64ToUint8Array(base64String) {
    if (!base64String) return new Uint8Array(0);
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const initPushNotification = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("Push notifications not supported");
        return;
    }

    try {
        const register = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Permission not granted");
            return;
        }

        // Direct Key for testing (Mismatch fix)
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicVapidKey) {
            console.error("❌ VAPID Key missing! Make sure NEXT_PUBLIC_VAPID_KEY is in your .env file.");
            return;
        }
        console.log("🚀 Attempting to Subscribe...");

        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        console.log("✅ Subscription Object Created:", subscription);

        await axios.post("/home/api", { subscription });
        console.log("🏆 Subscribed to Push! ✅ Check DB Now.");

    } catch (err) {
        console.error("❌ Subscription failed FINAL ERROR:", err);
    }
};

export const unsubscribeUser = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            console.log("Unsubscribed successfully! 🔕");
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error unsubscribing:", error);
        return false;
    }
};