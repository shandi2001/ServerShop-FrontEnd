import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./payment.css";
import shamcash from "../Assets/shamcash.jpg";
import syriatel from "../Assets/syriatelcash.jpg";
import orderService from "../services/orderService";
import { getCartKey, readCart } from "../utils/cart";

const Payment = () => {
  const navigate = useNavigate();

  // تحديد طريقة الدفع النشطة (الافتراضي سيرياتيل كاش)
  const [paymentMethod, setPaymentMethod] = useState("syriatel");

  // حالات الفورم لإدخال بيانات التحويل
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("servergo_user");

    if (!savedUser) {
      setUser(null);
      setCartItems([]);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      const currentCartItems = readCart(parsedUser);

      setUser(parsedUser);
      setCartItems(currentCartItems);
    } catch (error) {
      setUser(null);
      setCartItems([]);
    }
  }, []);

  const canProceedToPayment = Boolean(user) && cartItems.length > 0;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file && file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Image too large",
        text: "Please choose an image smaller than 2MB.",
        confirmButtonColor: "#673de6",
      });

      e.target.value = "";
      setScreenshot(null);
      return;
    }

    setScreenshot(file || null);
  };
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!transactionId) {
      Swal.fire({
        icon: "error",
        title: "Sorry",
        text: "Please enter the transaction ID.",
        confirmButtonColor: "#673de6",
      });
      return;
    }

    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Login required",
        text: "You must sign in to your account before making a payment.",
        confirmButtonColor: "#673de6",
      }).then(() => {
        navigate("/");
      });

      return;
    }

    if (!cartItems.length) {
      Swal.fire({
        icon: "error",
        title: "Cart is empty",
        text: "Please add at least one item to your cart before paying.",
        confirmButtonColor: "#673de6",
      }).then(() => {
        navigate("/cart");
      });

      return;
    }

    try {
      const orderItems = cartItems.map((item) => {
        const type = item.dealType || item.type;

        const orderItem = {
          packageId: item.packageId || item.id,
          price: Number(item.price),
          type,
        };

        if (type === "rent") {
          if (!item.duration || Number(item.duration) <= 0) {
            throw new Error(
              `Duration is missing for rented package: ${item.name}`,
            );
          }

          orderItem.duration = Number(item.duration);
        }

        return orderItem;
      });

      const orderData = {
        methodPayment:
          paymentMethod === "syriatel" ? "syriatelCash" : "shamCash",

        paymentNumber: transactionId,

        item: orderItems,
      };

      // صورة إشعار الدفع تنبعت مع الطلب بدل ما تبقى بالـ state بدون استخدام
      await orderService.createOrder(orderData, screenshot);

      Swal.fire({
        icon: "success",
        title: "Order successfully sent",
        text: "Your payment notification has been sent successfully. The administrator will review your order and activate your server.",
        confirmButtonText: "OK",
        confirmButtonColor: "#3de672",
      }).then(() => {
        localStorage.removeItem(getCartKey(user));

        setCartItems([]);
        setTransactionId("");
        setScreenshot(null);

        navigate("/");
      });
    } catch (error) {
      console.error("❌ CREATE ORDER ERROR:", error);

      console.error("❌ BACKEND RESPONSE:", error.response?.data);

      Swal.fire({
        icon: "error",
        title: "Order failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while creating your order.",
        confirmButtonColor: "#673de6",
      });
    }
  };

  return (
    <div className="payment-container">
      {/*======payment section header======== */}
      <div className="payment-header text-center mb-5">
        <h2>
          <span>
            <i className="fa-solid fa-credit-card"></i> Elcetronic payment{" "}
          </span>
          gateway
        </h2>
        <p>choose ur favourite way to pay to activate ur account....</p>
      </div>
      {/*======payment section method selector======== */}
      <div className="payment-methods-slider">
        <div className={`slider-glider ${paymentMethod}`}></div>
        <div
          className={`method-tab ${paymentMethod === "syriatel" ? "active" : ""}`}
          onClick={() => setPaymentMethod("syriatel")}
        >
          <i className="fa-solid fa-mobile-screen-button"></i>
          <span> Syriatel Cash</span>
        </div>
        <div
          className={`method-tab ${paymentMethod === "cham" ? "active" : ""}`}
          onClick={() => setPaymentMethod("cham")}
        >
          <i className="fa-solid fa-wallet"></i>
          <span>Cham Cash</span>
        </div>
      </div>

      <div className="payment-details-box animate-fade">
        {paymentMethod === "syriatel" ? (
          <div className="method-info-content">
            <div className="info-text-side">
              <h3>
                <i className="fa-solid fa-circle-info"></i>payment steps via
                <span>Syriatel Cash</span>
              </h3>
              <ol className="steps-list">
                <li>
                  open contact menu and request number <b>*100#</b> or use{" "}
                  <b>أقرب اليك</b>app.
                </li>
                <li>
                  choose this service <b> money transfer</b>.
                </li>
                <li>
                  Enter your merchant account number for our platform:{" "}
                  <strong className="account-num">0981217020</strong>
                </li>
                <li>enter the total price of choice that u want to pay</li>
                <li>
                  Confirm the transaction by entering your secret code, and keep
                  the transaction ID.
                </li>
              </ol>
            </div>

            <div className="qr-code-side">
              <h4>for direct payment scan QR</h4>
              <div className="qr-wrapper">
                <img src={syriatel} alt="Syriatel Cash QR" />
              </div>
            </div>
          </div>
        ) : (
          <div className="method-info-content">
            <div className="info-text-side">
              <h3>
                <i className="fa-solid fa-circle-info"></i>payment steps via{" "}
                <span>Cham Cash</span>
              </h3>
              <ol className="steps-list">
                <li>
                  open app<b>Cham Cash </b>on your mobile
                </li>
                <li>
                  Select a service from the main interface<b> scan QR</b> or{" "}
                  <b>Manual conversion </b>.
                </li>
                <li>
                  If you chose manual conversion, enter your wallet number for
                  our company:{" "}
                  <strong className="account-num">CHAM-0981217020</strong>
                </li>
                <li>
                  Select the amount you wish to transfer that matches your
                  server package.
                </li>
                <li>
                  Press Send, and take a screenshot (Screenshot) to confirm the
                  success of the transaction.
                </li>
              </ol>
            </div>

            <div className="qr-code-side">
              <h4>amend the QR code for direct payment</h4>
              <div className="qr-wrapper">
                <img src={shamcash} alt="Cham Cash QR" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="payment-confirmation-form">
        <h3>
          <i className="fa-solid fa-receipt"></i> Confirm and send payment
          notification
        </h3>
        <p className="form-note">
          Please fill in the following fields after completing the financial
          transfer process so that the system can automatically activate the
          service.
        </p>

        {!canProceedToPayment && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            }}
          >
            {user
              ? "Please add at least one item to your cart before making a payment."
              : "Please sign in to your account before making a payment."}
          </div>
        )}

        <form onSubmit={handlePaymentSubmit}>
          <div className="form-inputs-grid">
            <div className="pay-input-group">
              <label>Conversion code (Transaction ID) *</label>
              <div className="pay-input-icon-wrapper">
                <i className="fa-solid fa-asterisk"></i>
                <input
                  type="text"
                  placeholder="ex:14589632"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  disabled={!canProceedToPayment}
                />
              </div>
            </div>

            <div className="pay-input-group">
              <label>upload notice image / screenshot (oprtional)</label>
              <div className="pay-input-icon-wrapper">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!canProceedToPayment}
                />
              </div>
            </div>
          </div>

          <div className="payment-buttons-actions">
            <button
              type="submit"
              className="btn-confirm-payment"
              disabled={!canProceedToPayment}
            >
              <i className="fa-solid fa-circle-check"></i>Confirm payment and
              activate server{" "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;
