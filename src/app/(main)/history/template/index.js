"use client";
import axios from "axios";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import styles from "@/css/History.module.css";
import Pagination from "@/components/Pagination";
import React, { useState, useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { useSnackbar } from "@/components/Snackbar";
import ConfirmModal from "@/components/ConfirmModal";
import { exportToPDF } from "@/components/exportPDF";
import handleAxiosError from "@/components/HandleAxiosError";

const History = () => {
    const router = useRouter();
    const showAlert = useSnackbar();

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const savedRows = getCookie("rowsPerPage");
    const [rowsPerPage, setRowsPerPage] = useState(savedRows ? Number(savedRows) : 10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await axios.get("home/api");
            if (res?.status === 200) {
                const sortedLogs = (res.data.data || []).sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setLogs(sortedLogs);
            }
        } catch (error) {
            showAlert({ message: handleAxiosError(error).message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const groupLogsByMonth = (data) => {
        return data.reduce((groups, log) => {
            const dateObj = new Date(log.date);
            const monthYear = dateObj.toLocaleString("default", { month: "long", year: "numeric" });
            if (!groups[monthYear]) groups[monthYear] = [];
            groups[monthYear].push(log);
            return groups;
        }, {});
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            setLoading(true);
            const res = await axios.delete(`history/api/${selectedId}`);
            if (res?.status === 200) {
                showAlert({ message: "Record deleted! ✅", type: "success" });
                setLogs(logs.filter((log) => log._id !== selectedId));
            }
        } catch (error) {
            showAlert({ message: handleAxiosError(error).message, type: "error" });
        } finally {
            setIsModalOpen(false);
            setLoading(false);
        }
    };

    const currentLogs = logs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(logs.length / rowsPerPage);
    const groupedLogs = groupLogsByMonth(currentLogs);

    return (
        <div className={styles.pageWrapper}>
            {loading && <Loader />}
            <ConfirmModal
                isOpen={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Record"
                message="Are you sure you want to delete this record?"
            />

            <div className={styles.homeMainContainer}>
                <div className={styles.tableContainer}>
                    <div className={styles.header}>
                        <h3>Qaza History</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                            <button onClick={() => exportToPDF(logs)} className={styles.downloadBtn}>
                                📥 Export PDF
                            </button>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.historyTable}>
                            <thead className={styles.desktopOnlyHead}>
                                <tr>
                                    <th className={styles.dateHead}>Date & Status</th>
                                    <th>F</th><th>Z</th><th>A</th><th>M</th><th>I</th>
                                    <th className={styles.actionHead}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(groupedLogs).length > 0 ? (
                                    Object.entries(groupedLogs).map(([month, monthLogs]) => (
                                        <React.Fragment key={month}>
                                            <tr className={styles.monthDividerRow}>
                                                <td colSpan="7" className={styles.monthDividerCell}>{month}</td>
                                            </tr>
                                            {monthLogs.map((log) => {
                                                const vals = {
                                                    fajr: Number(log.data.fajr || 0),
                                                    zohar: Number(log.data.zohar || 0),
                                                    asar: Number(log.data.asar || 0),
                                                    maghrib: Number(log.data.maghrib || 0),
                                                    isha: Number(log.data.isha || 0)
                                                };
                                                const isComplete = Object.values(vals).every(v => v > 0);

                                                return (
                                                    <tr key={log._id} className={styles.tableRow}>
                                                        {/* Desktop Cells */}
                                                        <td className={`${styles.desktopCell} ${styles.dateCell}`}>
                                                            <div className={styles.dateText}>{log.date}</div>
                                                            <span className={isComplete ? styles.statusComplete : styles.statusPending}>
                                                                {isComplete ? "COMPLETE" : "PENDING"}
                                                            </span>
                                                        </td>
                                                        <td className={`${styles.desktopCell} ${vals.fajr > 0 ? styles.countDone : styles.countZero}`}>{vals.fajr}</td>
                                                        <td className={`${styles.desktopCell} ${vals.zohar > 0 ? styles.countDone : styles.countZero}`}>{vals.zohar}</td>
                                                        <td className={`${styles.desktopCell} ${vals.asar > 0 ? styles.countDone : styles.countZero}`}>{vals.asar}</td>
                                                        <td className={`${styles.desktopCell} ${vals.maghrib > 0 ? styles.countDone : styles.countZero}`}>{vals.maghrib}</td>
                                                        <td className={`${styles.desktopCell} ${vals.isha > 0 ? styles.countDone : styles.countZero}`}>{vals.isha}</td>
                                                        <td className={`${styles.desktopCell} ${styles.actionCell}`}>
                                                            <div className={styles.actionBtns}>
                                                                <span onClick={() => router.push(`/home?date=${log.date}`)} className={styles.iconBtn}>✏️</span>
                                                                <span onClick={() => { setSelectedId(log._id); setIsModalOpen(true); }} className={styles.iconBtn}>🗑️</span>
                                                            </div>
                                                        </td>

                                                        {/* Mobile Card View */}
                                                        <td colSpan="7" className={styles.mobileCardCell}>
                                                            <div className={styles.mobileCard}>
                                                                <div className={styles.cardHeader}>
                                                                    <div className={styles.cardDate}>{log.date}</div>
                                                                    <span className={isComplete ? styles.statusComplete : styles.statusPending}>
                                                                        {isComplete ? "COMPLETE" : "PENDING"}
                                                                    </span>
                                                                </div>
                                                                <div className={styles.cardBody}>
                                                                    <div className={styles.miniStat}><span>F</span><b>{vals.fajr}</b></div>
                                                                    <div className={styles.miniStat}><span>Z</span><b>{vals.zohar}</b></div>
                                                                    <div className={styles.miniStat}><span>A</span><b>{vals.asar}</b></div>
                                                                    <div className={styles.miniStat}><span>M</span><b>{vals.maghrib}</b></div>
                                                                    <div className={styles.miniStat}><span>I</span><b>{vals.isha}</b></div>
                                                                </div>
                                                                <div className={styles.cardActions}>
                                                                    <span onClick={() => router.push(`/home?date=${log.date}`)} className={styles.iconBtn}>✏️</span>
                                                                    <span onClick={() => { setSelectedId(log._id); setIsModalOpen(true); }} className={styles.iconBtn}>🗑️</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#999" }}>No Records Found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {logs.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        rowsPerPage={rowsPerPage}
                        onRowsChange={(v) => { setRowsPerPage(v); setCurrentPage(1); setCookie("rowsPerPage", v); }}
                    />
                )}
            </div>
        </div>
    );
};

export default History;