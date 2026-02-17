"use client";
import axios from "axios";
import Loader from "@/components/Loader";
import Badges from "@/components/Badges";
import styles from "@/css/Home.module.css";
import QazaForm from "@/components/QazaForm";
import { useSnackbar } from "@/components/Snackbar";
import { useState, useEffect, Suspense } from "react";
import MotivationCard from "@/components/MotivationCard";
import { useRouter, useSearchParams } from "next/navigation";
import handleAxiosError from "@/components/HandleAxiosError";
import ReminderSettings from "@/components/ReminderSettings";
import {
    initPushNotification,
    unsubscribeUser,
} from "@/components/Notification";

const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const HomeContent = () => {
    const router = useRouter();
    const showAlert = useSnackbar();
    const searchParams = useSearchParams();
    const editDate = searchParams.get("date");

    // States
    const [loading, setLoading] = useState(false);
    const [allLogs, setAllLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(editDate || getLocalDate());
    const [counts, setCounts] = useState({
        fajr: 0,
        zohar: 0,
        asar: 0,
        maghrib: 0,
        isha: 0,
    });

    // ✅ Fix for Hydration Error
    const [notifPermission, setNotifPermission] = useState("default");

    useEffect(() => {
        // ✅ Browser load hote hi asli permission check karein
        if (typeof window !== "undefined" && "Notification" in window) {
            setNotifPermission(Notification.permission);
        }

        fetchCurrentDateLogs(true);

        // ✅ Service Worker registeration (Aapka purana code)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then((reg) => {
                console.log("Service Worker Registered! ✅");
            });
        }
    }, []);

    const toggleNotifications = async () => {
        if (!("Notification" in window)) {
            showAlert({
                message: "Browser doesn't support notifications",
                type: "error",
            });
            return;
        }

        if (notifPermission === "granted") {
            // Agar pehle se on hain, toh OFF kar do
            const success = await unsubscribeUser();
            if (success) {
                setNotifPermission("default"); // State update for UI
                showAlert({ message: "Notifications Turned Off! 🔕", type: "info" });
            }
        } else {
            // Agar off hain, toh ON kar do
            const permission = await Notification.requestPermission();
            setNotifPermission(permission);

            if (permission === "granted") {
                try {
                    await initPushNotification();
                    showAlert({
                        message: "Notifications Enabled Successfully! ✅",
                        type: "success",
                    });
                } catch (err) {
                    showAlert({ message: "Failed to sync subscription", type: "error" });
                }
            }
        }
    };
    const fetchCurrentDateLogs = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const res = await axios.get("home/api");
            if (res?.status === 200) {
                const logs = res.data.data || [];
                setAllLogs(logs);
                const existingData = logs.find((item) => item.date === selectedDate);
                setCounts(
                    existingData
                        ? existingData.data
                        : { fajr: 0, zohar: 0, asar: 0, maghrib: 0, isha: 0 },
                );
            }
        } catch (error) {
            console.error(handleAxiosError(error).message);
        } finally {
            setLoading(false);
        }
    };

    const saveQazaData = async () => {
        try {
            const total = Object.values(counts).reduce(
                (sum, value) => sum + Number(value),
                0,
            );
            if (total === 0) {
                showAlert({
                    message: "Please add at least one prayer count!",
                    type: "error",
                });
                return;
            }

            setLoading(true);
            const res = await axios.post("home/api", {
                date: selectedDate,
                data: counts,
            });
            showAlert({
                message: res?.data?.message || "Saved Successfully!",
                type: "success",
            });

            if (Notification.permission === "default") {
                await toggleNotifications();
            }

            fetchCurrentDateLogs();
        } catch (error) {
            showAlert({ message: handleAxiosError(error).message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Streak Logic
    const { streak, todayDone } = (() => {
        if (!allLogs || allLogs.length === 0)
            return { streak: 0, todayDone: false };
        const today = getLocalDate();
        const validLogs = allLogs.filter((log) => log.date <= today);
        const sortedLogs = [...validLogs].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
        );
        const todayLog = sortedLogs.find((l) => l.date === today);
        const todayDone = todayLog
            ? Object.values(todayLog.data).reduce((a, b) => a + b, 0) > 0
            : false;

        let streak = 0;
        let checkDate = new Date();
        if (!todayDone) checkDate.setDate(checkDate.getDate() - 1);

        while (streak < allLogs.length + 1) {
            const dateStr = checkDate.toISOString().split("T")[0];
            const found = sortedLogs.find((l) => l.date === dateStr);
            if (found && Object.values(found.data).reduce((a, b) => a + b, 0) > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else break;
        }
        return { streak, todayDone };
    })();

    // Notification Api

    useEffect(() => {
        const syncPushSubscription = async () => {
            // Sirf client-side par chale
            if (typeof window === "undefined" || !("serviceWorker" in navigator))
                return;

            try {
                const registration = await navigator.serviceWorker.ready;
                let sub = await registration.pushManager.getSubscription();

                // Agar permission granted hai aur subscription nahi hai, to auto-subscribe karein
                if (!sub && Notification.permission === "granted") {
                    sub = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(
                            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                        ),
                    });
                }

                if (sub) {
                    // Yahan apni sahi API path dalein
                    await axios.post("/home/api", {
                        subscription: sub,
                        reminderTimes: ["19:34"],
                    });
                    console.log("Subscription synced! ✅");
                }
            } catch (err) {
                console.error("Auto-sync failed:", err);
            }
        };

        syncPushSubscription();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            {loading && <Loader />}
            <div className={styles.homeMainContainer}>
                <header className={styles.homeHeader}>
                    <h2>
                        {selectedDate === getLocalDate()
                            ? "Today's Qaza"
                            : `Qaza for ${selectedDate}`}
                    </h2>

                    <div className={styles.toggleContainer} onClick={toggleNotifications}>
                        <span style={{ cursor: "pointer" }}>
                            {notifPermission === "granted" ? "🔔" : "🔕"}
                        </span>
                        <div
                            className={`${styles.toggleSwitch} ${notifPermission === "granted" ? styles.on : ""}`}
                        >
                            <div className={styles.toggleHandle}></div>
                        </div>
                    </div>
                </header>

                <MotivationCard streak={streak} todayDone={todayDone} />

                {/* 🔔 Reminder Settings - Central Placement */}
                <div style={{ width: "100%", marginBottom: "20px" }}>
                    <ReminderSettings />
                </div>

                <Badges streak={streak} allLogs={allLogs} />

                <div className={styles.formSection}>
                    <QazaForm
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        todayStatus={counts}
                        onUpdate={(name, val) =>
                            setCounts((prev) => ({
                                ...prev,
                                [name]: Math.max(0, prev[name] + val),
                            }))
                        }
                        onSave={saveQazaData}
                    />
                </div>
            </div>
        </div>
    );
};

const Home = () => (
    <Suspense fallback={<Loader />}>
        <HomeContent />
    </Suspense>
);

export default Home;
