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

    const navItems = [
        { name: 'Home', path: '/home', icon: '🏠' },
        { name: 'History', path: '/history', icon: '🕒' },
        { name: 'Progress', path: '/progress', icon: '📈' },
        { name: 'Stats', path: '/stats', icon: '📊' },
        { name: 'Guide', path: '/guide', icon: '📖' },
    ];

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
                    {/* 2. Map function ka istemal */}
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${styles.link} ${pathname === item.path ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.linkText}>{item.name}</span>
                        </Link>
                    ))}

                    {/* Mobile Logout Button */}
                    <button className={`${styles.link} ${styles.mobileLogout}`} onClick={() => setShowModal(true)}>
                        <span className={styles.icon}>🚪</span>
                        <span className={styles.linkText}>Logout</span>
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