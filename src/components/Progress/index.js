"use client";
import styles from '@/css/Progress.module.css';

const Progress = ({ yearlyData, overallData }) => {
    const { done, target, breakdown, singleTarget } = yearlyData;
    const { percentage, completedYears } = overallData;

    const prayers = [
        { name: 'Fajr', count: breakdown.fajr },
        { name: 'Zohar', count: breakdown.zohar },
        { name: 'Asar', count: breakdown.asar },
        { name: 'Maghrib', count: breakdown.maghrib },
        { name: 'Isha', count: breakdown.isha },
    ];

    return (
        <div className={styles.container}>
            {completedYears > 0 && (
                <div className={styles.achievementBadge}>
                    <span className={styles.trophy}>🏆</span>
                    <div>
                        <p>MashaAllah! You have completed <b>{completedYears} Year{completedYears > 1 ? 's' : ''}</b> of Qaza Namaz.</p>
                    </div>
                </div>
            )}

            <div className={styles.labelRow}>
                <span className={styles.mainTitle}>Current Cycle Progress</span>
                <span className={styles.pctText}>{percentage}%</span>
            </div>

            <div className={styles.barOuter}>
                <div
                    className={styles.barInner}
                    style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                ></div>
            </div>

            <div className={styles.footerRow}>
                <span>Done: <b>{done}</b></span>
                <span>Target: <b>{target}</b></span>
            </div>

            <hr className={styles.divider} />

            <div className={styles.breakdownTitle}>All-Time Prayer Status</div>

            <div className={styles.breakdownGrid}>
                {prayers.map((p) => {
                    const calculatedPct = (p.count / singleTarget) * 100;
                    return (
                        <div key={p.name} className={styles.prayerCard}>
                            <div className={styles.prayerInfo}>
                                <span className={styles.pName}>{p.name}</span>
                                <span className={styles.pPctBadge}>{calculatedPct.toFixed(1)}%</span>
                            </div>
                            <div className={styles.pMiniBar}>
                                <div
                                    className={styles.pMiniInner}
                                    style={{ width: `${Math.min(calculatedPct, 100)}%` }}
                                ></div>
                            </div>
                            <div className={styles.pCountText}>{p.count} / {singleTarget}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Progress;