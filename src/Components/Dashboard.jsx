import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./dashboard.css";
import orderService from "../services/orderService";
import serverService from "../services/serverService";
import contactService from "../services/contactService";
import userService from "../services/userService";
const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // 1. جلب حساب المستخدم المسجل حالياً ديناميكياً
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("servergo_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [myStats, setMyStats] = useState({
    totalBought: 0,
    totalRented: 0,
    boughtPackages: [],
    rentedPackages: [],
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // حماية الصفحة من الزوار
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // جلب إحصائيات المستخدم من الـ Backend
  useEffect(() => {
    const fetchMyStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const response = await orderService.getMyStats();

        setMyStats({
          totalBought: response?.data?.totalBought ?? 0,
          totalRented: response?.data?.totalRented ?? 0,
          boughtPackages: response?.data?.boughtPackages ?? [],
          rentedPackages: response?.data?.rentedPackages ?? [],
        });
      } catch (error) {
        console.error("Failed to fetch my stats:", error);

        setStatsError(
          error?.response?.data?.message ||
            "Failed to load account statistics.",
        );
      } finally {
        setStatsLoading(false);
      }
    };

    if (currentUser) {
      fetchMyStats();
    }
  }, [currentUser]);
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError("");

        const response = await orderService.getMyOrders();

        const fetchedOrders = Array.isArray(response?.data?.orders)
          ? response.data.orders
          : [];

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch my orders:", error);

        setOrdersError(
          error?.response?.data?.message || "Failed to load your orders.",
        );

        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (currentUser) {
      fetchMyOrders();
    }
  }, [currentUser]);

  // قراءة التبويب القادم من روابط الـ Navbar بشكل تلقائي
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  // الـ States المطلوبة لربط الدعم الفني الحقيقي من داخل الداشبورد
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketsList, setTicketsList] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // ==== بيانات البروفايل (Update Me + رفع الصورة) ====
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(
    currentUser?.photo && currentUser.photo !== "default.jpg"
      ? currentUser.photo
      : "",
  );
  const [profileSaving, setProfileSaving] = useState(false);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Image too large",
        text: "Please choose an image smaller than 2MB.",
        confirmButtonColor: "#673de6",
      });
      return;
    }

    setProfilePhoto(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleProfileUpdate = async () => {
    if (!profileName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name required",
        text: "Please enter your full name.",
        confirmButtonColor: "#673de6",
      });
      return;
    }

    if (!profileEmail.includes("@")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#673de6",
      });
      return;
    }

    try {
      setProfileSaving(true);

      // مع صورة نستخدم updateMeAndUpload، وبدونها updateMe العادي
      const response = profilePhoto
        ? await userService.updateMeWithPhoto({
            name: profileName.trim(),
            email: profileEmail.trim(),
            photo: profilePhoto,
          })
        : await userService.updateMe({
            name: profileName.trim(),
            email: profileEmail.trim(),
          });

      const updated = response?.data?.user;

      if (updated) {
        const nextUser = {
          ...currentUser,
          name: updated.name,
          email: updated.email,
          photo: updated.photo,
        };

        localStorage.setItem("servergo_user", JSON.stringify(nextUser));
        setCurrentUser(nextUser);
        setProfilePreview(
          updated.photo && updated.photo !== "default.jpg" ? updated.photo : "",
        );
      }

      setProfilePhoto(null);

      Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your account details were saved successfully.",
        confirmButtonColor: "#673de6",
      });
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error?.response?.data || error?.message,
      );

      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error?.response?.data?.message || "Failed to update your profile.",
        confirmButtonColor: "#fd0d11",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // const [ticketsList, setTicketsList] = useState(() => {
  //   const savedTickets = localStorage.getItem("servergo_admin_tickets");
  //   return savedTickets ? JSON.parse(savedTickets) : [];
  // });

  // Shandy Add 1
  const [myServers, setMyServers] = useState([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [serversError, setServersError] = useState("");

  // 3. سجل الفواتير والمدفوعات الحقيقية المربوطة بمشتريات العميل الفعلي
  // Edite by Shandy
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState("");
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  // End Edit by Shandy
  useEffect(() => {
    const fetchMyServers = async () => {
      try {
        setServersLoading(true);
        setServersError("");

        const response = await serverService.getMyServers();

        setMyServers(response?.data?.servers || []);
      } catch (error) {
        console.error("Failed to fetch my servers:", error);

        setServersError(
          error?.response?.data?.message || "Failed to load your servers.",
        );
      } finally {
        setServersLoading(false);
      }
    };

    if (currentUser) {
      fetchMyServers();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchMyInvoices = async () => {
      try {
        setInvoicesLoading(true);
        setInvoicesError("");

        const response = await orderService.getMyInvoices();

        console.log("🧾 MY INVOICES:", response);

        const backendInvoices = Array.isArray(response?.data?.orders)
          ? response.data.orders
          : [];
        const totalPaid = backendInvoices.reduce((sum, order) => {
          const orderTotal = (order.item || []).reduce(
            (itemSum, item) => itemSum + Number(item.price || 0),
            0,
          );

          return sum + orderTotal;
        }, 0);

        setTotalPaidAmount(totalPaid);

        const formattedInvoices = backendInvoices.map((order) => {
          const totalAmount = (order.item || []).reduce(
            (sum, item) => sum + Number(item.price || 0),
            0,
          );

          return {
            id: order._id,
            date: order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "N/A",
            amount: `$${totalAmount.toLocaleString()}`,
          };
        });

        setInvoices(formattedInvoices);
      } catch (error) {
        console.error("Failed to fetch my invoices:", error);

        setInvoicesError(
          error?.response?.data?.message || "Failed to load your invoices.",
        );

        setInvoices([]);
      } finally {
        setInvoicesLoading(false);
      }
    };

    if (currentUser) {
      fetchMyInvoices();
    }
  }, [currentUser]);
  useEffect(() => {
    const fetchMyContacts = async () => {
      try {
        setTicketsLoading(true);
        setTicketsError("");

        const response = await contactService.getMyContacts();

        setTicketsList(response?.data?.contacts || []);
      } catch (error) {
        console.error("Failed to fetch my contacts:", error);

        setTicketsError(
          error?.response?.data?.message ||
            "Failed to load your support tickets.",
        );
      } finally {
        setTicketsLoading(false);
      }
    };

    if (currentUser) {
      fetchMyContacts();
    }
  }, [currentUser]);
  // End Add Shandy

  // حساب المجموع المالي الكلي المدفوع للفواتير الحقيقية تلقائياً

  // إحصائيات عامة ديناميكية وتتغير تلقائياً حسب مصفوفات العميل الحية
  const stats = {
    servers: myServers.length,
    orders: orders.length,
    tickets: ticketsList.length,

    uptime: myServers.length > 0 ? "99.9%" : "0.0%",

    status: currentUser ? "Active Client 🟢" : "Guest",
  };

  // رسالة واحدة تجمع أخطاء التحميل بدل ترك الحالات معرّفة بدون استخدام
  const dashboardError =
    ordersError || statsError || serversError || invoicesError || "";

  const dashboardLoading =
    ordersLoading || statsLoading || serversLoading || invoicesLoading;

  const sortedServers = [...myServers].sort((a, b) => {
    const aStatus = a.server?.status === "maintenance" ? 0 : 1;
    const bStatus = b.server?.status === "maintenance" ? 0 : 1;
    return aStatus - bStatus;
  });

  // دالة إنشاء تذكرة دعم فني جديدة من داخل لوحة التحكم وإرسالها للآدمن فوراً
  const handleCreateTicket = async () => {
    if (!ticketMessage.trim()) {
      Swal.fire({
        icon: "error",
        title: "عذراً",
        text: "يرجى كتابة الرسالة أولاً.",
        confirmButtonColor: "#673de6",
      });
      return;
    }

    try {
      const response = await contactService.createContact(ticketMessage.trim());

      const createdContact = response?.data?.contact;

      if (createdContact) {
        setTicketsList((previousTickets) => [
          createdContact,
          ...previousTickets,
        ]);
      }

      Swal.fire({
        icon: "success",
        title: "تم فتح التذكرة بنجاح! 🎧",
        text: "وصلت رسالتك لفريق الإدارة وجاري مراجعتها.",
        confirmButtonColor: "#673de6",
      });

      setTicketMessage("");
    } catch (error) {
      console.error("Failed to create contact:", error);

      Swal.fire({
        icon: "error",
        title: "فشل إرسال التذكرة",
        text: error?.response?.data?.message || "حدث خطأ أثناء إرسال التذكرة.",
        confirmButtonColor: "#673de6",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    const errors = {
      current: !currentPassword
        ? "Current password is required."
        : currentPassword.length < 8
          ? "Password must be at least 8 characters long."
          : "",

      new: !newPassword
        ? "New password is required."
        : newPassword.length < 8
          ? "Password must be at least 8 characters long."
          : "",

      confirm: !confirmPassword
        ? "Please confirm your new password."
        : confirmPassword.length < 8
          ? "Password must be at least 8 characters long."
          : newPassword !== confirmPassword
            ? "Passwords do not match."
            : "",
    };

    setPasswordErrors(errors);

    if (errors.current || errors.new || errors.confirm) {
      return;
    }

    try {
      await userService.updateMyPassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({
        current: "",
        new: "",
        confirm: "",
      });

      Swal.fire({
        icon: "success",
        title: "Security Updated",
        text: "Password changed successfully.",
        confirmButtonColor: "#673de6",
      });
    } catch (error) {
      console.error(
        "❌ PASSWORD UPDATE ERROR:",
        error?.response?.data || error?.message,
      );

      const message =
        error?.response?.data?.message || "Failed to change password.";

      setPasswordErrors((previousErrors) => ({
        ...previousErrors,
        current: message,
      }));

      Swal.fire({
        icon: "error",
        title: "Password Update Failed",
        text: message,
        confirmButtonColor: "#673de6",
      });
    }
  };
  // توليد الحرفين الأولين من الاسم ديناميكياً للـ Avatar الجانبي بدقة مليمترية
  const getAvatarLetters = () => {
    if (!currentUser || !currentUser.name) return "US";
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return currentUser.name.substring(0, 2).toUpperCase();
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-container">
      {/* ================= 👤 السايدبار الاحترافي الديناميكي للمستخدم ================= */}
      <aside className="dashboard-sidebar">
        <div className="user-card-side">
          <div className="avatar-circle">{getAvatarLetters()}</div>
          <div className="user-info-text">
            <h4>{currentUser.name}</h4>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <i className="fa-solid fa-gauge"></i> Overview
          </li>
          <li
            className={activeTab === "servers" ? "active" : ""}
            onClick={() => setActiveTab("servers")}
          >
            <i className="fa-solid fa-server"></i> My Servers
            {stats.servers > 0 && (
              <span className="badge-count-purple">{stats.servers}</span>
            )}
          </li>
          <li
            className={activeTab === "billing" ? "active" : ""}
            onClick={() => setActiveTab("billing")}
          >
            <i className="fa-solid fa-credit-card"></i> Billing
          </li>
          <li
            className={activeTab === "support" ? "active" : ""}
            onClick={() => setActiveTab("support")}
          >
            <i className="fa-solid fa-headset"></i> Support Tickets
            {stats.tickets > 0 && (
              <span className="badge-count-purple">{stats.tickets}</span>
            )}
          </li>
          <li
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            <i className="fa-solid fa-gear"></i> Settings
          </li>
        </ul>
      </aside>

      {/* ================= 🖥️ منطقة عرض البيانات الديناميكية المطهّرة للمهندس العميل ================= */}
      <main className="dashboard-content">
        {dashboardLoading && (
          <p
            style={{
              color: "#64748b",
              fontSize: "0.85rem",
              margin: "0 0 12px",
            }}
          >
            Loading your account data...
          </p>
        )}

        {dashboardError && (
          <p
            style={{
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 14px",
              fontSize: "0.88rem",
              margin: "0 0 16px",
            }}
          >
            {dashboardError}
          </p>
        )}

        {/* 1. Overview */}
        {activeTab === "overview" && (
          <div className="tab-content-section animate-fade">
            <h2 className="welcome-msg">👋 Welcome Back, {currentUser.name}</h2>
            <p className="sub-welcome">
              Here is a real-time overview of your cloud infrastructure.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box">
                  <i className="fa-solid fa-server"></i>
                </div>
                <div className="stat-data">
                  <h3>{statsLoading ? "..." : myStats.totalRented}</h3>
                  <p>Rented Packages</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box">
                  <i className="fa-solid fa-box"></i>
                </div>
                <div className="stat-data">
                  <h3>{statsLoading ? "..." : myStats.totalBought}</h3>
                  <p>Purchased Packages</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <div className="stat-data">
                  <h3>{stats.tickets}</h3>
                  <p>Support Tickets</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div className="stat-data">
                  <h3>{stats.uptime}</h3>
                  <p>Uptime Rate</p>
                </div>
              </div>
            </div>

            <div className="status-banner">
              <span>Account Status:</span>
              <strong className="status-tag">{stats.status}</strong>
            </div>
          </div>
        )}

        {/* 2. My Servers */}
        {activeTab === "servers" && (
          <div className="tab-content-section animate-fade">
            <h2>My Servers</h2>

            <p className="sub-welcome">
              Manage and view your deployed cloud services.
            </p>

            {serversLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px",
                  color: "#64748b",
                }}
              >
                <i
                  className="fa-solid fa-spinner fa-spin"
                  style={{
                    fontSize: "2rem",
                    marginBottom: "15px",
                    display: "block",
                    color: "#673de6",
                  }}
                ></i>
                Loading your servers...
              </div>
            ) : serversError ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#dc2626",
                  background: "#fee2e2",
                  borderRadius: "12px",
                }}
              >
                <i
                  className="fa-solid fa-circle-exclamation"
                  style={{
                    fontSize: "2rem",
                    marginBottom: "10px",
                    display: "block",
                  }}
                ></i>

                {serversError}
              </div>
            ) : sortedServers.length > 0 ? (
              <>
                <h3 className="section-subtitle">Server Monitoring</h3>

                <div className="servers-grid monitoring-grid">
                  {sortedServers.map((item) => {
                    const server = item.server;
                    const pkg = item.package;

                    const serverStatus = server?.status || "offline";

                    const isMaintenance = serverStatus === "maintenance";

                    const isOnline = serverStatus === "online";

                    const statusText = isMaintenance
                      ? "Maintenance"
                      : isOnline
                        ? "Online"
                        : "Offline";

                    const statusColor = isMaintenance
                      ? "#dc2626"
                      : isOnline
                        ? "#16a34a"
                        : "#64748b";

                    const statusBackground = isMaintenance
                      ? "#fee2e2"
                      : isOnline
                        ? "#dcfce7"
                        : "#f1f5f9";

                    return (
                      <div
                        className="server-card"
                        key={`${item.orderId}-${pkg?._id}`}
                      >
                        <div className="server-card-header">
                          <div>
                            <h3>{server?.name || "Cloud Server"}</h3>

                            <small
                              style={{
                                color: "#64748b",
                                fontWeight: "600",
                              }}
                            >
                              {pkg?.name || "Cloud Package"}
                            </small>
                          </div>

                          <span
                            className="server-badge"
                            style={{
                              background: statusBackground,
                              color: statusColor,
                            }}
                          >
                            {statusText}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "8px",
                            marginTop: "15px",
                            fontSize: "0.8rem",
                            color: "#475569",
                          }}
                        >
                          <div>
                            <strong>CPU:</strong>{" "}
                            {server?.cpu || pkg?.cpu || "-"}
                          </div>

                          <div>
                            <strong>RAM:</strong> {pkg?.ram || "-"} GB
                          </div>

                          <div>
                            <strong>Storage:</strong> {pkg?.storage || "-"} GB
                          </div>

                          <div>
                            <strong>Location:</strong> {server?.location || "-"}
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: "15px",
                            paddingTop: "12px",
                            borderTop: "1px solid #e2e8f0",
                            fontSize: "0.78rem",
                            color: "#64748b",
                          }}
                        >
                          <div>
                            <strong>Order status:</strong>{" "}
                            <span
                              style={{
                                color:
                                  item.orderStatus === "active"
                                    ? "#16a34a"
                                    : item.orderStatus === "pending"
                                      ? "#d97706"
                                      : "#64748b",
                                fontWeight: "700",
                              }}
                            >
                              {item.orderStatus}
                            </span>
                          </div>

                          <div style={{ marginTop: "5px" }}>
                            <strong>Plan:</strong>{" "}
                            {item.type === "buy"
                              ? "Lifetime purchase"
                              : "Monthly rental"}
                          </div>

                          {item.type === "rent" && (
                            <div style={{ marginTop: "5px" }}>
                              <strong>Days left:</strong> {item.daysLeft ?? "-"}
                            </div>
                          )}
                        </div>

                        {isMaintenance && (
                          <div
                            style={{
                              marginTop: "12px",
                              background: "#fee2e2",
                              color: "#991b1b",
                              border: "1px solid #fecaca",
                              borderLeft: "4px solid #dc2626",
                              borderRadius: "8px",
                              padding: "10px 12px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                            }}
                          >
                            <i
                              className="fa-solid fa-circle-exclamation"
                              style={{ marginRight: "6px" }}
                            ></i>
                            This server is currently under maintenance.
                            {server?.maintenanceEndTime && (
                              <div style={{ marginTop: "5px" }}>
                                Expected recovery:{" "}
                                {new Date(
                                  server.maintenanceEndTime,
                                ).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  padding: "50px",
                  background: "#f5f3ff",
                  borderRadius: "12px",
                  border: "1px dashed #673de6",
                }}
              >
                <i
                  className="fa-solid fa-server-slash"
                  style={{
                    fontSize: "2.5rem",
                    color: "#8b5cf6",
                    marginBottom: "15px",
                    display: "block",
                  }}
                ></i>

                <h3>No Servers Found</h3>

                <p style={{ fontSize: "0.9rem" }}>
                  You haven't purchased or rented any cloud services yet.
                </p>

                <button
                  className="btn-back-shop"
                  onClick={() => navigate("/servers")}
                  style={{
                    background: "#673de6",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginTop: "10px",
                  }}
                >
                  Browse Plans Now <i className="fa-solid fa-server"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Billing */}
        {activeTab === "billing" && (
          <div className="tab-content-section animate-fade">
            <h2>Billing & Invoices</h2>
            <p className="sub-welcome">
              Track your expenses and download statements.
            </p>

            <div className="billing-summary-card">
              <div className="summary-item">
                <p>Total Paid Amount</p>
                <h2>${totalPaidAmount}.00</h2>
              </div>
            </div>

            <h3 className="section-subtitle">Payment History</h3>
            <div className="table-responsive">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice ID</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? (
                    invoices.map((inv, index) => (
                      <tr key={index}>
                        <td>{inv.date}</td>
                        <td style={{ color: "#673de6", fontWeight: "600" }}>
                          {inv.id}
                        </td>
                        <td>{inv.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          color: "#64748b",
                          padding: "30px",
                        }}
                      >
                        No invoice data found for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Support Tickets */}
        {activeTab === "support" && (
          <div className="tab-content-section animate-fade">
            <h2>Support Tickets</h2>
            <p className="sub-welcome">
              Need help? Open a ticket or view past requests.
            </p>

            <div className="support-split">
              {/* نموذج فتح تذكرة، الدالة كانت مكتوبة بدون واجهة تستدعيها */}
              <div
                className="settings-card-box"
                style={{ marginBottom: "20px" }}
              >
                <h3>Open a New Ticket</h3>

                <div className="dash-input-group">
                  <label>Message</label>
                  <textarea
                    rows="5"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue and include any error messages..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd6fe",
                      fontFamily: "inherit",
                      fontSize: "0.9rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  className="btn-save-settings"
                  onClick={handleCreateTicket}
                  disabled={ticketsLoading}
                >
                  Submit Ticket
                </button>
              </div>

              <div className="tickets-history-list">
                <h3>Ticket History</h3>

                {ticketsLoading && (
                  <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Loading your tickets...
                  </p>
                )}

                {ticketsError && (
                  <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>
                    {ticketsError}
                  </p>
                )}
                {ticketsList.length > 0 ? (
                  ticketsList.map((ticket) => (
                    <div className="ticket-item-card" key={ticket._id}>
                      <div
                        className="ticket-meta"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span className="ticket-number">#{ticket._id}</span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "#475569",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <i className="fa-solid fa-calendar-days"></i>
                          <b>
                            {ticket.createdAt
                              ? new Date(ticket.createdAt).toLocaleDateString()
                              : "Unknown date"}
                          </b>
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginTop: "10px",
                        }}
                      >
                        {ticket.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      padding: "30px",
                      background: "#f5f3ff",
                      borderRadius: "8px",
                    }}
                  >
                    <i
                      className="fa-solid fa-envelope-open"
                      style={{
                        fontSize: "1.5rem",
                        marginBottom: "8px",
                        display: "block",
                        color: "#8b5cf6",
                      }}
                    ></i>
                    No tickets submitted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Settings */}
        {activeTab === "settings" && (
          <div className="tab-content-section animate-fade">
            <h2>Account Settings</h2>
            <p className="sub-welcome">
              Update your personal information and profile configurations.
            </p>

            <div className="settings-grid-layout">
              <div className="settings-card-box">
                <h3>Personal Information</h3>

                {/* صورة البروفايل مربوطة بـ PATCH /users/updateMeAndUpload */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "#ede9fe",
                      color: "#673de6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      (currentUser.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="profile-photo-input"
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "#673de6",
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-camera"></i> Change photo
                    </label>

                    <input
                      id="profile-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                    />

                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "0.78rem",
                        color: "#64748b",
                      }}
                    >
                      JPG or PNG, up to 2MB.
                    </p>
                  </div>
                </div>

                <div className="dash-input-row">
                  <div className="dash-input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                  <div className="dash-input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn-save-settings"
                  onClick={handleProfileUpdate}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save"}
                </button>
              </div>

              <div className="settings-card-box">
                <h3>Security & Password</h3>
                <div className="dash-input-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  {passwordErrors.current && (
                    <small style={{ color: "#dc2626", fontSize: "0.75rem" }}>
                      {passwordErrors.current}
                    </small>
                  )}
                </div>
                <div className="dash-input-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={9}
                    required
                  />
                  {passwordErrors.new && (
                    <small style={{ color: "#dc2626", fontSize: "0.75rem" }}>
                      {passwordErrors.new}
                    </small>
                  )}
                </div>
                <div className="dash-input-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={9}
                    required
                  />
                  {passwordErrors.confirm && (
                    <small style={{ color: "#dc2626", fontSize: "0.75rem" }}>
                      {passwordErrors.confirm}
                    </small>
                  )}
                </div>
                <button
                  className="btn-save-settings"
                  onClick={handlePasswordUpdate}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
