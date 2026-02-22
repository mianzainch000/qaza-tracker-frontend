"use client";
import React, { useState } from "react";
import styles from "@/css/Guide.module.css";
import { useRouter } from "next/navigation";
import { hadithData, imamData, additionalInfo } from "./qazaData";

const QazaGuide = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("hadith");

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <h1>Qaza Namaz Guide</h1>
                <p>Quran-o-Sunnat aur Aimma ki roshni mein</p>
            </header>

            <div className={styles.tabSwitcher}>
                <button
                    className={activeTab === "hadith" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("hadith")}
                >
                    Ahadees & Dalail
                </button>
                <button
                    className={activeTab === "imams" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("imams")}
                >
                    Aimma ki Rai
                </button>
                <button
                    className={activeTab === "additionalInfo" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("additionalInfo")}
                >
                    Izafi Malumat
                </button>
            </div>

            <main className={styles.content}>
                {/* Ahadees Tab */}
                {activeTab === "hadith" && (
                    <div className={styles.grid}>
                        {hadithData.map((h, i) => (
                            <div key={i} className={styles.hadithCard}>
                                <div className={styles.bookIcon}>📖</div>
                                <small className={styles.refTag}>{h.ref}</small>
                                <p className={styles.hadithText}>{h.text}</p>
                                <div className={styles.lessonBox}>
                                    <strong>Hukm:</strong> {h.lesson}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Aimma ka Tab */}
                {activeTab === "imams" && (
                    <div className={styles.imamGrid}>
                        {imamData.map((m, i) => (
                            <div key={i} className={styles.imamCard}>
                                <h3>{m.name}</h3>
                                <span className={styles.maslakTag}>{m.point}</span>
                                <ul className={styles.pointsList}>
                                    {m.details.map((d, j) => (
                                        <li key={j}>{d}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* 🆕 Izafi Malumat ka Tab */}
                {activeTab === "additionalInfo" && (
                    <div className={styles.additionalGrid}>
                        {additionalInfo.map((info, i) => (
                            <div key={i} className={styles.infoCard}>
                                <div className={styles.infoIcon}>📌</div>
                                <h3 className={styles.infoTopic}>{info.topic}</h3>
                                <p className={styles.infoDescription}>{info.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Card - Sab Tabs Mein Dikhe Ga */}
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>💡</div>
                    <div className={styles.summaryText}>
                        <h3>Asan Niyat & Summary</h3>
                        <p>
                            Niyat dil ke irade ko kehte hain. Lambi qaza ke liye asan niyat ye hai:
                            <b> Main apni sab se pehli (purani) qaza Fajr parhta hoon.</b> Is tarah niyat karke aap aik waqt mein jitni chahen namazein ada kar sakte hain.
                        </p>
                        <p className={styles.summaryNote}>
                            ⏰ Yaad rakhye: Farz namaz waqt par hi afzal hai. Qaza namazein farz ke baad parhein.
                        </p>
                    </div>
                </div>

                <p className={styles.disclaimer}>
                    * Behtar rehnumayi ke liye apne makhsoos maslak ke mustanad Alim-e-Deen se ruju karein.
                </p>
            </main>
        </div>
    );
};

export default QazaGuide;