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
import { getCookie } from "cookies-next";
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

    const [notifPermission, setNotifPermission] = useState("default");

    // ✅ Initial Load: Logs and Notifications
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setNotifPermission(Notification.permission);
        }

        fetchCurrentDateLogs(true);

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then(() => {
                console.log("Service Worker Registered! ✅");
            });
        }
    }, []);

    // ✅ Multi-User Protection: Jab user login ho, fresh data sync karein
    useEffect(() => {
        const syncUserSpecificData = async () => {
            if (notifPermission !== "granted") return;

            try {
                const registration = await navigator.serviceWorker.ready;
                let sub = await registration.pushManager.getSubscription();

                if (sub) {
                    const token = getCookie("sessionToken");
                    // 1. Pehle DB se is specific user ki settings mangwao
                    const res = await axios.get("/home/api", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    // 2. Phir usi user ke data ke sath subscription sync karo
                    await axios.post(
                        "/home/api",
                        {
                            subscription: sub,
                            reminderTimes: res.data?.reminderTimes || ["21:00"],
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                    console.log("User-specific subscription synced! ✅");
                }
            } catch (err) {
                console.error("Auto-sync failed:", err);
            }
        };

        syncUserSpecificData();
    }, [notifPermission]);

    const toggleNotifications = async () => {
        if (!("Notification" in window)) {
            showAlert({
                message: "Browser doesn't support notifications",
                type: "error",
            });
            return;
        }

        if (notifPermission === "granted") {
            const success = await unsubscribeUser();
            if (success) {
                setNotifPermission("default");
                showAlert({ message: "Notifications Turned Off! 🔕", type: "info" });
            }
        } else {
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
            const token = getCookie("sessionToken");
            const res = await axios.get("/home/api", {
                headers: { Authorization: `Bearer ${token}` },
            });

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
            const token = getCookie("sessionToken");
            const res = await axios.post(
                "/home/api",
                {
                    date: selectedDate,
                    data: counts,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

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
    // ✅ Streak Logic (Final Fix)
    const { streak, todayDone } = (() => {
        if (!allLogs || allLogs.length === 0)
            return { streak: 0, todayDone: false };

        const today = getLocalDate();

        // 1. Sirf wo logs nikalien jin mein waqayi namaz parhi gayi ho (Total > 0)
        const activeLogs = allLogs.filter((log) => {
            const total =
                Number(log.data.fajr || 0) +
                Number(log.data.zohar || 0) +
                Number(log.data.asar || 0) +
                Number(log.data.maghrib || 0) +
                Number(log.data.isha || 0);
            return total > 0;
        });

        // 2. Aaj ka kaam check karein
        const todayLog = activeLogs.find((l) => l.date === today);
        const todayDone = !!todayLog;

        let currentStreak = 0;
        let checkDate = new Date(); // Browser ka current local time

        // Agar aaj ka kaam nahi hua, toh kal se peeche check karna shuru karein
        if (!todayDone) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // 3. Loop chala kar peeche ki dates check karein
        while (true) {
            // Local date string nikalne ka sab se behtar tareeka (YYYY-MM-DD)
            const y = checkDate.getFullYear();
            const m = String(checkDate.getMonth() + 1).padStart(2, "0");
            const d = String(checkDate.getDate()).padStart(2, "0");
            const dateStr = `${y}-${m}-${d}`;

            const found = activeLogs.find((l) => l.date === dateStr);

            if (found) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1); // Ek din aur peeche jayein
            } else {
                break; // Jahan gap aaya, streak ruk gayi
            }
        }

        return { streak: currentStreak, todayDone };
    })();

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
