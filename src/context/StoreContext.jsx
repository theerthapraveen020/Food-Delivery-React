import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  //ADD TO CART
  const addToCart = async (itemId) => {
    // Frontend update
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
    }));

    // Backend update
    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
    }
  };

  // REMOVE FROM CART
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });

    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
    }
  };

  //TOTAL AMOUNT 
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const itemInfo = food_list.find(
        (product) => product._id === itemId
      );
      if (itemInfo) {
        totalAmount += itemInfo.price * cartItems[itemId];
      }
    }

    return totalAmount;
  };

  // FETCH FOOD
  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data);
  };



  
  //FETCH CART FROM DB 
  const fetchCartData = async (tk) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      {
        headers: {
          Authorization: `Bearer ${tk}`,  
        },
      }
    );
    setCartItems(response.data.cartData || {});
  };

  // INITIAL LOAD 
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await fetchCartData(savedToken);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
