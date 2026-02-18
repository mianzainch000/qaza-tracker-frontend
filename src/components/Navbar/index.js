"use client";
import React from 'react';
import Link from 'next/link';
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import styles from '@/css/Navbar.module.css';
import { usePathname } from 'next/navigation';
import { useSnackbar } from "@/components/Snackbar";
import ConfirmModal from "@/components/ConfirmModal";

const Navbar = ({ initialFirstName, initialLastName }) => {
    const router = useRouter();
    const showAlert = useSnackbar();
    const pathname = usePathname();
    const [showModal, setShowModal] = React.useState(false);
    const handleLogout = async () => {
        setShowModal(false);
        deleteCookie("sessionToken", { path: "/" });
        deleteCookie("firstName", { path: "/" });
        deleteCookie("lastName", { path: "/" });
        // deleteCookie("reminderTimes", { path: "/" });
        showAlert({
            message: "✅ Logout successful",
            type: "success",
        });
        router.replace("/");
        router.refresh();
    };

    return (
        <>
            <aside className={styles.sidebar}>
                <div className={styles.topSection}>
                    <div className={styles.logo}>QT</div>
                    <div className={styles.userInfo}>
                        <p>Hi,</p>
                        <span>{initialFirstName || "Guest"} {initialLastName || ""} </span>
                    </div>
                </div>

                <nav className={styles.navLinks}>
                    <Link href="/home" className={`${styles.link} ${pathname === '/home' ? styles.active : ''}`}>
                        <span className={styles.icon}>🏠</span>
                        <span className={styles.linkText}>Home</span>
                    </Link>
                    <Link href="/history" className={`${styles.link} ${pathname === '/history' ? styles.active : ''}`}>
                        <span className={styles.icon}>🕒</span>
                        <span className={styles.linkText}>History</span>
                    </Link>
                    <Link href="/progress" className={`${styles.link} ${pathname === '/progress' ? styles.active : ''}`}>
                        <span className={styles.icon}>📈</span>
                        <span className={styles.linkText}>Progress</span>
                    </Link>

                    {/* Mobile Logout Button (Sirf mobile par nazar ayega) */}
                    <button className={`${styles.link} ${styles.mobileLogout}`}>
                        <span className={styles.icon}>🚪</span>
                        <span className={styles.linkText} onClick={() => setShowModal(true)}>Logout</span>
                    </button>
                </nav>

                <div className={styles.bottomSection}>
                    <button className={styles.logoutBtn} onClick={() => setShowModal(true)}>Logout</button>
                </div>
            </aside>
            <ConfirmModal
                isOpen={showModal}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                cancelText="Cancel"
                onConfirm={handleLogout}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
};

export default Navbar;