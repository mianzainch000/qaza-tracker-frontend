"use client";
import Link from "next/link";
import Image from "next/image";
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
            <h1 className={styles.welcomeText}>Welcome Back!</h1>
            <p className={styles.subText}>Log in to continue your progress.</p>
          </div>

          {/* Right Side: Login Form */}
          <div className={styles.rightSection}>
            <h2 className={styles.title}>Login</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="Enter your email"
                />
              </div>

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
                    placeholder="Enter your password"
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

              <button
                type="submit"
                className={styles.button}
                disabled={!formData.email || !formData.password}
              >
                Login
              </button>
            </form>

            <div className={styles.footerLinks}>
              <Link href="/signup">Signup</Link>
              <Link href="/forgotPassword">Forgot Password?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
