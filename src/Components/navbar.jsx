import React, { useState, useEffect, useRef } from "react";
import logo from "../Assets/WhiteThem.png";
import mobileLogo from "../Assets/phone logo .png";
import "./navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api/axiosInstance";
import userService from "../services/userService";
import { readCart } from "../utils/cart";
import messageService from "../services/messageService";
import {
  LuCircleUserRound,
  LuCreditCard,
  LuMessageCircle,
  LuServer,
  LuShoppingCart,
} from "react-icons/lu";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const menuRef = useRef(null);
  // العداد صار من الإشعارات الحقيقية بدل رقم ثابت محفوظ بالـ localStorage
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // جلب المستخدم من الـ localStorage وتحديثه فورياً
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("servergo_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const syncUnreadNotifications = async () => {
      if (!user) {
        setUnreadNotificationCount(0);
        return;
      }

      try {
        const response = await messageService.getMyMessages();

        const messages = Array.isArray(response?.doc) ? response.doc : [];

        setUnreadNotificationCount(
          messages.filter((message) => !message.isRead).length,
        );
      } catch (error) {
        setUnreadNotificationCount(0);
      }
    };

    syncUnreadNotifications();

    window.addEventListener("notificationsUpdated", syncUnreadNotifications);
    return () =>
      window.removeEventListener(
        "notificationsUpdated",
        syncUnreadNotifications,
      );
  }, [user]);

  useEffect(() => {
    const syncCartCount = () => {
      if (!user || location.pathname === "/cart") {
        setCartItemCount(0);
        return;
      }

      setCartItemCount(readCart(user).length);
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("cartUpdated", syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("cartUpdated", syncCartCount);
    };
  }, [user, location.pathname]);

  // 🌟 الـ useEffect المصلح تماماً لمنع خطأ no-restricted-globals
  useEffect(() => {
    const savedUser = localStorage.getItem("servergo_user");
    setUser(savedUser ? JSON.parse(savedUser) : null);
    setIsOpen(false);
    setActiveDropdown(null);
    setShowProfileDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const toggleButton = document.querySelector(".nav-toggle");
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !toggleButton?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const triggerLogin = localStorage.getItem("open_login_now");
    if (triggerLogin === "true") {
      setShowLoginModal(true);
      localStorage.removeItem("open_login_now");
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = emailInput.trim().toLowerCase();

    try {
      const response = await API.post("/users/login", {
        email: normalizedEmail,
        password: passwordInput,
      });

      const loggedUser = response.data.user;

      const userData = {
        id: loggedUser._id,
        name: loggedUser.name,
        email: loggedUser.email,
        role: loggedUser.role,
        photo: loggedUser.photo,
      };

      localStorage.setItem("servergo_user", JSON.stringify(userData));

      setUser(userData);

      setShowLoginModal(false);
      setEmailInput("");
      setPasswordInput("");
      setShowPassword(false);

      if (loggedUser.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);

      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: error.response?.data?.message || "Incorrect email or password.",
        confirmButtonColor: "#673de6",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await API.get("/users/logout");

    } catch (error) {
      console.error("❌ Logout error:", error.response?.data || error.message);
    } finally {
      localStorage.removeItem("servergo_user");
      setUser(null);
      setShowProfileDropdown(false);
      navigate("/");
    }
  };

  const handleGoToRegister = () => {
    setShowLoginModal(false);
    navigate("/register");
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = emailInput.trim().toLowerCase();

    if (!normalizedEmail) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email in the login form first.",
        confirmButtonColor: "#673de6",
      });
      return;
    }

    const confirmationResult = await Swal.fire({
      title: "Do you want to change your password?",
      text: `We will send a verification code to ${normalizedEmail}.`,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#673de6",
    });

    if (!confirmationResult.isConfirmed) return;

    try {
      await userService.forgotPassword(normalizedEmail);

      await Swal.fire({
        icon: "success",
        title: "Verification code sent",
        text: `A 6-digit verification code was sent to ${normalizedEmail}.`,
        confirmButtonText: "OK",
        confirmButtonColor: "#673de6",
      });

      const codeResult = await Swal.fire({
        title: "Enter verification code",
        text: "Enter the 6-digit code sent to your email.",
        input: "text",
        inputPlaceholder: "000000",
        inputAttributes: {
          maxlength: "6",
          inputmode: "numeric",
          autocomplete: "one-time-code",
        },
        showCancelButton: true,
        confirmButtonText: "Continue",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#673de6",
        inputValidator: (value) => {
          if (!/^\d{6}$/.test(value || "")) {
            return "Please enter the 6-digit code.";
          }
        },
      });

      if (!codeResult.isConfirmed) return;

      const newPasswordResult = await Swal.fire({
        title: "Create a new password",
        input: "password",
        inputPlaceholder: "At least 8 characters",
        showCancelButton: true,
        confirmButtonText: "Continue",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#673de6",
        inputValidator: (value) => {
          if (!value) return "Please enter a new password.";
          if (value.length < 8) {
            return "Password must be at least 8 characters long.";
          }
        },
      });

      if (!newPasswordResult.isConfirmed) return;

      const confirmPasswordResult = await Swal.fire({
        title: "Confirm your new password",
        input: "password",
        inputPlaceholder: "Repeat your new password",
        showCancelButton: true,
        confirmButtonText: "Reset password",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#673de6",
        inputValidator: (value) => {
          if (!value) return "Please confirm your new password.";

          if (value !== newPasswordResult.value) {
            return "Passwords do not match.";
          }
        },
      });

      if (!confirmPasswordResult.isConfirmed) return;

      await userService.resetPassword(
        normalizedEmail,
        codeResult.value,
        newPasswordResult.value,
      );

      await Swal.fire({
        icon: "success",
        title: "Password reset successfully",
        text: "You can now sign in with your new password.",
        confirmButtonColor: "#673de6",
      });

      setPasswordInput("");
    } catch (error) {
      console.error(
        "❌ Forgot password error:",
        error?.response?.data || error?.message,
      );

      Swal.fire({
        icon: "error",
        title: "Password reset failed",
        text:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#fd0d11",
      });
    }
  };

  return (
    <>
      {isOpen && (
        <div className="nav-overlay" onClick={() => setIsOpen(false)} />
      )}
      <nav className="navbar">
        {/*====logo====*/}
        <Link
          to="/"
          className="logo"
          onClick={() => {
            setActiveDropdown(null);
            setIsOpen(false);
          }}
        >
          <img
            src={logo}
            alt="server go"
            width={200}
            className="desktop-logo"
          />
          <img src={mobileLogo} alt="server go" className="mobile-logo" />
        </Link>

        <div className="nav-right">
          {/*======cart===== */}
          {user && (
            <>
              <Link
                to="/cart"
                className="cart-icon"
                onClick={() => setCartItemCount(0)}
              >
                <LuShoppingCart className="cart-icon-svg" aria-hidden="true" />
                {cartItemCount > 0 && (
                  <span className="notif-badge-counter">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/notifications"
                className="nav-notif-page-link"
                onClick={() => setIsOpen(false)}
              >
                <i className="fa-regular fa-bell"></i>
                {unreadNotificationCount > 0 && (
                  <span className="notif-badge-counter">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {/*======profile===== */}
          {user && (
            <div className="desktop-profile-area">
              <div className="dropdown profile-dropdown-wrapper">
                <div
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="dropdown-toggle profile-trigger-btn"
                >
                  <LuCircleUserRound
                    className="profile-icon"
                    aria-hidden="true"
                  />
                  <span
                    className={`arrow ${showProfileDropdown ? "arrow-up" : "arrow-down"}`}
                    aria-hidden="true"
                  ></span>
                </div>

                {showProfileDropdown && (
                  <ul className="dropdown-menu show">
                    <li className="profile-info">
                      <span>{user.name}</span>
                      <span>{user.email}</span>
                    </li>

                    {user.role === "ADMIN" ? (
                      <>
                        <li>
                          <Link
                            to="/admin-dashboard"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setIsOpen(false);
                            }}
                          >
                            Dashboard
                          </Link>
                        </li>
                        <li className="logout-in-profile">
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileDropdown(false);
                              setIsOpen(false);
                            }}
                            className="logout-btn"
                          >
                            <i className="fa-solid fa-right-from-bracket"></i>{" "}
                            Logout
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/dashboard?tab=overview"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setIsOpen(false);
                            }}
                          >
                            <i className="fa-solid fa-gauge"></i> Overview
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard?tab=servers"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setIsOpen(false);
                            }}
                          >
                            <i className="fa-solid fa-server"></i> My Servers
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard?tab=billing"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setIsOpen(false);
                            }}
                          >
                            <i className="fa-solid fa-credit-card"></i> Billing
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard?tab=support"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setIsOpen(false);
                            }}
                          >
                            <i className="fa-solid fa-headset"></i> Support
                            Tickets
                          </Link>
                        </li>
                        <li className="logout-in-profile">
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileDropdown(false);
                              setIsOpen(false);
                            }}
                            className="logout-btn"
                          >
                            <i className="fa-solid fa-right-from-bracket"></i>{" "}
                            Logout
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {!user && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="login-btn desktop-login-btn"
              style={{
                background: "#673de6",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Login
            </button>
          )}

          <button
            type="button"
            className="nav-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="main-nav-menu"
            aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            <span className={`bar ${isOpen ? "open" : ""}`}></span>
            <span className={`bar ${isOpen ? "open" : ""}`}></span>
            <span className={`bar ${isOpen ? "open" : ""}`}></span>
          </button>
        </div>

        <div
          ref={menuRef}
          id="main-nav-menu"
          className={`nav-menu ${isOpen ? "active" : ""}`}
        >
          <li className="dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => toggleDropdown("servers")}
            >
              <span className="mobile-nav-item-label">
                <LuServer className="mobile-nav-item-icon" aria-hidden="true" />
                servers
              </span>
              <span
                className={`arrow ${activeDropdown === "servers" ? "arrow-up" : "arrow-down"}`}
                aria-hidden="true"
              ></span>
            </button>
            <ul
              className={`dropdown-menu ${activeDropdown === "servers" ? "show" : ""}`}
            >
              <li>
                <Link
                  to="/servers?tab=vps"
                  onClick={() => {
                    setActiveDropdown(null);
                    setIsOpen(false);
                  }}
                >
                  <i className="fa-solid fa-server"></i> VPS servers
                </Link>
              </li>
              <li>
                <Link
                  to="/servers?tab=vps-nvme"
                  onClick={() => {
                    setActiveDropdown(null);
                    setIsOpen(false);
                  }}
                >
                  <i className="fa-solid fa-microchip"></i> VPS-NVME servers
                </Link>
              </li>
              <li>
                <Link
                  to="/servers?tab=cloud"
                  onClick={() => {
                    setActiveDropdown(null);
                    setIsOpen(false);
                  }}
                >
                  <i className="fa-solid fa-cloud"></i> Cloud servers
                </Link>
              </li>
              <li>
                <Link
                  to="/servers?tab=windows"
                  onClick={() => {
                    setActiveDropdown(null);
                    setIsOpen(false);
                  }}
                >
                  <i className="fa-brands fa-windows"></i> Windows servers
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              to="/payment"
              className="nav-link-item"
              onClick={() => {
                setActiveDropdown(null);
                setIsOpen(false);
              }}
            >
              <span className="mobile-nav-item-label">
                <LuCreditCard
                  className="mobile-nav-item-icon"
                  aria-hidden="true"
                />
                payment
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="nav-link-item"
              onClick={() => {
                setActiveDropdown(null);
                setIsOpen(false);
              }}
            >
              <span className="mobile-nav-item-label">
                <LuMessageCircle
                  className="mobile-nav-item-icon"
                  aria-hidden="true"
                />
                contact
              </span>
            </Link>
          </li>

          {user && (
            <li className="dropdown profile-dropdown-wrapper mobile-first">
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="d-flex justify-content-between"
              >
                <div className="d-flex align-items-center">
                  <LuCircleUserRound
                    className="profile-icon"
                    aria-hidden="true"
                  />
                  <li className="profile-info">
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                  </li>
                </div>
                <span
                  className={`arrow ${showProfileDropdown ? "arrow-up" : "arrow-down"}`}
                  aria-hidden="true"
                ></span>
              </div>

              {showProfileDropdown && (
                <ul className="dropdown-menu show">
                  {user.role === "ADMIN" ? (
                    <>
                      <li>
                        <Link
                          to="/admin-dashboard"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setIsOpen(false);
                          }}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li className="logout-in-profile">
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowProfileDropdown(false);
                            setIsOpen(false);
                          }}
                          className="logout-btn"
                        >
                          <i className="fa-solid fa-right-from-bracket"></i>{" "}
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/dashboard?tab=overview"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setIsOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-gauge"></i> Overview
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard?tab=servers"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setIsOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-server"></i> My Servers
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard?tab=billing"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setIsOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-credit-card"></i> Billing
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard?tab=support"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setIsOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-headset"></i> Support
                          Tickets
                        </Link>
                      </li>
                      <li className="logout-in-profile">
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowProfileDropdown(false);
                            setIsOpen(false);
                          }}
                          className="logout-btn"
                        >
                          <i className="fa-solid fa-right-from-bracket"></i>{" "}
                          Logout
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </li>
          )}

          {user && (
            <li className="logout-item logout-mobile">
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="logout-btn"
              >
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </li>
          )}

          {!user && (
            <li className="mobile-login-menu-item">
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setIsOpen(false);
                }}
                className="login-btn mobile-login-menu-button"
                style={{
                  background: "#673de6",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Login
              </button>
            </li>
          )}
        </div>
      </nav>

      {/*================== منبثقة تسجيل الدخول الاحترافية المزودة بالعين السحرية ==================*/}
      {showLoginModal && (
        <div
          className="login-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(30, 27, 75, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="login-modal-content"
            style={{
              background: "#fff",
              padding: "35px",
              borderRadius: "12px",
              width: "360px",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <h3
              style={{
                marginTop: 0,
                color: "#1e1b4b",
                fontWeight: "700",
                fontSize: "1.6rem",
                marginBottom: "8px",
              }}
            >
              Welcome Back
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.85rem",
                marginBottom: "25px",
              }}
            >
              Sign in to manage your ServerGo cloud infrastructure.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f5f3ff",
                  borderRadius: "6px",
                  border: "1px solid #ede9fe",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <i
                  className="fa-solid fa-envelope"
                  style={{ color: "#64748b", marginRight: "10px" }}
                ></i>
                <input
                  type="email"
                  placeholder="Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "#1e1b4b",
                    fontSize: "0.95rem",
                  }}
                  required
                />
              </div>

              {/* حقل الباسورد التفاعلي المطور مع زر تبديل الرؤية */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f5f3ff",
                  borderRadius: "6px",
                  border: "1px solid #ede9fe",
                  padding: "12px",
                  marginBottom: "20px",
                  position: "relative",
                }}
              >
                <i
                  className="fa-solid fa-lock"
                  style={{ color: "#64748b", marginRight: "10px" }}
                ></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "#1e1b4b",
                    fontSize: "0.95rem",
                    paddingRight: "35px",
                  }}
                  required
                />
                {/* أيقونة العين السحرية لقراءة الحقل بوضوح */}
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "15px",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    zIndex: 10,
                  }}
                ></i>
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  display: "block",
                  margin: "-10px 0 18px auto",
                  padding: 0,
                  border: "none",
                  background: "none",
                  color: "#673de6",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                Forgot password?
              </button>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#673de6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  marginBottom: "15px",
                }}
              >
                Sign In
              </button>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  marginTop: "15px",
                }}
              >
                Don't have an account?{" "}
                <span
                  onClick={handleGoToRegister}
                  style={{
                    color: "#673de6",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Create Account
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
