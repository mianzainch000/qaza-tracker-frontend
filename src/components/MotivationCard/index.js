"use client";
import React from "react";
import styles from "@/css/Home.module.css";
import { islamicQuotes } from "./islamicQuotes";

const MotivationCard = ({ streak, todayDone }) => {
    // 🗓️ Logic remains the same
    const dayIndex = new Date().getDate() % islamicQuotes.length;
    const quote = islamicQuotes[dayIndex];

    return (
        <div className={`${styles.motivationCard} ${todayDone ? styles.completed : styles.pending}`}>
            <div className={styles.streakIcon}>
                {todayDone ? "✅" : streak > 0 ? "🔥" : "🕌"}
            </div>

            <div className={styles.streakContent}>
                <div className={styles.streakHeader}>
                    <h3>{streak} Day Streak</h3>
                    <p>
                        {todayDone
                            ? "MashaAllah! Today's work is done."
                            : "Don't break your streak! Log today's qaza."}
                    </p>
                </div>

                <div className={styles.quoteBox}>
                    <p className={styles.urduText}>{quote.urdu}</p>
                    <p className={styles.romanText}>{quote.roman}</p>
                    <small>— {quote.source}</small>
                </div>
            </div>
        </div>
    );
};

export default MotivationCard;