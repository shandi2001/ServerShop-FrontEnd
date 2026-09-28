import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./register.css";
import logo from "../Assets/DarkThem.png";
import API from "../api/axiosInstance";
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordError =
    form.password && form.password.length < 8
      ? "Password must be at least 8 characters long."
      : "";
  const emailError =
    form.email && !form.email.includes("@") ? "Email must contain @." : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      return;
    }

    if (form.password.length < 8) {
      return;
    }

    if (form.password !== form.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
        confirmButtonColor: "#fd0d11",
      });
      return;
    }

    try {
      const response = await API.post("/users/signup", {
        name: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const registeredUser = response.data.user;

      // نخزن بيانات المستخدم فقط للواجهة الحالية
      localStorage.setItem(
        "servergo_user",
        JSON.stringify({
          id: registeredUser._id,
          name: registeredUser.name,
          email: registeredUser.email,
          role: registeredUser.role,
          photo: registeredUser.photo,
        }),
      );

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Your account has been created successfully.",
        confirmButtonText: "Great!",
        confirmButtonColor: "#38d643",
        timer: 3000,
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      console.error(
        "❌ REGISTER ERROR:",
        error.response?.data || error.message,
      );

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#fd0d11",
      });
    }
  };

  return (
    <div className="register-page d-flex align-items-center justify-content-center">
      <div className="register-card d-flex">
        {/*==================left side==================*/}
        <div className="left-section">
          <img src={logo} alt="" width={250} />
          <h2>
            Create Your <span>Account</span>
          </h2>
          <p className="section-description">
            Join thousands of developers and businesses deploying with ServerGo.
          </p>
          <div className="feature">
            <div className="feature-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                />
              </svg>
            </div>
            <div className="feature-description">
              <b>Powerful Cloud</b>
              <p>High performance servers with 99.9% uptime.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            </div>
            <div className="feature-description">
              <b>Secure & Reliable</b>
              <p>Enterprise-grade security to protect your data.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                />
              </svg>
            </div>
            <div className="feature-description">
              <b>Instant Deployment</b>
              <p>Deploy your servers in seconds, not minutes.</p>
            </div>
          </div>
        </div>
        {/*=======right side / form side=====*/}
        <div className="right-section">
          <h3>Create Account</h3>
          <p className="section-description">
            Fill in the details below to get started.
          </p>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="input-group mb-4">
              <span className="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 18.75c0-2.625 2.286-4.75 5.25-4.75h4.5c2.964 0 5.25 2.125 5.25 4.75"
                  />
                </svg>
              </span>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-4">
              <span className="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8.25c0-1.035.84-1.875 1.875-1.875h14.25C19.16 6.375 20 7.215 20 8.25v7.5c0 1.035-.84 1.875-1.875 1.875H4.875A1.875 1.875 0 0 1 3 15.75V8.25Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3.75 7.5 8.25 5.25L20.25 7.5"
                  />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            {emailError && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "13px",
                  marginTop: "-10px",
                  marginBottom: "12px",
                  marginLeft: "4px",
                }}
              >
                {emailError}
              </div>
            )}

            <div className="input-group mb-4">
              <span className="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5v-1.5a4.5 4.5 0 0 0-9 0v1.5"
                  />
                  <rect x="5.25" y="10.5" width="13.5" height="9" rx="2.25" />
                </svg>
              </span>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            {passwordError && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "13px",
                  marginTop: "-10px",
                  marginBottom: "12px",
                  marginLeft: "4px",
                }}
              >
                {passwordError}
              </div>
            )}

            <div className="input-group mb-4">
              <span className="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5v-1.5a4.5 4.5 0 0 0-9 0v1.5"
                  />
                  <rect x="5.25" y="10.5" width="13.5" height="9" rx="2.25" />
                </svg>
              </span>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button className="submit">submit</button>

            <div className="login-text">
              <p>
                Already have an account?{" "}
                <span>
                  <span
                    onClick={() => {
                      localStorage.setItem("open_login_now", "true");
                      window.location.href = "/";
                    }}
                    style={{
                      color: "#673de6",
                      fontWeight: "600",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Login
                  </span>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
