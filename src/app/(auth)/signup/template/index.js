"use client";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Loader from "@/components/Loader";
import styles from "@/css/Auth.module.css";
import { apiConfig } from "@/config/apiConfig";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";

const Signup = () => {
    // Hooks
    const showAlert = useSnackbar();

    // Icons
    const EyeOpen = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const EyeClosed = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    );

    // States
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        gender: "", // ✅ Backend field match
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { firstName, lastName, email, gender, password, confirmPassword } =
            formData;

        // Custom Validations
        if (!gender) {
            showAlert({ message: "❌ Please select your gender", type: "error" });
            return;
        }

        if (password !== confirmPassword) {
            showAlert({
                message: "❌ Password and Confirm Password do not match",
                type: "error",
            });
            return;
        }

        // Signup Api function call
        await SignupApi();
    };

    const SignupApi = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${apiConfig.baseUrl}${apiConfig.signup}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                gender: formData.gender, // ✅ Sending gender to backend
                password: formData.password,
            });

            if (res?.status === 201) {
                showAlert({
                    message: res?.data?.message || "Account created successfully! 🎉",
                    type: "success",
                });
                // Reset Form
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    gender: "",
                    password: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            const { message } = handleAxiosError(error);
            showAlert({ message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loader />}
            <div className={styles.authContainer}>
                <div className={styles.splitCard}>
                    {/* Left Side: Branding */}
                    <div className={styles.leftSection}>
                        {/* <img src="/logo.png" alt="Logo" className={styles.logoImg} /> */}
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            className={styles.logoImg}
                            width={100}
                            height={100}
                        />
                        <h1 className={styles.welcomeText}>Join Us!</h1>
                        <p className={styles.subText}>
                            Create an account to track your prayers and maintain streaks.
                        </p>
                    </div>

                    {/* Right Side: Form */}
                    <div className={styles.rightSection}>
                        <h2 className={styles.title}>Signup</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Name Row */}
                            <div style={{ display: "flex", gap: "10px" }}>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label className={styles.label}>First Name</label>
                                    <input
                                        className={styles.input}
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Zain"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label className={styles.label}>Last Name</label>
                                    <input
                                        className={styles.input}
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Ishfaq"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    className={styles.input}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@mail.com"
                                    required
                                />
                            </div>

                            {/* Gender Select */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Gender</label>
                                <select
                                    className={styles.input}
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    style={{ cursor: "pointer" }}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Password */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Password</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        className={styles.input}
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={showPassword ? "1234" : "••••••••"}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOpen /> : <EyeClosed />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm Password</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        className={styles.input}
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder={showConfirmPassword ? "1234" : "••••••••"}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOpen /> : <EyeClosed />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.button}
                                disabled={
                                    !formData.password ||
                                    !formData.confirmPassword ||
                                    !formData.gender
                                }
                            >
                                Signup
                            </button>
                        </form>

                        <div className={styles.footerLinks}>
                            <span>Already have an account?</span>
                            <Link href="/">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Signup;
