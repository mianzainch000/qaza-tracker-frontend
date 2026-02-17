"use client";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Loader from "@/components/Loader";
import styles from "@/css/Auth.module.css";
import { apiConfig } from "@/config/apiConfig";
import { useSearchParams } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";
const ResetPassword = () => {
  // hooks

  const showAlert = useSnackbar();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  // states

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeClosed = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { password, confirmPassword } = formData;

    // Custom Validation

    if (password !== confirmPassword) {
      showAlert({
        message: "❌Pasword or Confirm Password not match",
        type: "error",
      });
      return;
    }

    // ResetPasswordApi Api fnction call

    await ResetPasswordApi();
  };

  const ResetPasswordApi = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.resetPassword}/${token}`,
        {
          newPassword: formData.password,
          token: token,
        },
      );
      if (res?.status === 200) {
        showAlert({
          message: res?.data?.message,
          type: "success",
        });
        setFormData({
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
        <div className={styles.splitCard}>

          {/* Left Side: Logo/Image */}
          <div className={styles.leftSection}>
            {/* <img src="/logo.png" alt="Logo" className={styles.logoImg} /> */}
            <Image
              src="/logo.png"
              alt="Logo"
              className={styles.logoImg}
              width={100}
              height={100}
            />
            <h1 className={styles.welcomeText}>Security First!</h1>
            <p className={styles.subText}>Create a strong new password to protect your account.</p>
          </div>

          {/* Right Side: Reset Form */}
          <div className={styles.rightSection}>
            <h2 className={styles.title}>Reset Password</h2>
            <form onSubmit={handleSubmit}>

              {/* New Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Minimum 4 characters"
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
                    autoComplete="off"
                    placeholder="Repeat your password"
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
                disabled={!formData.password || !formData.confirmPassword}
              >
                Reset Password
              </button>
            </form>

            <div className={styles.footerLinks}>
              <Link href="/">Back to login</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ResetPassword;
