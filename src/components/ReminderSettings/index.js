"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { useSnackbar } from "@/components/Snackbar";
import styles from "@/css/ReminderSettings.module.css";
import handleAxiosError from "@/components/HandleAxiosError";

const ReminderSettings = () => {
    const showAlert = useSnackbar();
    const [loading, setLoading] = useState(false);

    // Default time 21:00 rakha hai agar cookie na mile
    const [reminderTimes, setReminderTimes] = useState(["21:00"]);

    // ✅ Page load hote hi Cookie se data uthao
    useEffect(() => {
        const savedTimes = getCookie("userReminderTimes");
        if (savedTimes) {
            try {
                setReminderTimes(JSON.parse(savedTimes));
            } catch (e) {
                console.error("Cookie parse error");
            }
        }
    }, []);

    const addTimeSlot = () => setReminderTimes([...reminderTimes, "12:00"]);

    const removeTimeSlot = (index) => {
        if (reminderTimes.length > 1) {
            setReminderTimes(reminderTimes.filter((_, i) => i !== index));
        }
    };

    const handleTimeChange = (index, value) => {
        const updated = [...reminderTimes];
        updated[index] = value;
        setReminderTimes(updated);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = getCookie("sessionToken");

            const res = await axios.post(
                "/home/api",
                { reminderTimes: reminderTimes },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            // ✅ Save hone par Cookie update karo (30 din ke liye)
            setCookie("userReminderTimes", JSON.stringify(reminderTimes), { maxAge: 60 * 60 * 24 * 30 });

            showAlert({ message: res?.data?.message || "Settings Saved! 🔔", type: "success" });
        } catch (error) {
            const errorMsg = error.response?.data?.message || handleAxiosError(error).message || "Error saving settings.";
            showAlert({ message: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.titleWrapper}>
                <span>🔔</span>
                <h3 className="font-bold">Prayer Reminders</h3>
            </div>

            {reminderTimes.map((time, index) => (
                <div key={index} className={styles.timeRow}>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className={styles.inputField}
                    />
                    {reminderTimes.length > 1 && (
                        <button
                            onClick={() => removeTimeSlot(index)}
                            className={styles.deleteBtn}
                        >
                            🗑️
                        </button>
                    )}
                </div>
            ))}

            <button onClick={addTimeSlot} className={styles.addBtn}>
                + Add Another Time
            </button>

            <button
                onClick={handleSave}
                disabled={loading}
                className={styles.saveBtn}
            >
                {loading ? "Saving..." : "Save All Reminders"}
            </button>
        </div>
    );
};

export default ReminderSettings;