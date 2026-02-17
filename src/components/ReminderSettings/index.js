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

    // ✅ Hal: Login hote hi API se user ki apni settings lao
    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const token = getCookie("sessionToken");
                if (!token) return;

                const res = await axios.get("/home/api", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Agar DB mein settings hain toh wo set karo
                if (res.data?.reminderTimes && res.data.reminderTimes.length > 0) {
                    setReminderTimes(res.data.reminderTimes);
                    setIsSaved(true);
                } else {
                    // Agar naya user hai toh default time
                    setReminderTimes(["21:00"]);
                    setIsSaved(false);
                }
            } catch (err) {
                console.error("Failed to fetch settings");
            }
        };

        fetchUserSettings();
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = getCookie("sessionToken");

            let sub = null;
            if (typeof window !== "undefined" && Notification.permission === "granted") {
                sub = await initPushNotification();
            }

            const res = await axios.post(
                "/home/api",
                { reminderTimes: reminderTimes, subscription: sub },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsSaved(true);
            showAlert({ message: "Settings Saved! 🔔", type: "success" });
        } catch (error) {
            showAlert({ message: handleAxiosError(error).message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Baqi Functions (addTimeSlot, removeTimeSlot, etc.) wahi rahenge jo pehle thay
    const addTimeSlot = () => { setReminderTimes([...reminderTimes, "12:00"]); setIsSaved(false); };
    const removeTimeSlot = (index) => { if (reminderTimes.length > 1) { setReminderTimes(reminderTimes.filter((_, i) => i !== index)); setIsSaved(false); } };
    const handleTimeChange = (index, value) => { const updated = [...reminderTimes]; updated[index] = value; setReminderTimes(updated); setIsSaved(false); };

    return (
        <div className={`${styles.card} ${isSaved ? styles.activeCard : ""}`}>
            <div className={styles.statusBadge} style={{
                backgroundColor: isSaved ? '#e6f4ea' : '#fff4e5',
                color: isSaved ? '#1e7e34' : '#b45309',
                padding: '6px', borderRadius: '20px', fontSize: '12px', marginBottom: '15px', border: isSaved ? '1px solid #28a745' : '1px solid #fbbf24'
            }}>
                {isSaved ? "● Active" : "● Inactive: Click Save"}
            </div>

            <h3 className="font-bold">Prayer Reminders</h3>

            {reminderTimes.map((time, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} />
                    {reminderTimes.length > 1 && <button onClick={() => removeTimeSlot(index)}>🗑️</button>}
                </div>
            ))}

            <button onClick={addTimeSlot}>+ Add Time</button>
            <button onClick={handleSave} disabled={loading || isSaved}>
                {loading ? "Saving..." : isSaved ? "Saved ✨" : "Save Settings"}
            </button>
        </div>
    );
};

export default ReminderSettings;