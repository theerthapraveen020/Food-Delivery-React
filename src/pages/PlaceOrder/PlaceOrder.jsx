import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
    mobileNumber: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  // Redirect to cart if user not logged in or cart is empty
  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  const placeOrder = async (e) => {
    e.preventDefault();

    // Prepare order items
    const orderItems = food_list
      .filter(item => cartItems[item._id] > 0)
      .map(item => ({ ...item, quantity: cartItems[item._id] }));

    if (orderItems.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }
    const orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2, // add delivery fee
    };
    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      }); 

      if (!response.data.success) {
        toast.error("Order failed");
        return;
      }
      const options = {
        key: response.data.key,
        amount: response.data.amount * 100, 
        currency: response.data.currency,
        order_id: response.data.razorpayOrderId,
        name: "Food Delivery App",
        description: "Order Payment",
        handler: function (razorpayRes) {
          toast.success("Payment successful!");
          navigate(
            `/verify?orderId=${response.data.orderId}` +
              `&razorpay_order_id=${razorpayRes.razorpay_order_id}` +
              `&razorpay_payment_id=${razorpayRes.razorpay_payment_id}` +
              `&razorpay_signature=${razorpayRes.razorpay_signature}`
          );
        },
        modal: {
          ondismiss: async function () {
            toast.warning("Payment not completed");
            try {
              await axios.delete(`${url}/api/order/cancel/${response.data.orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } catch (err) {
              console.error(err);
            }
            navigate("/cart");
          },
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.mobileNumber,
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      
      console.error(error);
    }
  };

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Details</p>
        <div className="multi-fields">
          <input required name="firstName" value={data.firstName} onChange={onChangeHandler} placeholder="First Name" />
          <input required name="lastName" value={data.lastName} onChange={onChangeHandler} placeholder="Last Name" />
        </div>
        <input required name="email" type="email" value={data.email} onChange={onChangeHandler} placeholder="Email" />
        <input required name="street" value={data.street} onChange={onChangeHandler} placeholder="Street" />
        <div className="multi-fields">
          <input required name="city" value={data.city} onChange={onChangeHandler} placeholder="City" />
          <input required name="state" value={data.state} onChange={onChangeHandler} placeholder="State" />
        </div>
        <div className="multi-fields">
          <input required name="pinCode" value={data.pinCode} onChange={onChangeHandler} placeholder="PIN Code" />
          <input required name="country" value={data.country} onChange={onChangeHandler} placeholder="Country" />
        </div>
        <input
          required
          name="mobileNumber"
          pattern="\d{10}"
          value={data.mobileNumber}
          onChange={onChangeHandler}
          placeholder="Mobile Number"
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details"><p>Subtotal</p><p>₹{getTotalCartAmount()}</p></div>
          <hr />
          <div className="cart-total-details"><p>Delivery Fee</p><p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p></div>
          <hr />
          <div className="cart-total-details"><b>Total</b><b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b></div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
