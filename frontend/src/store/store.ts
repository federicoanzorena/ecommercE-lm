import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

// Cargar estado inicial desde localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("cart");
    if (serializedState === null) {
      return undefined;
    }
    return { cart: JSON.parse(serializedState) };
  } catch (err) {
    return undefined;
  }
};

// Guardar estado en localStorage
const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state.cart);
    localStorage.setItem("cart", serializedState);
  } catch {
    // ignore
  }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: loadState(),
});

// Persistir cambios en localStorage
store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
