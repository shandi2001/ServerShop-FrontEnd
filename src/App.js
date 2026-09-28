import React from 'react';
import './App.css';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './Components/navbar';
import Footer from './Components/footer';
import Home from './pages/index';
import Servers from './pages/servers'; 
import Payments from './pages/payment';
import Contact from './pages/contact';
import Dashboard from "./Components/Dashboard";
import Register from './pages/register';
import Cart from './pages/cart';
import Faqs from './Components/faqs';
import AdminDashboard from './pages/AdminDashboard'; 
import NotificationsPage from './pages/notification';

// حراسة المسارات وقت الرندر، حتى لا تظهر لوحة الأدمن للحظة قبل التحويل
const readUser = () => {
  try {
    const saved = localStorage.getItem('servergo_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const RequireAuth = ({ children }) => {
  const user = readUser();
  return user ? children : <Navigate to="/" replace />;
};

const RequireAdmin = ({ children }) => {
  const user = readUser();
  return user?.role === 'ADMIN' ? children : <Navigate to="/" replace />;
};

function App() {
  const location = useLocation();
  const hideNavAndFooterRoutes = ['/register', '/admin-dashboard'];
  const shouldHide = hideNavAndFooterRoutes.includes(location.pathname);

  return (
    <div className="app-container">
    
      {/* عرض الناف بار فقط إذا لم يكن المسار الحالي ضمن مسارات الإخفاء */}
      {!shouldHide && <Navbar />}
      
      <main className="main-content">
        <Routes>
          {/* 🌟 Home page route including the Testimonials component below it */}
          <Route 
            path="/" 
            element={
              <>
                <Home />
             
              </>
            } 
          />
          
          <Route path="/servers" element={<Servers />} />
          <Route path="/payment" element={<Payments />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <Cart />
              </RequireAuth>
            }
          />
          <Route path="/faqs" element={<Faqs />} />
          
          {/* Admin Dashboard Route */}
          <Route
            path="/admin-dashboard"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
      
      {/* عرض الفوتر فقط إذا لم يكن المسار الحالي ضمن مسارات الإخفاء */}
      {!shouldHide && <Footer />}
    </div>
  );
}

export default App;