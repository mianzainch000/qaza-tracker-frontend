"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import Loader from "@/components/Loader";
import styles from "@/css/Auth.module.css";
import { apiConfig } from "@/config/apiConfig";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";
const Signup = () => {
    // hooks
    const showAlert = useSnackbar();

    // states

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { firstName, lastName, email, password, confirmPassword } = formData;

        // Custom Validation

        if (password !== confirmPassword) {
            showAlert({
                message: "❌Pasword or Confirm Password not match",
                type: "error",
            });
            return;
        }

        // Signup Api fnction call

        await SignupApi();
    };

    const SignupApi = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${apiConfig.baseUrl}${apiConfig.signup}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            });
            if (res?.status === 201) {
                showAlert({
                    message: res?.data?.message,
                    type: "success",
                });
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
            } else {
                showAlert({
                    message: res?.data.message,
                    type: "error",
                });
            }
        } catch (error) {
            const { message } = handleAxiosError(error);
            showAlert({
                message,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loader />}
            <div className={styles.authContainer}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Signup</h2>

                    <form onSubmit={handleSubmit}>
                        {/* First Name */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>First Name</label>
                            <input
                                className={styles.input}
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </div>
                        {/* Last Name */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Last Name</label>
                            <input
                                className={styles.input}
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </div>
                        {/* Emai */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                className={styles.input}
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="off"
                            />
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
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "👁️‍🗨️" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Conifrm Password */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Confirm Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    className={styles.input}
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={styles.button}
                            disabled={!formData.password || !formData.confirmPassword}
                        >
                            Signup
                        </button>
                    </form>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <Link href="/">Go to login</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Signup;
