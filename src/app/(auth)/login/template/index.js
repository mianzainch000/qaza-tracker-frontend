"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Loader from "@/components/Loader";
import styles from "@/css/Auth.module.css";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";

const LoginForm = () => {
  const router = useRouter();
  const showAlert = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",

  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await Login();
  };

  const Login = async () => {
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,

        redirect: false,
      });

      if (res?.ok) {
        showAlert({ message: "✅ Login successful", type: "success" });

        setFormData({ email: "", password: "" });
        router.push("/home");
      } else {
        showAlert({ message: `❌ ${res?.error}`, type: "error" });
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
        <div className={styles.card}>
          <h2 className={styles.title}>Login</h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
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



            {/* Submit */}
            <button
              type="submit"
              className={styles.button}
              disabled={!formData.email || !formData.password}
            >
              Login
            </button>
          </form>
          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className={styles.footer}>
              <Link href="/signup">Go to Signup</Link>
            </div>
            <div className={styles.footer}>
              <Link href="/forgotPassword">Forgot Password?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
