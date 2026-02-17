"use client";
import styles from "@/css/Pagination.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange, rowsPerPage, onRowsChange, windowSize = 1 }) => {
    if (totalPages <= 0) return null;

    // Calculate page numbers safely
    const pageNumbers = [];
    pageNumbers.push(1);
    let start = Math.max(2, currentPage - windowSize);
    let end = Math.min(totalPages - 1, currentPage + windowSize);

    if (start > 2) pageNumbers.push("...");
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (end < totalPages - 1) pageNumbers.push("...");
    if (totalPages > 1) pageNumbers.push(totalPages);
    const rowOptions = [5, 10, 20, 30];


    return (
        <div className={styles.paginationContainer}>
            <div className={styles.rowsControl}>
                <label htmlFor="rows">Show</label>
                <div className={styles.selectWrapper}>
                    <select
                        id="rows"
                        value={rowsPerPage}
                        onChange={(e) => onRowsChange(Number(e.target.value))}
                        className={styles.customSelect}
                    >
                        {rowOptions.map((rows) => (
                            <option key={rows} value={rows}>
                                {rows} Rows
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.pagesRow}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.navBtn}
                >
                    &lsaquo;
                </button>

                {pageNumbers.map((page, idx) =>
                    page === "..." ? (
                        <span key={`dots-${idx}`} className={styles.dots}>...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ""}`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.navBtn}
                >
                    &rsaquo;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
