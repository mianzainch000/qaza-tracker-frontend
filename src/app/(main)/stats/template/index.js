"use client";
import axios from "axios";
import Loader from "@/components/Loader";
import styles from "@/css/stats.module.css";
import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import handleAxiosError from "@/components/HandleAxiosError";
import { useSnackbar } from "@/components/Snackbar";

const Stats = () => {
    const showAlert = useSnackbar();
    // Current Date Logic
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
    const years = React.useMemo(() => {
        const year = new Date().getFullYear();
        return [year];
    }, []);
    const months = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
    ];
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [data, setData] = useState(null);
    const [statsArray, setStatsArray] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const monthStr = `${selectedYear}-${selectedMonth}`;
            const res = await axios.get(`/stats/api?month=${monthStr}`, {});

            const result = res.data;

            if (result.success) {
                setData(result);
                const raw = result.data;
                setStatsArray([
                    { name: "Fajr", count: raw.fajr || 0, color: "#1b5e20" },
                    { name: "Zohar", count: raw.zohar || 0, color: "#f39c12" },
                    { name: "Asar", count: raw.asar || 0, color: "#1565c0" },
                    { name: "Maghrib", count: raw.maghrib || 0, color: "#43a047" },
                    { name: "Isha", count: raw.isha || 0, color: "#2c3e50" },
                ]);
            } else {
                handleEmpty();
            }
        } catch (error) {
            const apiError = handleAxiosError(error);

            // 🔔 Alert show karne ke liye
            showAlert({
                message: apiError.message || "Failed to load stats",
                type: "error",
            });

            console.error("Stats Error:", apiError.message);
            handleEmpty();
        } finally {
            setLoading(false);
        }
    };

    const handleEmpty = () => {
        setData(null);
        setStatsArray(
            ["Fajr", "Zohar", "Asar", "Maghrib", "Isha"].map((n) => ({
                name: n,
                count: 0,
                color: "#e2e8f0",
            })),
        );
    };

    useEffect(() => {
        fetchStats();
    }, [selectedYear, selectedMonth]);

    return (
        <div className={styles.statsPageWrapper}>
            <div className={styles.statsContainer}>
                <div className={styles.headerSection}>
                    <div className={styles.titleArea}>
                        <h2 className={styles.title}>Monthly Stats 📊</h2>
                    </div>

                    <div className={styles.dropdownGroup}>
                        <select
                            className={styles.selector}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {years.map((y) => (
                                <option key={y} value={y.toString()}>
                                    {y}
                                </option>
                            ))}
                        </select>

                        <select
                            className={styles.selector}
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map((m) => (
                                <option key={m} value={m}>
                                    {new Date(2000, parseInt(m) - 1).toLocaleString("en-us", {
                                        month: "long",
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {/* Check if total prayers > 0 */}
                        {data?.insights && data.insights.monthlyTotal > 0 ? (
                            <>
                                {/* 1. Insight Card (MashaAllah wala) */}
                                <div className={styles.insightCard}>
                                    <div className={styles.insightText}>
                                        <h3>
                                            MashaAllah! Is mahine kul{" "}
                                            <strong>{data.insights.monthlyTotal}</strong> namazein
                                            parhin.
                                        </h3>
                                        <p>
                                            Daily Average Progress:{" "}
                                            <strong>{data.insights.dailyAverage}</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* 2. Bar Chart */}
                                <div className={styles.chartSection}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={statsArray}
                                            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => value.charAt(0)}
                                                tick={{ fill: "#64748b" }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#94a3b8" }}
                                                allowDecimals={false}
                                                domain={[0, "auto"]}
                                            />
                                            <Tooltip cursor={{ fill: "#f8fafc" }} />
                                            <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={50}>
                                                {statsArray.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* 3. Bottom Grid Cards */}
                                <div className={styles.bottomGrid}>
                                    {statsArray.map((item) => (
                                        <div
                                            key={item.name}
                                            className={styles.dataCard}
                                            style={{ borderTop: `4px solid ${item.color}` }}
                                        >
                                            <span className={styles.statLabel}>{item.name}</span>
                                            <span className={styles.statValue}>{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* YEH TAB DIKHEGA JAB DATA 0 HOGA */
                            <div
                                className={styles.noDataBanner}
                                style={{ padding: "60px 20px" }}
                            >
                                <div style={{ fontSize: "50px", marginBottom: "15px" }}>📁</div>
                                <h3 style={{ color: "var(--text-main)" }}>No Data Available</h3>
                                <p style={{ color: "var(--text-muted)" }}>
                                    Is mahine ka abhi tak koi record enter nahi kiya gaya.
                                </p>
                                <button
                                    onClick={() => (window.location.href = "/home")}
                                    style={{
                                        marginTop: "20px",
                                        padding: "10px 25px",
                                        backgroundColor: "var(--primary)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Namaz Add Karein
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Stats;
