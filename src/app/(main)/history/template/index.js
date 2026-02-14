"use client";
import axios from "axios";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/css/History.module.css";
import Pagination from "@/components/Pagination";
import { useSnackbar } from "@/components/Snackbar";
import { getCookie, setCookie } from "cookies-next";
import ConfirmModal from "@/components/ConfirmModal";
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

    useEffect(() => {
        fetchHistory();
    }, []);

    const openDeleteModal = (id) => {
        setSelectedId(id);
        setIsModalOpen(true);
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
                    <div className={styles.header}><h3>Qaza History</h3></div>

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
                                {currentLogs.length > 0 ? currentLogs.map((log) => {
                                    // Har value ko number mein convert karna zaroori hai
                                    const vals = [
                                        Number(log.data.fajr || 0),
                                        Number(log.data.zohar || 0),
                                        Number(log.data.asar || 0),
                                        Number(log.data.maghrib || 0),
                                        Number(log.data.isha || 0)
                                    ];
                                    const isComplete = vals.every(v => v > 0);
                                    let statusText = isComplete ? "COMPLETE" : "PENDING";
                                    let statusClass = isComplete ? styles.statusComplete : styles.statusPending;

                                    return (
                                        <tr key={log._id} className={styles.tableRow}>
                                            <td className={`${styles.desktopCell} ${styles.dateCell}`}>
                                                <div className={styles.dateText}>{log.date}</div>
                                                <span className={statusClass}>{statusText}</span>
                                            </td>
                                            {vals.map((val, i) => (
                                                <td key={i} className={`${styles.desktopCell} ${val > 0 ? styles.countDone : styles.countZero}`}>{val}</td>
                                            ))}
                                            <td className={`${styles.desktopCell} ${styles.actionCell}`}>
                                                <div className={styles.actionBtns}>
                                                    <span onClick={() => router.push(`/home?date=${log.date}`)} className={styles.iconBtn}>✏️</span>
                                                    <span onClick={() => openDeleteModal(log._id)} className={styles.iconBtn}>🗑️</span>
                                                </div>
                                            </td>

                                            <td colSpan="7" className={styles.mobileCardCell}>
                                                <div className={styles.mobileCard}>
                                                    <div className={styles.cardHeader}>
                                                        <span className={styles.cardDate}>{log.date}</span>
                                                        <span className={statusClass}>{statusText}</span>
                                                    </div>
                                                    <div className={styles.cardBody}>
                                                        {['F', 'Z', 'A', 'M', 'I'].map((label, i) => (
                                                            <div key={i} className={styles.miniStat}><span>{label}</span><b>{vals[i]}</b></div>
                                                        ))}
                                                    </div>
                                                    <div className={styles.cardActions}>
                                                        <span className={styles.mobileIcon} onClick={() => router.push(`/home?date=${log.date}`)}>✏️</span>
                                                        <span className={styles.mobileIcon} onClick={() => openDeleteModal(log._id)}>🗑️</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No Records Found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {logs.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsChange={(v) => { setRowsPerPage(v); setCurrentPage(1); setCookie("rowsPerPage", v); }}
                    />
                )}
            </div>
        </div>
    );
};

export default History;