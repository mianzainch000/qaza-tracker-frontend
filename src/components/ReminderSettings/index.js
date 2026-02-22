"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { useSnackbar } from "@/components/Snackbar";
import styles from "@/css/ReminderSettings.module.css";
import handleAxiosError from "@/components/HandleAxiosError";
import { initPushNotification } from "@/components/Notification";

const ReminderSettings = () => {
    const showAlert = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [reminderTimes, setReminderTimes] = useState(["21:00"]);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchFreshData = async () => {
            const token = getCookie("sessionToken");
            if (!token) return;

            try {
                const res = await axios.get("/home/api", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Agar Database mein alarms mil gaye (User A ke purane wale)
                if (res.data?.reminderTimes && res.data.reminderTimes.length > 0) {
                    setReminderTimes(res.data.reminderTimes);
                    setIsSaved(true);
                }
            } catch (error) {
                console.error("Data recover nahi ho saka", error);
            }
        };

        fetchFreshData();
    }, []);


    const handleSave = async () => {
        try {
            setLoading(true);
            const token = getCookie("sessionToken");

            let sub = null;
            if (typeof window !== "undefined" && Notification.permission === "granted") {
                sub = await initPushNotification();
            }

            if (token) {
                await axios.post(
                    "/home/api",
                    { reminderTimes, subscription: sub },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Always save to cookie as well
            setCookie("reminderTimes", JSON.stringify(reminderTimes), { maxAge: 30 * 24 * 60 * 60 }); // 30 days

            setIsSaved(true);
            showAlert({ message: "Settings Saved! 🔔", type: "success" });
        } catch (error) {
            showAlert({ message: handleAxiosError(error).message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const addTimeSlot = () => {
        setReminderTimes([...reminderTimes, "12:00"]);
        setIsSaved(false);
    };

    const removeTimeSlot = async (index) => {
        if (reminderTimes.length > 1) {
            // 1. Pehle local state se delete karein
            const updatedTimes = reminderTimes.filter((_, i) => i !== index);
            setReminderTimes(updatedTimes);

            // 2. فورا "isSaved" ko false karein taake user ko pata chale naya data save karna hai
            // Lekin refresh se bachne ke liye hum auto-save bhi kar sakte hain
            setIsSaved(false);

            // 3. Optional: Agar aap chahte hain ke delete hote hi permanent ho jaye (Auto-Save):
            try {
                const token = getCookie("sessionToken");

                // Cookies update karein
                setCookie("reminderTimes", JSON.stringify(updatedTimes), { maxAge: 30 * 24 * 60 * 60 });

                // Server update karein
                if (token) {
                    await axios.post(
                        "/home/api",
                        { reminderTimes: updatedTimes },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setIsSaved(true); // Ab refresh par wapis nahi aayenge
                    showAlert({ message: "Time deleted successfully! 🗑️", type: "success" });
                }
            } catch (error) {
                console.error("Delete sync failed", error);
            }
        }
    };

    const handleTimeChange = (index, value) => {
        const updated = [...reminderTimes];
        updated[index] = value;
        setReminderTimes(updated);
        setIsSaved(false);
    };

    return (
        <div className={`${styles.card} ${isSaved ? styles.activeCard : ""}`}>
            <div className={`${styles.statusBadge} ${isSaved ? styles.activeBadge : styles.inactiveBadge}`}>
                {isSaved ? "● Active" : "● Inactive: Click Save"}
            </div>

            <h3 className="font-bold">Prayer Reminders</h3>

            {reminderTimes.map((time, index) => (
                <div key={index} className={styles.timeRow}>
                    <input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} />
                    {reminderTimes.length > 1 && <button onClick={() => removeTimeSlot(index)}>🗑️</button>}
                </div>
            ))}

            <button onClick={addTimeSlot}>+ Add Time</button>
            <button onClick={handleSave} disabled={loading || isSaved}>
                {loading ? "Saving..." : isSaved ? "Reminder Saved 🔔" : "Save Reminder"}
            </button>
        </div>
    );
};

export default ReminderSettings;
