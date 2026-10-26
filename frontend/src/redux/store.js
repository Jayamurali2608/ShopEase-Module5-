import { configureStore, createSlice } from "@reduxjs/toolkit";

// Read saved cart safely
const getInitialCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
};

// Read saved login details safely
const getInitialAuth = () => ({
  token: localStorage.getItem("token") || null,
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })(),
});

// Authentication slice
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuth(),
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem(
        "user",
        JSON.stringify(action.payload.user)
      );
    },

    clearCredentials: (state) => {
      state.token = null;
      state.user = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

// Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: getInitialCart(),
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    addToCart: (state, action) => {
      const product = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item._id === product._id &&
          item.size === product.size
      );

      if (existingItem) {
        existingItem.quantity += Number(product.quantity || 1);
      } else {
        state.items.push({
          ...product,
          quantity: Number(product.quantity || 1),
        });
      }

      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    updateQuantity: (state, action) => {
      const { id, size, quantity } = action.payload;

      const item = state.items.find(
        (product) =>
          product._id === id && product.size === size
      );

      if (item && Number(quantity) >= 1) {
        item.quantity = Number(quantity);
      }

      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    removeFromCart: (state, action) => {
      const { id, size } = action.payload;

      state.items = state.items.filter(
        (item) =>
          !(item._id === id && item.size === size)
      );

      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },
  },
});

export const { setCredentials, clearCredentials } =
  authSlice.actions;

export const {
  setCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

// Create the Redux store
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
  },
});

export default store;