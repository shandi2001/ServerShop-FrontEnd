import axios from "axios";

const API = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true, // ضروري جداً لكي يتم إرسال واستقبال الـ Cookies (مثل الـ JWT Token)
});

/*
 * حالة تسجيل الدخول بالواجهة محفوظة بالـ localStorage بينما الجلسة الحقيقية
 * كوكي على السيرفر. إذا انتهت الجلسة كانت الواجهة تبقى "مسجلة دخول" وكل طلب
 * يرجع 401 بصمت، فهون منظّف الحالة ومنرجع المستخدم للصفحة الرئيسية.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // مسارات تسجيل الدخول واستعادة كلمة السر ترجع 401 بشكل طبيعي
    const isAuthAttempt =
      url.includes("/users/login") ||
      url.includes("/users/forgotPassword") ||
      url.includes("/users/resetPassword");

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem("servergo_user");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default API;
