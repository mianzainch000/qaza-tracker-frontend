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

const ForgotPassword = () => {
  // hooks

  const showAlert = useSnackbar();

  // states

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ForgotPassword Api fnction call

    await ForgotPasswordApi();
  };

  const ForgotPasswordApi = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.forgotPassword}`,
        { email: formData.email },
      );

      if (res?.status === 200) {
        showAlert({
          message: res?.data?.message,
          type: "success",
        });
        setFormData({
          email: "",
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
            <h1 className={styles.welcomeText}>Forgot Password?</h1>
            <p className={styles.subText}>
              Do not worry! Enter your email and we will send you a link to
              reset your password.
            </p>
          </div>

          {/* Right Side: Form  */}
          <div className={styles.rightSection}>
            <h2 className={styles.title}>Reset Link</h2>
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                className={styles.button}
                disabled={!formData.email}
              >
                Verify & Send Link
              </button>
            </form>

            <div className={styles.footerLinks}>
              <Link href="/">Back to login</Link>
              <Link href="/signup">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
