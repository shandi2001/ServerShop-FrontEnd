import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./admin_dashboard.css";
import contactService from "../services/contactService";
import orderService from "../services/orderService";
import serverService from "../services/serverService";
import userService from "../services/userService";
import packageService from "../services/packageService";
import reviewService from "../services/reviewService";
import API from "../api/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminTab, setAdminTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);
  const [serversList, setServersList] = useState([]);
  const [serversLoading, setServersLoading] = useState(true);
  const [serversError, setServersError] = useState("");
  const [memoryByType, setMemoryByType] = useState({});
  useEffect(() => {
    const savedUser = localStorage.getItem("servergo_user");

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse current user:", error);
        setCurrentUser(null);
      }
    }
  }, []);

  // داخل مكون AdminDashboard
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalServers: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        // استدعاء مسار الإحصائيات الإداري المخصص
        const res = await API.get("/admin/global-analytics");
        if (res.data && res.data.data) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error("❌ GLOBAL ANALYTICS ERROR:", err);
        console.error("❌ ERROR RESPONSE:", err?.response?.data);
        console.error("❌ ERROR STATUS:", err?.response?.status);
        console.error("❌ GLOBAL ANALYTICS ERROR:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchGlobalAnalytics();
  }, []);

  // إيرادات آخر 6 أشهر، مصدر المخطط بدل القيم الثابتة القديمة
  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        setRevenueLoading(true);

        const res = await API.get("/admin/revenue-monthly");

        setRevenueSeries(
          Array.isArray(res?.data?.data?.series) ? res.data.data.series : [],
        );
      } catch (err) {
        console.error("MONTHLY REVENUE ERROR:", err?.response?.data || err);
        setRevenueSeries([]);
      } finally {
        setRevenueLoading(false);
      }
    };

    fetchMonthlyRevenue();
  }, []);
  // === حالات الفلترة المحدثة لإدارة الباقات والعقود الثلاثية ===
  // القيم هنا لازم تطابق أسماء الـ Type بقاعدة البيانات تماماً
  const [typeFilter, setTypeFilter] = useState("VPS");
  const [dealFilter, setDealFilter] = useState("economic");
  const [contractFilter, setContractFilter] = useState("monthly");

  // حماية لوحة التحكم: التحقق من رتبة المستخدم وطرد الحسابات العادية فوراً
  useEffect(() => {
    const savedUser = localStorage.getItem("servergo_user");
    if (!savedUser) {
      navigate("/");
      return;
    }
    const user = JSON.parse(savedUser);
    if (user.role !== "ADMIN") {
      navigate("/");
    }
  }, [navigate]);

  // 1. جلب التقييمات والمراجعات الحقيقية بالكامل من الـ LocalStorage (بدون أي تعليق وهمي)
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser || currentUser.role !== "ADMIN") return;

      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await reviewService.getAllReviews();

        // handlerFactory.getAll always answers { status, results, doc }
        setUserReviews(Array.isArray(response?.doc) ? response.doc : []);
      } catch (error) {
        console.error(
          "❌ ADMIN REVIEWS ERROR:",
          error?.response?.data || error?.message,
        );

        setUserReviews([]);

        setReviewsError(
          error?.response?.data?.message || "Failed to load reviews.",
        );
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser]);
  // 2. جلب مصفوفة المستخدمين الحقيقية المسجلة بالموقع
  // قومي بإلغاء أو حذف السطر الثابت القديم إن وجد، وضعي هذا التعريف التفاعلي والدالة مكانه:
  const [usersList, setUsersList] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();

        setUsersList(Array.isArray(data?.doc) ? data.doc : []);
      } catch (err) {
      }
    };

    if (adminTab === "users") {
      fetchUsers();
    }
  }, [adminTab]);

  const handleToggleBan = async (userId, currentActive) => {
    try {
      if (currentActive) {
        await userService.banUser(userId);
      } else {
        await userService.unbanUser(userId);
      }

      setUsersList((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? { ...user, active: !user.active } : user,
        ),
      );

      Swal.fire(
        "Updated!",
        "User account status changed successfully.",
        "success",
      );
    } catch (error) {
      console.error("Failed to update user status:", error);

      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to update user status.",
        "error",
      );
    }
  };

  // 3. جلب سجل المبيعات والطلبات الواردة الحقيقية من صفحة الدفع
  // Add Shandy
  const [pendingOrders, setPendingOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  useEffect(() => {
    const fetchAdminOrders = async () => {
      if (!currentUser || currentUser.role !== "ADMIN") return;

      try {
        setOrdersLoading(true);

        const ordersResponse = await orderService.getAllOrders();

        const allOrders = Array.isArray(ordersResponse?.data?.orders)
          ? ordersResponse.data.orders
          : [];

        setPendingOrders(
          allOrders.filter((order) => order.status === "pending"),
        );
      } catch (error) {
        console.error(
          "❌ ADMIN ORDERS ERROR:",
          error?.response?.data || error?.message,
        );

        setPendingOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchAdminOrders();
  }, [currentUser]);

  // End Add Shandy
  // 4. جلب تذاكر الدعم الفني الحقيقية المفتوحة من العميل
  const [incomingTickets, setIncomingTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  useEffect(() => {
    const fetchIncomingTickets = async () => {
      try {
        setTicketsLoading(true);
        setTicketsError("");

        const response = await contactService.getAllContacts();

        setIncomingTickets(Array.isArray(response?.doc) ? response.doc : []);
      } catch (error) {
        console.error("Failed to fetch admin contacts:", error);

        setTicketsError(
          error?.response?.data?.message || "Failed to load support tickets.",
        );
      } finally {
        setTicketsLoading(false);
      }
    };

    fetchIncomingTickets();
  }, []);

  // 5. جلب السيرفرات الحقيقية (مطلوبة لقائمة "Target Server" ولبطاقات الكلاسترات)
  useEffect(() => {
    const loadServers = async () => {
      try {
        setServersLoading(true);
        setServersError("");

        const res = await serverService.getAllServers();

        setServersList(Array.isArray(res?.data?.doc) ? res.data.doc : []);
      } catch (error) {
        console.error("Failed to load servers:", error);

        setServersList([]);
        setServersError(
          error?.response?.data?.message || "Failed to load servers.",
        );
      } finally {
        setServersLoading(false);
      }
    };

    loadServers();
  }, []);

  // 6. استهلاك الذاكرة والتخزين الحقيقي لكل نوع سيرفر (مسار إداري جاهز بالباك)
  useEffect(() => {
    const loadMemory = async () => {
      try {
        const res = await API.get("/servers/memory-by-type");

        setMemoryByType(res?.data?.data?.result || {});
      } catch (error) {
        console.error("Failed to load memory usage:", error);
        setMemoryByType({});
      }
    };

    loadMemory();
  }, []);

  // 7. جلب الباقات المتاحة الحقيقية بالموقع
  const [globalCatalog, setGlobalCatalog] = useState([]);

  const loadPackages = async () => {
    try {
      const res = await packageService.getAllPackages();

      const docs = res?.data?.doc;

      setGlobalCatalog(Array.isArray(docs) ? docs.filter(Boolean) : []);
    } catch (error) {
      console.error("Failed to load packages:", error);
      setGlobalCatalog([]);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  /*
   * Package -> Server -> Type name.
   *
   * serverId is a populated object for ADMIN responses and a plain ObjectId
   * otherwise, so normalize before looking the server up.
   */
  const serverById = serversList.reduce((acc, server) => {
    acc[String(server._id)] = server;
    return acc;
  }, {});

  const getServerOf = (pkg) => {
    const id = String(pkg?.serverId?._id ?? pkg?.serverId ?? "");
    return serverById[id] || null;
  };

  const getTypeNameOf = (pkg) => {
    const server = getServerOf(pkg);
    return server?.typeId?.name || pkg?.serverId?.typeId?.name || "";
  };

  // الأرباح الحقيقية من مسار الإحصائيات الإداري، بدل قيمة ابتدائية ثابتة
  // هندسة المخطط محسوبة من البيانات، فالنقاط والمحور دائماً متطابقين
  const revenuePeak = Math.max(0, ...revenueSeries.map((p) => p.revenue));
  const revenueAxisMax = revenuePeak > 0 ? Math.ceil(revenuePeak * 1.15) : 100;

  const revenuePoints = revenueSeries.map((point, index) => {
    const ratio = point.revenue / revenueAxisMax;
    const previous = index > 0 ? revenueSeries[index - 1].revenue : null;

    const change =
      previous === null || previous === 0
        ? null
        : ((point.revenue - previous) / previous) * 100;

    return {
      ...point,
      // نترك 6% فراغ فوق وتحت حتى لا تلتصق النقاط بحواف الرسم
      bottomPercent: 6 + ratio * 88,
      x: ((index + 0.5) / Math.max(1, revenueSeries.length)) * 100,
      y: 100 - (6 + ratio * 88),
      change,
    };
  });

  const revenueAxisTicks = [1, 0.75, 0.5, 0.25, 0].map((factor) =>
    Math.round(revenueAxisMax * factor),
  );

  /*
   * Real capacity for the selected cluster.
   *
   * Comes from GET /servers/memory-by-type, which aggregates the actual
   * totalRam / usedRam / totalStorage / usedStorage of every server of a type.
   * The previous version summed the advertised catalog specs against hardcoded
   * ceilings, which produced negative "free" values and percentages over 100%.
   */
  const getDynamicCapacity = () => {
    const typeKeys =
      typeFilter === "all" ? Object.keys(memoryByType) : [typeFilter];

    const sum = (field) =>
      typeKeys.reduce(
        (total, key) => total + Number(memoryByType[key]?.[field] || 0),
        0,
      );

    const totalRam = sum("totalRam");
    const usedRam = sum("usedRam");
    const totalStorage = sum("totalStorage");
    const usedStorage = sum("usedStorage");

    // CPU is a model string on the server (e.g. "AMD EPYC 7402"), not a core
    // count, so we report how many nodes of this type are online instead.
    const clusterServers = serversList.filter(
      (server) =>
        typeFilter === "all" || server?.typeId?.name === typeFilter,
    );

    const onlineNodes = clusterServers.filter(
      (server) => server.status === "online",
    ).length;

    const percent = (used, total) =>
      total > 0 ? `${Math.round((used / total) * 100)}%` : "0%";

    return {
      storage: {
        total: `${totalStorage}GB`,
        used: `${usedStorage}GB`,
        free: `${Math.max(0, totalStorage - usedStorage)}GB`,
        percent: percent(usedStorage, totalStorage),
      },
      ram: {
        total: `${totalRam}GB`,
        used: `${usedRam}GB`,
        free: `${Math.max(0, totalRam - usedRam)}GB`,
        percent: percent(usedRam, totalRam),
      },
      cpu: {
        total: `${clusterServers.length} Nodes`,
        used: `${onlineNodes} Online`,
        free: `${clusterServers.length - onlineNodes} Offline`,
        percent: percent(onlineNodes, clusterServers.length),
      },
    };
  };

  const serverCapacity = getDynamicCapacity();

  // معادلة حساب متوسط النجوم الإجمالي لتقييمات العملاء الفعليين برمجياً
  const averageRating =
    userReviews.length > 0
      ? (
          userReviews.reduce(
            (sum, review) => sum + Number(review.rate || 0),
            0,
          ) / userReviews.length
        ).toFixed(1)
      : "0.0";

  // دالة الموافقة وتفعيل السيرفرات للعميل وتوليد فواتيره تلقائياً مع محاكاة إرسال الإيميل التلقائي
  const handleApproveOrder = (
    orderId,
    clientName,
    serviceName,
    dealType,
    amount,
    date,
  ) => {
    Swal.fire({
      title: "Approve & Activate Server?",
      text: `Confirm financial clearance for ${clientName}. This action immediately deploys their active node context.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve & Provision",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Provisioning Virtual Node...",
        text: `Activating ${serviceName || "Instance"}.`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // تغيير حالة الطلب الحقيقية في MongoDB
        await orderService.updateOrderStatus(orderId, "active");

        const ordersResponse = await orderService.getAllOrders();

        const allOrders = Array.isArray(ordersResponse?.data?.orders)
          ? ordersResponse.data.orders
          : [];

        setPendingOrders(allOrders.filter((o) => o.status === "pending"));

        Swal.fire({
          title: "Provisioned Successfully! 🎉",
          html: `
          <div style="text-align: left; font-size: 0.9rem; color: #475569; padding: 5px;">
            <p>Active subscription log shared with the user profile.</p>
            <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0;"/>
            <p style="color: #15803d; font-weight: 600; margin-bottom: 5px;">
              ✅ Order status updated successfully.
            </p>
            <p style="color: #673de6; font-weight: 600;">
              🔔 Notification sent to the client.
            </p>
          </div>
        `,
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      } catch (error) {
        console.error("FAILED ACTIVATION RESPONSE:", error?.response?.data);

        console.error("FAILED ACTIVATION STATUS:", error?.response?.status);

        console.error("FAILED ACTIVATION ERROR:", error);

        Swal.fire({
          title: "Activation Failed",
          text:
            error?.response?.data?.message || "Failed to activate the order.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    });
  };
  // 🌟 دالة أرشفة وإغلاق التذكرة الفورية بعد المعاينة بدون رد 🌟
  const handleArchiveTicket = (id) => {
    Swal.fire({
      title: "Close & Archive Ticket?",
      text: "Are you sure you want to resolve and permanently archive this support record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#15803d",
      confirmButtonText: "Yes, Archive It",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await contactService.deleteContact(id);

        setIncomingTickets((prev) =>
          prev.filter((ticket) => ticket._id !== id),
        );

        Swal.fire(
          "Archived!",
          "The support ticket has been closed successfully.",
          "success",
        );
      } catch (error) {
        console.error("Failed to archive contact:", error);

        Swal.fire(
          "Error",
          error?.response?.data?.message ||
            "Failed to archive the support ticket.",
          "error",
        );
      }
    });
  };
  // دالة حذف المراجعات والتقييمات
  const handleDeleteReview = (id) => {
    Swal.fire({
      title: "Delete Review?",
      text: "This review will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await reviewService.deleteReview(id);

        setUserReviews((prev) => prev.filter((review) => review._id !== id));

        Swal.fire("Deleted!", "Review deleted successfully.", "success");
      } catch (error) {
        console.error(
          "❌ DELETE REVIEW ERROR:",
          error?.response?.data || error?.message,
        );

        Swal.fire(
          "Error",
          error?.response?.data?.message || "Failed to delete review.",
          "error",
        );
      }
    });
  };

  /*
   * ===  جرد الباقات حسب الكلاستر المختار ===
   *
   * المطابقة صارت على اسم الـ Type الحقيقي بدل البحث النصي داخل أسماء
   * السيرفرات والباقات، لأن ذاك كان يطابق أكثر من فلتر بنفس الوقت ولا يطابق
   * أي شيء عند الضغط على بطاقات الكلاسترات.
   */
  const filteredPackages = globalCatalog.filter((p) => {
    if (!p) return false;

    const matchesType = typeFilter === "all" || getTypeNameOf(p) === typeFilter;

    const category = (p.category || "").toLowerCase();
    const selectedTier = (dealFilter || "all").toLowerCase();
    const matchesTier = selectedTier === "all" || category === selectedTier;

    // الباك عنده ثلاث قيم: monthly / yearly / purchase — بدون دمج
    const durationType = (p.durationType || "").toLowerCase();
    const selectedContract = (contractFilter || "all").toLowerCase();
    const matchesContract =
      selectedContract === "all" || durationType === selectedContract;

    return matchesType && matchesTier && matchesContract;
  });

  // دالة خروج الأدمن الذكية: توجه العميل أولاً للرئيسية مع تمرير إشارة طلب الخروج في الرابط
  const handleAdminLogout = () => {
    window.location.href = "/?action=logout";
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-container">
        {/* ================= 🛠️ سايدبار مدير النظام الفخم على جهة اليسار ================= */}
        <aside className="admin-sidebar">
          {/* كرت هوية المشرف الأعلى للنظام */}
          <div className="admin-card-side">
            <div className="admin-avatar-circle">
              <i className="fa-solid fa-user-gear"></i>
            </div>
            <div className="admin-info-text">
              <h4>System Administrator</h4>
              <p>admin@servergo.com</p>
            </div>
          </div>

          {/* قائمة الروابط الذكية مع تجميعة الـ Item Wrapper لحفظ استقامة الخط */}
          <ul className="admin-menu">
            {/* 1. الإحصائيات العامة */}
            <li
              className={adminTab === "overview" ? "active" : ""}
              onClick={() => setAdminTab("overview")}
            >
              <div className="menu-link-wrapper">
                <i className="fa-solid fa-chart-line"></i>
                <span>Global Analytics Overview</span>
              </div>
            </li>

            {/* 2. السيرفرات الأساسية والشبكة وإدارة الباقات */}
            <li
              className={adminTab === "infrastructure" ? "active" : ""}
              onClick={() => setAdminTab("infrastructure")}
            >
              <div className="menu-link-wrapper">
                <i className="fa-solid fa-microchip"></i>
                <span>Infrastructure & Packages</span>
              </div>
            </li>

            {/* 3. سجل المبيعات والطلبات المعلقة مع فحص العداد الذكي */}
            <li
              className={adminTab === "orders" ? "active" : ""}
              onClick={() => setAdminTab("orders")}
            >
              <div className="menu-link-wrapper">
                <i className="fa-solid fa-receipt"></i>
                <span>Provisioning Request Queue</span>
              </div>
              {pendingOrders.length > 0 && (
                <span className="badge-count-red">{pendingOrders.length}</span>
              )}
            </li>

            {/* 4. إدارة حسابات وجدار حظر العملاء */}
            <li
              className={adminTab === "users" ? "active" : ""}
              onClick={() => setAdminTab("users")}
            >
              <div className="menu-link-wrapper">
                <i className="fa-solid fa-users"></i>
                <span>Access Control Manager</span>
              </div>
            </li>

            {/* 5. تذاكر الدعم الفني المفتوحة */}
            <li
              className={adminTab === "tickets" ? "active" : ""}
              onClick={() => setAdminTab("tickets")}
            >
              <div className="menu-link-wrapper">
                <i className="fa-solid fa-headset"></i>
                <span>Active Desk Tickets</span>
              </div>
              {incomingTickets.length > 0 && (
                <span
                  className="badge-count-red"
                  style={{ backgroundColor: "#ca1f91" }}
                >
                  {incomingTickets.length}
                </span>
              )}
            </li>

            {/* 6. تقييمات المنصة والمراجعات */}
            <li
              className={adminTab === "reviews" ? "active" : ""}
              onClick={() => setAdminTab("reviews")}
            >
              <div className="menu-link-wrapper">
                <i className="fa-solid fa-star"></i>
                <span>Testimonial Moderation</span>
              </div>
            </li>
          </ul>
          {/* زر تسجيل الخروج في نهاية السايدبار - يوجه للرئيسية مع تمرير بارامتر الخروج */}
          <div
            className="admin-sidebar-logout"
            onClick={handleAdminLogout}
            style={{ cursor: "pointer" }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Terminate Admin Session</span>
          </div>
        </aside>
        {/* ================= 🖥️ منطقة العرض الفسيحة للمحتوى المتغير ================= */}
        <main className="admin-content">
          {/* 1. قسم الإحصائيات العامة (Overview Tab) */}
          {adminTab === "overview" && (
            <div className="admin-tab-content animate-fade">
              <h2>
                Management Monitoring Control Console <span>SERVER GO</span>
              </h2>
              <p className="admin-sub-title">
                System-wide operational tracking, monetization streams, and
                execution logs.
                {analyticsLoading && (
                  <span style={{ color: "#64748b" }}> Loading live figures...</span>
                )}
              </p>

              {/* شبكة كروت البيانات الأربعة المترجمة للإنجليزية بالكامل */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-icon-box green">
                    <i className="fa-solid fa-sack-dollar"></i>
                  </div>
                  <div className="admin-stat-data">
                    <h3>
                      ${Number(analytics?.totalRevenue || 0).toLocaleString()}
                    </h3>
                    <p>Aggregated Revenue</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-icon-box purple">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className="admin-stat-data">
                    <h3>
                      {Number(analytics?.totalUsers || 0).toLocaleString()}
                    </h3>
                    <p>Verified Profiles</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-icon-box blue">
                    <i className="fa-solid fa-server"></i>
                  </div>
                  <div className="admin-stat-data">
                    <h3>
                      {Number(analytics?.totalServers || 0).toLocaleString()}
                    </h3>
                    <p>Active Deployments</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-icon-box red">
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <div className="admin-stat-data">
                    <h3>
                      {Number(analytics?.pendingOrders || 0).toLocaleString()}
                    </h3>
                    <p>Unresolved Requests</p>
                  </div>
                </div>
              </div>

              {/* مخطط المبيعات الدوري المطور والمبني بـ CSS النقي المتجاوب */}
              <div
                className="admin-chart-card-bg"
                style={{ marginTop: "30px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "1.1rem",
                        color: "#1e1b4b",
                        fontWeight: "700",
                      }}
                    >
                      Monetization Performance Scaling Trend
                    </h4>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "0.85rem",
                        color: "#888897",
                      }}
                    >
                      Real-time evaluation chart tracing subscription volume
                      across fiscal quarters
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    <i
                      className="fa-solid fa-calendar-days"
                      style={{ marginRight: "5px" }}
                    ></i>{" "}
                    Past 6 Months
                  </div>
                </div>

                {/* مخطط الإيرادات: كل نقطة من GET /admin/revenue-monthly */}
                <div
                  className="new-admin-chart-wrapper"
                  style={{
                    display: "flex",
                    position: "relative",
                    padding: "25px 15px 55px",
                    height: "340px",
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#fff",
                    marginTop: "20px",
                  }}
                >
                  {revenueLoading ? (
                    <p style={{ color: "#64748b", margin: "auto" }}>
                      Loading revenue trend...
                    </p>
                  ) : revenuePoints.length === 0 ? (
                    <p style={{ color: "#64748b", margin: "auto" }}>
                      No completed orders in the last six months yet.
                    </p>
                  ) : (
                    <>
                      <div
                        className="chart-y-axis-labels"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: "220px",
                          width: "68px",
                          paddingRight: "10px",
                          textAlign: "right",
                          fontSize: "0.8rem",
                          color: "#666",
                          fontWeight: "bold",
                          borderRight: "2px solid #cbd5e1",
                          boxSizing: "border-box",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {revenueAxisTicks.map((tick, index) => (
                          <span key={index}>${tick.toLocaleString()}</span>
                        ))}
                      </div>

                      <div
                        className="chart-main-render-area"
                        style={{
                          position: "relative",
                          flex: "1",
                          height: "220px",
                          marginLeft: "10px",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            pointerEvents: "none",
                          }}
                        >
                          {revenueAxisTicks.map((tick, index) => (
                            <div
                              key={index}
                              style={{
                                borderTop:
                                  index === revenueAxisTicks.length - 1
                                    ? "1px solid #cbd5e1"
                                    : "1px dashed #e2e8f0",
                                width: "100%",
                              }}
                            ></div>
                          ))}
                        </div>

                        <svg
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            fill="none"
                            stroke="#ca1f91"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                            points={revenuePoints
                              .map((point) => `${point.x},${point.y}`)
                              .join(" ")}
                          />
                        </svg>

                        <div
                          className="chart-nodes-timeline"
                          style={{
                            display: "flex",
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                            zIndex: 2,
                            boxSizing: "border-box",
                          }}
                        >
                          {revenuePoints.map((point, index) => (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: `${point.bottomPercent}%`,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  transform: "translateY(50%)",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#1e1b4b",
                                    color: "#fff",
                                    padding: "3px 6px",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    transform: "translateY(-24px)",
                                    position: "absolute",
                                    whiteSpace: "nowrap",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  ${point.revenue.toLocaleString()}
                                </div>

                                <div
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    background: "#ca1f91",
                                    border: "2px solid #fff",
                                    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                                    zIndex: 4,
                                  }}
                                ></div>

                                {point.change !== null && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                      marginTop: "4px",
                                      background:
                                        point.change >= 0
                                          ? "#e8f5e9"
                                          : "#ffebee",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      fontSize: "0.7rem",
                                      fontWeight: "bold",
                                      color:
                                        point.change >= 0
                                          ? "#28a745"
                                          : "#dc3545",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <i
                                      className={`fa-solid ${
                                        point.change >= 0
                                          ? "fa-arrow-up"
                                          : "fa-arrow-down"
                                      }`}
                                    ></i>
                                    <span>
                                      {point.change >= 0 ? "+" : ""}
                                      {point.change.toFixed(0)}%
                                    </span>
                                  </div>
                                )}
                              </div>

                              <span
                                style={{
                                  position: "absolute",
                                  top: "230px",
                                  fontWeight: "600",
                                  color: "#4b5563",
                                  fontSize: "0.85rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {point.month}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. قسم مراقبة البنية التحتية وإدارة باقات السيرفرات الحية (Infrastructure Tab) */}
          {adminTab === "infrastructure" && (
            <div className="admin-tab-content animate-fade">
              <header className="admin-tab-header">
                <h2>Data Center Architecture & Instance Repository</h2>
                <p className="admin-sub-title">
                  Monitor dedicated hardware resource allocation, cluster health
                  signals, and select a sector to manage instance catalogs.
                </p>

                {serversLoading && (
                  <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Loading live server data...
                  </p>
                )}

                {serversError && (
                  <p
                    style={{
                      color: "#b91c1c",
                      background: "#fee2e2",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                    }}
                  >
                    {serversError}
                  </p>
                )}
              </header>

              {/* ==================== الشق 1: كروت السيرفرات الأربعة العلوية مع مؤشر الحالة الفوري (تم حذف الباندويث كلياً) ==================== */}
              <div
                className="admin-stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >
                {[
                  { id: "VPS", name: "VPS Nodes Cluster", icon: "fa-server", color: "#8b5cf6" },
                  { id: "VPS-NVMe", name: "VPS-NVMe Hypervisors", icon: "fa-microchip", color: "#673de6" },
                  { id: "Cloud", name: "Cloud Computing Arrays", icon: "fa-cloud", color: "#ca1f91" },
                  { id: "Windows", name: "Windows OS Frameworks", icon: "fa-brands fa-windows", color: "#f59e0b" },
                ]
                  .map((cluster) => {
                    // أرقام حقيقية من السيرفرات ومن مسار memory-by-type
                    const nodes = serversList.filter(
                      (server) => server?.typeId?.name === cluster.id,
                    );

                    const memory = memoryByType[cluster.id] || {};

                    const onlineNodes = nodes.filter(
                      (server) => server.status === "online",
                    ).length;

                    const lastChecked = nodes
                      .map((server) => server.lastChecked)
                      .filter(Boolean)
                      .sort()
                      .pop();

                    return {
                      ...cluster,
                      cpu: `${onlineNodes}/${nodes.length} Nodes online`,
                      ram: `${Number(memory.usedRam || 0)}/${Number(memory.totalRam || 0)}GB`,
                      storage: `${Number(memory.usedStorage || 0)}/${Number(memory.totalStorage || 0)}GB`,
                      status: onlineNodes > 0 ? "Active" : "Suspended",
                      check: lastChecked
                        ? new Date(lastChecked).toLocaleTimeString()
                        : "Never",
                    };
                  })
                  .map((cluster) => (
                  <div
                    key={cluster.id}
                    className={`admin-stat-card ${typeFilter === cluster.id ? "active-cluster" : ""}`}
                    onClick={() => {
                      setTypeFilter(cluster.id);
                    }}
                    style={{
                      cursor: "pointer",
                      border:
                        typeFilter === cluster.id
                          ? `2px solid ${cluster.color}`
                          : "2px solid transparent",
                      transition: "all 0.2s ease",
                      boxShadow:
                        typeFilter === cluster.id
                          ? "0 4px 15px rgba(0,0,0,0.08)"
                          : "none",
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        className="admin-icon-box"
                        style={{
                          backgroundColor: `${cluster.color}15`,
                          color: cluster.color,
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.2rem",
                        }}
                      >
                        <i className={`fa-solid ${cluster.icon}`}></i>
                      </div>
                      <span
                        className="status-badge"
                        style={{
                          fontSize: "0.72rem",
                          padding: "3px 8px",
                          fontWeight: "700",
                          borderRadius: "5px",
                          background:
                            cluster.status === "Active" ? "#dcfce7" : "#fee2e2",
                          color:
                            cluster.status === "Active" ? "#15803d" : "#b91c1c",
                        }}
                      >
                        ● {cluster.status}
                      </span>
                    </div>

                    <div
                      className="admin-stat-data"
                      style={{ marginTop: "5px", width: "100%" }}
                    >
                      <h4
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: "0.95rem",
                          color: "#1e1b4b",
                          fontWeight: "700",
                        }}
                      >
                        {cluster.name}
                      </h4>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                          borderBottom: "1px dashed #e2e8f0",
                          paddingBottom: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <span>
                          <b style={{ color: "#1e1b4b" }}>CPU:</b> {cluster.cpu}
                        </span>
                        <span>
                          <b style={{ color: "#1e1b4b" }}>RAM:</b> {cluster.ram}
                        </span>
                        <span>
                          <b style={{ color: "#1e1b4b" }}>Storage:</b>{" "}
                          {cluster.storage}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.74rem",
                          color: "#64748b",
                        }}
                      >
                        <span>
                          <b>Last Check:</b>
                        </span>
                        <span style={{ color: "#1e1b4b", fontWeight: "600" }}>
                          <i
                            className="fa-regular fa-clock"
                            style={{ marginRight: "3px" }}
                          ></i>
                          {cluster.check}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* ==================== مؤشرات السعة الحقيقية للكلاستر المختار ==================== */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  marginBottom: "20px",
                }}
              >
                {[
                  { key: "ram", label: "Memory Allocation", color: "#673de6" },
                  { key: "storage", label: "Storage Allocation", color: "#ca1f91" },
                  { key: "cpu", label: "Node Availability", color: "#8b5cf6" },
                ].map((meter) => {
                  const data = serverCapacity[meter.key];

                  return (
                    <div key={meter.key}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#1e1b4b",
                          }}
                        >
                          {meter.label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {data.used} / {data.total}
                        </span>
                      </div>

                      <div
                        style={{
                          height: "8px",
                          borderRadius: "4px",
                          background: "#ede9fe",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: data.percent,
                            height: "100%",
                            background: meter.color,
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>

                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "0.76rem",
                          color: "#64748b",
                        }}
                      >
                        {data.percent} used &middot; {data.free} free
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* ==================== الشق 2: لوحة الفلاتر المزدوجة والتحكم الإداري ==================== */}
              {typeFilter && (
                <div
                  className="admin-user-management-card animate-fade"
                  style={{
                    marginTop: "20px",
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.2rem",
                          color: "#1e1b4b",
                          fontWeight: "700",
                        }}
                      >
                        Active Package Inventory:{" "}
                        <span style={{ color: "#ca1f91" }}>{typeFilter}</span>
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "0.82rem",
                          color: "#64748b",
                        }}
                      >
                        Manage localized provisioning variables allocated for
                        this node sector.
                      </p>
                    </div>

                    {/* زر إضافة باقة ذكي ومتطور يدعم التحقق اللحظي لمنع الأسعار السلبية والقوائم المنسدلة للمواصفات بدون باندويث */}
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: `Deploy New [${typeFilter}] Package`,
                          html: `
                  <div class="swal-premium-form">
                    <div class="swal-field-group">
                      <label>Package Display Name</label>
                      <input id="swal-name" class="swal-premium-input" placeholder="e.g. Ultra Cloud Core">
                    </div>
                    <div class="swal-field-row">
                    <div class="swal-field-group">
  <label>Target Server</label>

  <select id="swal-server" class="swal-premium-input">
  <option value="">-- Select Target Server --</option>
  ${serversList.map((server) => `<option value="${server._id}">${server.name}</option>`).join("")}
</select>

</div>
                      <div class="swal-field-group">
                        <label>Rate Target Price ($)</label>
                        <input id="swal-price" class="swal-premium-input" type="number" min="1" placeholder="e.g. 45">
                        <span id="price-error-msg" style="color: #dc3545; font-size: 0.75rem; display: none; margin-top: 4px; font-weight: 600;">* Price must be a positive number greater than 0!</span>
                      </div>
                      <div class="swal-field-group">
                        <label>Package Tier Class</label>
                        <select id="swal-use" class="swal-premium-input">
                          <option value="economic">Economy</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>
                    </div>
                    <div class="swal-field-row">
                    
                      <div class="swal-field-group">
                        <label>Contract License Model</label>
                        <select id="swal-contract" class="swal-premium-input">
                          <option value="monthly">Monthly Rent</option>
                          <option value="yearly">Yearly Rent</option>
                          <option value="purchase">Permanent Buy</option>
                        </select>
                      </div>
                      <div class="swal-field-group">
                        <label>Processor Units (CPU)</label>
                        <select id="swal-cpu" class="swal-premium-input">
                          <option value="1 Core vCPU">1 Core vCPU</option>
                          <option value="2 Cores vCPU">2 Cores vCPU</option>
                          <option value="4 Cores vCPU">4 Cores vCPU</option>
                          <option value="8 Cores vCPU">8 Cores vCPU</option>
                          <option value="16 Cores vCPU">16 Cores vCPU</option>
                          <option value="32 Cores vCPU">32 Cores vCPU</option>
                        </select>
                      </div>
                    </div>
                    <div class="swal-field-row">
                   
                      <div class="swal-field-group">
                        <label>Memory Bounds (RAM)</label>
                        <select id="swal-ram" class="swal-premium-input">
                          <option value="4">4GB RAM</option>
                          <option value="8">8GB RAM</option>
                          <option value="16">16GB RAM</option>
                          <option value="32">32GB RAM</option>
                          <option value="64">64GB RAM</option>
                          <option value="128">128GB RAM</option>
                          <option value="256">256GB RAM</option>
                        </select>
                      </div>
                      <div class="swal-field-group">
                        <label>Storage Size</label>
                        <select id="swal-storage" class="swal-premium-input">
                          <option value="128">128GB NVMe SSD</option>
                          <option value="256">256GB NVMe SSD</option>
                          <option value="512">512GB NVMe SSD</option>
                          <option value="1024">1TB NVMe SSD</option>
                          <option value="2048">2TB NVMe SSD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                `,
                          focusConfirm: false,
                          showCancelButton: true,
                          confirmButtonText: "Deploy Package Layer",
                          confirmButtonColor: "#ca1f91",
                          didOpen: () => {
                            // مستمع أحداث لمراقبة حقل السعر بشكل لحظي وتطبيق الإطار الأحمر والرسالة وتعطيل الحفظ
                            const priceInput =
                              document.getElementById("swal-price");
                            const errorMsg =
                              document.getElementById("price-error-msg");
                            const confirmBtn = Swal.getConfirmButton();

                            priceInput.addEventListener("input", () => {
                              const val = parseFloat(priceInput.value);
                              if (isNaN(val) || val <= 0) {
                                priceInput.style.borderColor = "#dc3545";
                                priceInput.style.boxShadow =
                                  "0 0 0 3px rgba(220, 53, 69, 0.15)";
                                errorMsg.style.display = "block";
                                confirmBtn.setAttribute("disabled", "true");
                              } else {
                                priceInput.style.borderColor = "#ccc";
                                priceInput.style.boxShadow = "none";
                                errorMsg.style.display = "none";
                                confirmBtn.removeAttribute("disabled");
                              }
                            });
                          },
                          preConfirm: () => {
                            const name = document
                              .getElementById("swal-name")
                              .value.trim();
                            const price =
                              document.getElementById("swal-price").value;
                            const useType =
                              document.getElementById("swal-use").value;
                            const contractType =
                              document.getElementById("swal-contract").value;
                            const cpu =
                              document.getElementById("swal-cpu").value;
                            const ram =
                              document.getElementById("swal-ram").value;
                            const storage =
                              document.getElementById("swal-storage").value;

                            // التعبير النمطي للتحقق من وجود أحرف لغوية (إنجليزية أو عربية)
                            const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(
                              name,
                            );

                            if (!name) {
                              Swal.showValidationMessage(
                                "Identity Package Name is required!",
                              );
                              return false;
                            }
                            if (name.length < 3) {
                              Swal.showValidationMessage(
                                "Package Name must be at least 3 characters long!",
                              );
                              return false;
                            }
                            if (!hasLetters) {
                              Swal.showValidationMessage(
                                "Package Name must contain letters (text), not just numbers or symbols!",
                              );
                              return false;
                            }
                            if (!price || parseFloat(price) <= 0) {
                              Swal.showValidationMessage(
                                "A valid positive price is required!",
                              );
                              return false;
                            }
                            const serverId =
                              document.getElementById("swal-server").value;

                            if (!serverId) {
                              Swal.showValidationMessage(
                                "Please choose a target server.",
                              );
                              return false;
                            }

                            return {
                              name,
                              price: parseFloat(price),
                              category: useType,
                              durationType: contractType,
                              cpu,
                              // القيم صارت أرقام GB مباشرة بدل parseInt على نص
                              ram: parseInt(ram, 10),
                              storage: parseInt(storage, 10),
                              serverId,
                            };
                          },
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            try {
                              await packageService.createPackage(result.value);

                              Swal.fire(
                                "Deployed! 🎉",
                                "Package created successfully.",
                                "success",
                              );

                              await loadPackages();
                            } catch (error) {
                              Swal.fire(
                                "Error",
                                error.response?.data?.message ||
                                  "Package creation failed",
                                "error",
                              );
                            }
                          }
                        });
                      }}
                      disabled={serversLoading || serversList.length === 0}
                      className="admin-action-btn unban-btn"
                      style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                    >
                      <i className="fa-solid fa-plus"></i> Add New Package
                    </button>
                  </div>

                  {/* فلاتر العقد وفئة الباقة المزدوجة */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      background: "#f8fafc",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          color: "#475569",
                          minWidth: "150px",
                        }}
                      >
                        Contract Model:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        {[
                          { value: "monthly", label: "Monthly Rent" },
                          { value: "yearly", label: "Yearly Rent" },
                          { value: "purchase", label: "Permanent Buy" },
                        ].map((pill) => (
                          <button
                            key={pill.value}
                            onClick={() => setContractFilter(pill.value)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              background:
                                contractFilter === pill.value
                                  ? "#ca1f91"
                                  : "#e2e8f0",
                              color:
                                contractFilter === pill.value
                                  ? "#fff"
                                  : "#475569",
                              transition: "0.2s",
                            }}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          color: "#475569",
                          minWidth: "150px",
                        }}
                      >
                        Package Tier Filter:
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        {[
                          { value: "economic", label: "Economy" },
                          { value: "medium", label: "Medium" },
                          { value: "large", label: "Large" },
                          { value: "professional", label: "Professional" },
                        ].map((pill) => (
                          <button
                            key={pill.value}
                            onClick={() => setDealFilter(pill.value)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              background:
                                dealFilter === pill.value
                                  ? "#1e1b4b"
                                  : "#e2e8f0",
                              color:
                                dealFilter === pill.value ? "#fff" : "#475569",
                              transition: "0.2s",
                            }}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ==================== جدول جرد الباقات المنظم (تم حذف عمود الباندويث بالكامل) ==================== */}
                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>Package Name</th>
                        <th>CPU Cores</th>
                        <th>RAM Bounds</th>
                        <th>Storage Size</th>
                        <th>Pricing Metrics</th>
                        <th style={{ textAlign: "center" }}>
                          Management Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPackages.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              textAlign: "center",
                              padding: "30px",
                              color: "#94a3b8",
                              fontSize: "0.9rem",
                            }}
                          >
                            No active package profiles align with the current
                            structural filter parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredPackages.map((pkg) => {
                          const finalUse =
                            pkg.category ||
                            pkg.useType ||
                            pkg.usage ||
                            "economy";
                          const finalContract =
                            pkg.durationType ||
                            pkg.contractType ||
                            pkg.dealType ||
                            "monthly";

                          return (
                            <tr key={pkg._id} className="admin-user-row">
                              <td className="admin-user-cell admin-user-name">
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                  }}
                                >
                                  <span style={{ fontWeight: "600" }}>
                                    {pkg.name}
                                  </span>
                                  <div style={{ display: "flex", gap: "5px" }}>
                                    <span className="status-badge">
                                      {finalUse}
                                    </span>
                                    <span className="status-badge">
                                      {finalContract === "purchase"
                                        ? "Lifetime"
                                        : finalContract}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="admin-user-cell">
                                <i
                                  className="fa-solid fa-microchip"
                                  style={{
                                    marginRight: "6px",
                                    color: "#ca1f91",
                                  }}
                                ></i>
                                {pkg.cpu || "2 Cores vCPU"}
                              </td>

                              <td className="admin-user-cell">
                                <i
                                  className="fa-solid fa-memory"
                                  style={{
                                    marginRight: "6px",
                                    color: "#673de6",
                                  }}
                                ></i>
                                {pkg.ram}GB
                              </td>

                              <td className="admin-user-cell">
                                <i
                                  className="fa-solid fa-hard-drive"
                                  style={{
                                    marginRight: "6px",
                                    color: "#8b5cf6",
                                  }}
                                ></i>
                                {pkg.storage}GB
                              </td>

                              <td
                                className="admin-user-cell"
                                style={{ fontWeight: "700", color: "#ca1f91" }}
                              >
                                ${pkg.price}
                                {finalContract === "purchase"
                                  ? " once"
                                  : finalContract === "yearly"
                                    ? " /yr"
                                    : " /mo"}
                              </td>

                              <td
                                className="admin-user-cell"
                                style={{ textAlign: "center" }}
                              >
                                <button
                                  onClick={() => {
                                    Swal.fire({
                                      title: "Purge Server Configuration?",
                                      text: `Are you sure you want to permanently delete [${pkg.name}]?`,
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonColor: "#dc3545",
                                      confirmButtonText: "Yes, Delete",
                                    }).then(async (result) => {
                                      if (result.isConfirmed) {
                                        await packageService.deletePackage(
                                          pkg._id,
                                        );
                                        setGlobalCatalog((prev) =>
                                          prev.filter((p) => p._id !== pkg._id),
                                        );
                                        Swal.fire(
                                          "Purged!",
                                          "Package removed successfully.",
                                          "success",
                                        );
                                      }
                                    });
                                  }}
                                  className="admin-action-btn ban-btn"
                                >
                                  <i className="fa-solid fa-trash-can"></i>{" "}
                                  Delete Package
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. قسم سجل المبيعات والطلبات الحقيقي */}
          {adminTab === "orders" && (
            <div className="admin-tab-content animate-fade">
              <h2>
                Pending Virtual Instance Provisioning Queue{" "}
                <span>Sales & Transactions</span>
              </h2>
              <p className="admin-sub-title">
                Evaluate inward user transactions, check accounting logs, and
                confirm provisioning routines.
              </p>

              {ordersLoading ? (
                <div className="no-data-box">
                  <h3>Loading the provisioning queue...</h3>
                </div>
              ) : pendingOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order Identifier</th>
                        <th>Client Reference</th>
                        <th>Target Architecture</th>
                        <th>Procurement Profile</th>
                        <th>Transaction Sum</th>
                        <th>Gateway Method</th>
                        <th>System Authorization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: "700", color: "#673de6" }}>
                            {order._id}
                          </td>
                          <td>{order.userId?.name || "Unknown Client"}</td>
                          <td>
                            {" "}
                            {order.item
                              ?.map((item) => item.packageId?.name)
                              .filter(Boolean)
                              .join(", ") || "Unknown Package"}{" "}
                          </td>
                          <td>
                            <span
                              className={`deal-type-badge ${order.item?.[0]?.type || ""}`}
                            >
                              {order.item?.[0]?.type === "buy"
                                ? "💎 Lifetime Purchase"
                                : "⏰ Monthly Rental"}
                            </span>
                          </td>
                          <td style={{ fontWeight: "700" }}>
                            ${" "}
                            {order.item?.reduce(
                              (sum, item) => sum + Number(item.price || 0),
                              0,
                            )}
                          </td>
                          <td>
                            <span className="pay-method-badge">
                              {order.methodPayment}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-admin-approve"
                              onClick={() =>
                                handleApproveOrder(
                                  order._id,
                                  order.userId?.name,
                                  order.item
                                    ?.map((item) => item.packageId?.name)
                                    .filter(Boolean)
                                    .join(", "),
                                  order.item?.[0]?.type,
                                  order.item?.reduce(
                                    (sum, item) =>
                                      sum + Number(item.price || 0),
                                    0,
                                  ),
                                  order.createdAt,
                                )
                              }
                            >
                              Authorize Node Provisioning{" "}
                              <i className="fa-solid fa-bolt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data-box">
                  <i
                    className="fa-solid fa-circle-check text-success"
                    style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      display: "block",
                    }}
                  ></i>
                  <h3>Provisioning Queue Fully Processed</h3>
                  <p>
                    All outstanding node subscription payments cleared. Pipeline
                    idle.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================== 4. قسم إدارة المستخدمين التفاعلي والنظامي (تم إحاطته بالشرط بنجاح) ==================== */}
          {adminTab === "users" && (
            <div className="admin-tab-content animate-fade">
              <div className="admin-user-management-card">
                <h2 className="admin-card-title">
                  Manage Users & Account Status
                </h2>

                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Current Status</th>
                      <th style={{ textAlign: "center" }}>Actions / Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((client) => (
                      <tr
                        key={client._id}
                        className={`admin-user-row ${!client.active ? "banned-row" : ""}`}
                      >
                        <td className="admin-user-cell admin-user-name">
                          {client.name}
                        </td>
                        <td className="admin-user-cell admin-user-email">
                          {client.email}
                        </td>

                        {/* عرض حالة المستخدم الحركية ببدج ناعم */}
                        <td className="admin-user-cell">
                          <span
                            className={`status-badge ${!client.active ? "banned-badge" : "active-badge"}`}
                          >
                            {!client.active ? "Banned" : "Active"}
                          </span>
                        </td>

                        {/* أزرار التحكم الفعّالة التي تقوم بقلب وتغيير الحالة فوراً عند الضغط */}
                        <td
                          className="admin-user-cell"
                          style={{ textAlign: "center" }}
                        >
                          <button
                            onClick={() =>
                              handleToggleBan(client._id, client.active)
                            }
                            className={`admin-action-btn ${!client.active ? "unban-btn" : "ban-btn"}`}
                          >
                            <i
                              className={`fa-solid ${!client.active ? "fa-user-check" : "fa-user-slash"}`}
                            ></i>
                            {!client.active ? "Unban User" : "Ban User"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* 5. قسم تذاكر الدعم الفني الحقيقي والمربوط بصفحة الاتصال (المعاينة والأرشفة الفورية) */}
          {adminTab === "tickets" && (
            <div className="admin-tab-content animate-fade">
              <h2>
                Active System Support Queue <span>Support Desk</span>
              </h2>
              <p className="admin-sub-title">
                Address current user interface tickets transmitted through
                client contact nodes.
              </p>

              {ticketsLoading ? (
                <div className="no-data-box">
                  <h3>Loading support tickets...</h3>
                </div>
              ) : ticketsError ? (
                <div className="no-data-box">
                  <h3>Could not load tickets</h3>
                  <p>{ticketsError}</p>
                </div>
              ) : incomingTickets.length > 0 ? (
                <div
                  className="admin-tickets-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  {incomingTickets.map((ticket) => (
                    <div
                      className="admin-ticket-card"
                      key={ticket._id}
                      style={{
                        background: "#fff",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        className="admin-ticket-header"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          className="tk-number"
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            color: "#64748b",
                          }}
                        >
                          Support Record Reference #{ticket._id}
                        </span>
                        <span
                          className="tk-priority normal"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: "#ffe4e6",
                            color: "#b91c1c",
                          }}
                        >
                          Urgency Index: Normal
                        </span>
                      </div>

                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          color: "#1e1b4b",
                          fontSize: "1.1rem",
                          fontWeight: "700",
                        }}
                      >
                        Subject Frame: Support Request
                      </h4>
                      <p
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Origin Address Log:{" "}
                        <b style={{ color: "#1e1b4b" }}>{ticket.email}</b>
                      </p>

                      {/* صندوق استعراض رسالة وملاحظة العميل بوضوح */}
                      <p
                        style={{
                          background: "#f5f3ff",
                          padding: "15px",
                          borderRadius: "8px",
                          borderLeft: "4px solid #673de6",
                          color: "#1e1b4b",
                          marginTop: "10px",
                          fontSize: "0.9rem",
                          lineHeight: "1.5",
                        }}
                      >
                        <b>Client Feedback Log Structure:</b> {ticket.message}
                      </p>

                      {/* منطقة الإجراء الجديد: زر الإغلاق والأرشفة الفوري السلس دون الحاجة لرد كودى */}
                      <div
                        className="admin-ticket-actions"
                        style={{
                          marginTop: "20px",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="admin-action-btn unban-btn"
                          onClick={() => handleArchiveTicket(ticket._id)}
                          style={{
                            padding: "8px 16px",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-box-archive"></i> Close &
                          Archive Record
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* واجهة صندوق الأمان في حال خلو طابور الدعم الفني من المشاكل */
                <div
                  className="no-data-box"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                  }}
                >
                  <i
                    className="fa-solid fa-envelope-open text-muted"
                    style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      display: "block",
                      color: "#94a3b8",
                    }}
                  ></i>
                  <h3 style={{ color: "#1e1b4b", fontWeight: "700" }}>
                    Communications Repository Clear
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                    No active troubleshooting records found in system queue
                    stacks.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 6. قسم مراقبة التقييمات والمراجعات */}
          {adminTab === "reviews" && (
            <div className="admin-tab-content animate-fade">
              <h2>
                Testimonial Review Matrix System <span>Platform Reviews</span>
              </h2>
              <p className="admin-sub-title">
                Audit user score arrays. Global Application Index Mean:{" "}
                <strong style={{ color: "#ca1f91" }}>{averageRating} ★</strong>{" "}
                across {userReviews.length} live submissions.
              </p>

              <div className="admin-rating-summary-banner mb-4">
                <div className="rating-score-box">
                  <h3>
                    {averageRating} <span>/ 5</span>
                  </h3>
                  <p>Current Application Evaluation Rating Score</p>
                </div>
                <div className="rating-stars-stars">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star-half-stroke"></i>
                  <span>
                    Database Log Count: {userReviews.length} Active Records
                  </span>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="no-data-box" style={{ marginTop: "20px" }}>
                  <h3>Loading customer reviews...</h3>
                </div>
              ) : reviewsError ? (
                <div className="no-data-box" style={{ marginTop: "20px" }}>
                  <h3>Could not load reviews</h3>
                  <p>{reviewsError}</p>
                </div>
              ) : userReviews.length > 0 ? (
                <div className="admin-reviews-list-grid">
                  {userReviews.map((review) => (
                    <div className="admin-review-item-card" key={review._id}>
                      <div className="review-item-header">
                        <div className="review-user-info">
                          <div className="avatar-mini">
                            {(review.userId?.name || "User")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h5>{review.userId?.name || "Unknown User"}</h5>
                            <span className="review-date-tag">
                              {review.createdAt
                                ? new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="review-stars-gold">
                          {[...Array(Number(review.rate || 0))].map((_, i) => (
                            <i key={i} className="fa-solid fa-star"></i>
                          ))}
                        </div>
                      </div>
                      <p className="review-text-paragraph">
                        "{review.comment}"
                      </p>
                      <div className="review-action-footer">
                        <button
                          className="btn-delete-review-admin"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          Delete Review
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-box" style={{ marginTop: "20px" }}>
                  <i
                    className="fa-solid fa-comment-slash text-muted"
                    style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      display: "block",
                    }}
                  ></i>
                  <h3>No Customer Feedback Logged</h3>
                  <p>
                    Testimonial array buffer is clear. No active ratings
                    submitted yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
