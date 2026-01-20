import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const razorpay_order_id = searchParams.get("razorpay_order_id");
    const razorpay_payment_id = searchParams.get("razorpay_payment_id");
    const razorpay_signature = searchParams.get("razorpay_signature");

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      navigate("/");  
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await axios.post(
          `${url}/api/order/verify`,
          {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          }
        );

        if (response.data.success) {
          navigate("/myorders"); // payment success
        
        } else {
          navigate("/"); // payment failed → home
        }
      } catch (error) {
        console.error("Verification failed", error);
        navigate("/"); // error → home
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Verifying payment, please wait...</p>
    </div>
  );
};

export default Verify;
