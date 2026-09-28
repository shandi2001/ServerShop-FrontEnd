import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./contact.css";
import contactService from "../services/contactService";

const Contact = () => {
  // الفورم بيعرض الإيميل والرسالة فقط، والباك بيستقبل الرسالة ويأخذ
  // الإيميل من الحساب المسجل، فما في داعي لحقول subject/name وهمية
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("servergo_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Message required",
        text: "Please write your message first.",
        confirmButtonColor: "#409e2e",
      });
      return;
    }

    try {
      await contactService.createContact(formData.message.trim());

      Swal.fire({
        icon: "success",
        title: "Sent successfully",
        text: "Your support ticket has been sent successfully.",
        confirmButtonText: "OK",
        confirmButtonColor: "#409e2e",
      });

      setFormData((prev) => ({ ...prev, message: "" }));
    } catch (error) {
      console.error("Failed to send contact:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to send",
        text:
          error?.response?.data?.message ||
          "Something went wrong while sending your message.",
        confirmButtonText: "OK",
        confirmButtonColor: "#fd0d11",
      });
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({ ...prev, message: "" }));
    Swal.fire({
      icon: "info",
      title: "Cancelled",
      text: "Form cleared.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="contact-ticket-container">
      <div className="ticket-header">
        <h2>
          <i className="fa-solid fa-headset"></i> Open{" "}
          <span>Support Ticket</span>
        </h2>
        <p>
          Fill out the fields below, and our tech group will deploy a solution
          for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="ticket-input-group">
          <label>Email Address</label>
          <div className="input-with-icon">
            <i className="fa-solid fa-envelope"></i>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
          </div>
        </div>

        <div className="ticket-input-group full-width">
          <label>Message Details</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write any error logs or explanation here..."
            rows="5"
            required
          ></textarea>
        </div>

        <div className="ticket-form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-ticket-cancel"
          >
            Cancel
          </button>
          <button type="submit" className="btn-ticket-submit">
            Submit Ticket <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Contact;
