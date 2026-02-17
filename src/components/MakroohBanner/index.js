"use client";
import axios from 'axios';
import { useState, useEffect } from 'react';
import styles from '@/css/MakroohBanner.module.css';

const MakroohSkeleton = () => (
    <div className={styles.bannerContainer} style={{ opacity: 0.6 }}>
        {/* Title Skeleton */}
        <div
            className={styles.title}
            style={{
                width: '60%',
                height: '15px',
                background: 'var(--border-color)',
                borderRadius: '4px',
                margin: '0 auto 10px auto'
            }}
        ></div>

        {/* Grid Skeleton */}
        <div className={styles.grid}>
            {[1, 2, 3].map(i => (
                <div
                    key={i}
                    className={styles.item}
                    style={{
                        height: '40px',
                        background: 'var(--primary-bg)',
                        borderRadius: 'var(--radius)',
                        opacity: 0.5
                    }}
                ></div>
            ))}
        </div>
    </div>
);

const MakroohBanner = () => {
    const [times, setTimes] = useState(null);
    const [cityName, setCityName] = useState("Detecting...");

    const formatTime = (time24) => {
        if (!time24) return "";
        let [hours, minutes] = time24.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    const offsetTime = (timeStr, offsetMin) => {
        let [h, m] = timeStr.split(':').map(Number);
        let totalMinutes = h * 60 + m + offsetMin;
        let newH = Math.floor(totalMinutes / 60);
        let newM = totalMinutes % 60;
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchCityAndTimes = async (lat, lon) => {
            try {
                const url = lat && lon
                    ? `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=1`
                    : `https://api.aladhan.com/v1/timingsByCity?city=Faisalabad&country=Pakistan&method=1`;

                const res = await axios.get(url);
                const t = res.data.data.timings;

                if (lat && lon) {
                    const geoRes = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                    setCityName(geoRes.data.city || "Your Location");
                } else {
                    setCityName("Faisalabad (Default)");
                }

                setTimes({
                    sunriseStart: t.Sunrise,
                    sunriseEnd: offsetTime(t.Sunrise, 15),
                    zawalStart: offsetTime(t.Dhuhr, -15),
                    zawalEnd: t.Dhuhr,
                    sunsetStart: offsetTime(t.Sunset, -15),
                    sunsetEnd: t.Sunset
                });
            } catch (err) { console.error(err); }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (p) => fetchCityAndTimes(p.coords.latitude, p.coords.longitude),
                () => fetchCityAndTimes()
            );
        } else { fetchCityAndTimes(); }
    }, []);


    if (!times) return <MakroohSkeleton />;

    return (
        <div className={styles.bannerContainer}>
            <div className={styles.title}>⚠️ No Prayer Times (Makrooh): <span>{cityName}</span></div>
            <div className={styles.grid}>
                <div className={styles.item}>
                    <span className={styles.label}>Sunrise</span>
                    <b className={styles.time}>{formatTime(times.sunriseStart)} - {formatTime(times.sunriseEnd)}</b>
                </div>
                <div className={styles.item}>
                    <span className={styles.label}>Zawal</span>
                    <b className={styles.time}>{formatTime(times.zawalStart)} - {formatTime(times.zawalEnd)}</b>
                </div>
                <div className={styles.item}>
                    <span className={styles.label}>Sunset</span>
                    <b className={styles.time}>{formatTime(times.sunsetStart)} - {formatTime(times.sunsetEnd)}</b>
                </div>
            </div>
        </div>
    );
};

export default MakroohBanner;