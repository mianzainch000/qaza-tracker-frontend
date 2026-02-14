"use client";
import axios from "axios";
import Link from "next/link";
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
        <div className={styles.card}>
          <h2 className={styles.title}>Reset Password</h2>

          <form onSubmit={handleSubmit}>
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
              Reset Password
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

export default ResetPassword;
