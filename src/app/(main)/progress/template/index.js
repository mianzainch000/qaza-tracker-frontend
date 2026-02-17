"use client";
import axios from "axios";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import Progress from "@/components/Progress";
import styles from "@/css/Progress.module.css";
import handleAxiosError from "@/components/HandleAxiosError";

const ProgressPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const calculateStats = (historyLogs) => {
        const totalDoneAllTime = historyLogs.reduce((acc, log) => {
            const dayTotal = Object.values(log.data).reduce(
                (a, b) => a + (Number(b) || 0),
                0,
            );
            return acc + dayTotal;
        }, 0);

        const prayerSums = historyLogs.reduce(
            (acc, log) => {
                acc.fajr += Number(log.data.fajr) || 0;
                acc.zohar += Number(log.data.zohar) || 0;
                acc.asar += Number(log.data.asar) || 0;
                acc.maghrib += Number(log.data.maghrib) || 0;
                acc.isha += Number(log.data.isha) || 0;
                return acc;
            },
            { fajr: 0, zohar: 0, asar: 0, maghrib: 0, isha: 0 },
        );

        const targetPerCycle = 1825;
        const completedYears = Math.floor(totalDoneAllTime / targetPerCycle);
        const currentCycleProgress = totalDoneAllTime % targetPerCycle;
        const precisePct = (currentCycleProgress / targetPerCycle) * 100;

        return {
            yearly: {
                done: currentCycleProgress,
                target: targetPerCycle,
                breakdown: prayerSums,
                singleTarget: 365,
            },
            overall: {
                percentage: precisePct.toFixed(2),
                completedYears: completedYears,
            },
        };
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const res = await axios.get("home/api");
            if (res?.status === 200) {
                const logs = res.data.data || [];
                setStats(calculateStats(logs));
            }
        } catch (error) {
            console.error(handleAxiosError(error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    return (
        <div className={styles.progressMainArea}>
            {loading && <Loader />}
            <header className={styles.pageHeader}>
                <h1>Progress Tracker 📊</h1>
                <p>MashaAllah! Tracking your spiritual journey</p>
            </header>
            {stats ? (
                <Progress yearlyData={stats.yearly} overallData={stats.overall} />
            ) : (
                !loading && <p className={styles.noData}>No records found yet.</p>
            )}
        </div>
    );
};

export default ProgressPage;
