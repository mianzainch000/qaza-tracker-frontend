import styles from '@/css/Home.module.css';

const QazaForm = ({ todayStatus, selectedDate, onDateChange, onUpdate, onSave }) => {
    const namazNames = ['fajr', 'zohar', 'asar', 'maghrib', 'isha'];

    return (
        <div className={styles.card}>
            {/* Calendar Section */}
            <div className={styles.datePickerContainer}>
                <label className={styles.dateLabel}>Namaz ki Tareekh Select Karein:</label>
                <input
                    type="date"
                    className={styles.dateInput}
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                />
            </div>

            <div className={styles.grid}>
                {namazNames.map((name) => (
                    <div key={name} className={styles.counterItem}>
                        <span className={styles.namazTitle}>{name.toUpperCase()}</span>
                        <div className={styles.controls}>
                            <button className={styles.btn} onClick={() => onUpdate(name, -1)}>-</button>
                            <span className={styles.count}>{todayStatus?.[name] || 0}</span>
                            <button className={`${styles.btn} ${styles.btnPlus}`} onClick={() => onUpdate(name, 1)}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            <button className={styles.saveBtn} onClick={onSave}>
                SAVE RECORD
            </button>
        </div>
    );
};

export default QazaForm;