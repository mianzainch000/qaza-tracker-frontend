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

    useEffect(() => {
        fetchCurrentDateLogs(true);
    }, []);

    useEffect(() => {
        if (allLogs.length > 0) {
            const existingData = allLogs.find((item) => item.date === selectedDate);
            setCounts(
                existingData
                    ? existingData.data
                    : { fajr: 0, zohar: 0, asar: 0, maghrib: 0, isha: 0 },
            );
        } else {
            fetchCurrentDateLogs(false);
        }
    }, [selectedDate]);

    // 🔥 Streak and Today Status Logic
    const getStreakInfo = (logs) => {
        if (!logs || logs.length === 0) return { streak: 0, todayDone: false };

        const today = getLocalDate();

        // 1. Sirf aaj ya aaj se purani dates filter karein (Future dates ignore)
        const validLogs = logs.filter(log => log.date <= today);
        const sortedLogs = [...validLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

        const todayLog = sortedLogs.find((l) => l.date === today);
        const totalToday = todayLog ? Object.values(todayLog.data).reduce((a, b) => Number(a) + Number(b), 0) : 0;
        const todayDone = totalToday > 0;

        let streak = 0;
        let checkDate = new Date();

        if (!todayDone) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // 2. Safety Break: Loop ko tab tak chalayein jab tak pichle logs majood hain
        while (streak < logs.length + 1) {
            const year = checkDate.getFullYear();
            const month = String(checkDate.getMonth() + 1).padStart(2, "0");
            const day = String(checkDate.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;

            const found = sortedLogs.find((l) => l.date === dateStr);
            const dayTotal = found ? Object.values(found.data).reduce((a, b) => Number(a) + Number(b), 0) : 0;

            if (dayTotal > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return { streak, todayDone };
    };

    const { streak, todayDone } = getStreakInfo(allLogs);

    const saveQazaData = async () => {
        try {
            setLoading(true);
            await axios.post("home/api", { date: selectedDate, data: counts });
            showAlert({ message: "Saved Successfully! ✨", type: "success" });
            // router.push("/history");
            fetchCurrentDateLogs();
        } catch (error) {
            showAlert({ message: handleAxiosError(error).message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

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
                </header>

                {/* 🎯 Motivation Card */}

                <MotivationCard streak={streak} todayDone={todayDone} />

                {/* Badges  */}

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
