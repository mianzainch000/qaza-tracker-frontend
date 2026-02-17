"use client";
import styles from "@/css/HistoryFilter.module.css";

const HistoryFilter = ({ searchTerm, onSearchChange }) => {
    return (
        <div className={styles.filterContainer}>
            <input
                type="text"
                className={styles.filterInput}
                placeholder="Search month or year (e.g. Feb 2026)..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
};

export default HistoryFilter;