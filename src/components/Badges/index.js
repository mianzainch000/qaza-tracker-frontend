"use client";
import styles from "@/css/Home.module.css";

const Badges = ({ streak, allLogs }) => {
    // Total prayers count calculate karna
    const totalPrayers = allLogs.reduce((acc, log) => {
        const dayTotal = Object.values(log.data).reduce((a, b) => a + b, 0);
        return acc + dayTotal;
    }, 0);

    const badgeList = [
        { id: 1, name: "3-Day Starter", emoji: "🥉", unlocked: streak >= 3 },
        { id: 2, name: "Week Warrior", emoji: "🥈", unlocked: streak >= 7 },
        { id: 3, name: "Monthly Pro", emoji: "🥇", unlocked: streak >= 30 },
        { id: 4, name: "100 Club", emoji: "💯", unlocked: totalPrayers >= 100 },
    ];

    return (
        <div className={styles.badgeSection}>
            <h4>Your Achievements</h4>
            <div className={styles.badgeGrid}>
                {badgeList.map(badge => (
                    <div key={badge.id} className={`${styles.badgeItem} ${badge.unlocked ? "" : styles.locked}`}>
                        <div className={styles.badgeEmoji}>{badge.unlocked ? badge.emoji : "🔒"}</div>
                        <span>{badge.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Badges;