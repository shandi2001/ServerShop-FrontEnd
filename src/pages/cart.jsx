import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./cart.css";
import { readCart, writeCart, readCurrentUser } from "../utils/cart";

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    const user = readCurrentUser();
    return user ? readCart(user) : [];
  });

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );
    setTotalPrice(total);

    const user = readCurrentUser();
    if (user) writeCart(user, cartItems);
  }, [cartItems]);

  const handleDeleteItem = (cartId, name) => {
    Swal.fire({
      title: "Are you sure?",
      text: `${name} will be removed from your cart.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fd0d11",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems(cartItems.filter((item) => item.cartId !== cartId));
        Swal.fire({
          title: "Removed!",
          text: "The server was removed from your cart.",
          icon: "success",
          confirmButtonColor: "#673de6",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleCheckout = () => {
    Swal.fire({
      title: "Redirecting to checkout",
      text: `You will now be redirected to pay the $${totalPrice} invoice using the available payment methods.`,
      icon: "info",
      confirmButtonColor: "#673de6",
      timer: 2000,
      showConfirmButton: false,
    });

    setTimeout(() => {
      navigate("/payment");
    }, 2000);
  };

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        <div className="cart-header">
          <h2>
            <i className="fa-solid fa-cart-shopping"></i> Shopping{" "}
            <span>Cart</span>
          </h2>
          <p>
            Review the details and prices of your selected cloud servers before
            checkout.
          </p>
        </div>

        {cartItems.length > 0 ? (
          <div className="cart-content-layout">
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div className="cart-item-card animate-fade" key={item.cartId}>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <ul className="item-specs-tags">
                      <li>
                        <i className="fa-solid fa-microchip"></i> {item.ram}
                      </li>
                      <li>
                        <i className="fa-solid fa-hard-drive"></i>{" "}
                        {item.storage}
                      </li>
                      <li>
                        <i className="fa-solid fa-processor"></i> {item.cpu}
                      </li>
                    </ul>
                  </div>

                  <div className="item-price-delete-zone">
                    <span className="item-price">${item.price}</span>
                    <button
                      className="btn-delete-item"
                      onClick={() => handleDeleteItem(item.cartId, item.name)}
                      title="Remove from cart"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Reserved services:</span>
                <strong>
                  {cartItems.length} package{cartItems.length === 1 ? "" : "s"}
                </strong>
              </div>

              <div
                className="summary-divider"
                style={{ margin: "20px 0" }}
              ></div>

              <div className="summary-row total">
                <span>Total payment:</span>
                <span className="total-price-text">${totalPrice}.00</span>
              </div>

              <button className="btn-proceed-checkout" onClick={handleCheckout}>
                Proceed to checkout <i className="fa-solid fa-arrow-right"></i>
              </button>

              <p className="secure-note">
                <i className="fa-solid fa-shield-halved"></i> Secure booking
                through SERVER GO.
              </p>
            </div>
          </div>
        ) : (
          <div className="empty-cart-box animate-fade">
            <div className="empty-icon">
              <i className="fa-solid fa-basket-shopping"></i>
            </div>
            <h3>Your shopping cart is empty!</h3>
            <p>
              You have not added any servers or cloud hosting plans to your cart
              yet.
            </p>
            <button
              className="btn-back-shop"
              onClick={() => navigate("/servers")}
            >
              Browse server plans <i className="fa-solid fa-server"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
